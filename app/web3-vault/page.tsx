"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { storeRecordOnChain, getRecordsFromChain } from "@/lib/web3/contract";
import {
    Shield, Lock, Loader2, Upload, Download, ChevronDown, ChevronUp,
    ExternalLink, Database, Clock, CheckCircle2, AlertCircle
} from "lucide-react";

interface ChatRecord {
    cid: string;
    data?: any;
    loading?: boolean;
    expanded?: boolean;
}

export default function Web3VaultPage() {
    const { walletAddress, isWeb3Ready, connectWallet, getProvider } = useWeb3();
    const [records, setRecords] = useState<ChatRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [uploading, setUploading] = useState(false);
    const [storing, setStoring] = useState(false);
    const [lastCid, setLastCid] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");

    const showStatus = (msg: string, type: "success" | "error" | "info" = "info") => {
        setStatusMessage(msg);
        setStatusType(type);
        setTimeout(() => setStatusMessage(null), 5000);
    };

    // Fetch records from smart contract
    const fetchRecords = useCallback(async () => {
        if (!walletAddress) return;
        setLoading(true);
        try {
            const provider = getProvider();
            if (!provider) {
                showStatus("Web3 provider not available", "error");
                return;
            }
            const cids = await getRecordsFromChain(provider);
            setRecords(cids.map(cid => ({ cid })));
        } catch (error) {
            console.error("Failed to fetch records:", error);
            showStatus("Failed to fetch records from blockchain", "error");
        } finally {
            setLoading(false);
        }
    }, [walletAddress, getProvider]);

    useEffect(() => {
        if (walletAddress) {
            fetchRecords();
        }
    }, [walletAddress, fetchRecords]);

    // Step 1: Upload chat to IPFS
    const handleUploadToIPFS = async () => {
        if (!sessionId) {
            showStatus("Enter a session ID", "error");
            return;
        }
        setUploading(true);
        try {
            const res = await fetch("/api/web3/ipfs/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: parseInt(sessionId) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setLastCid(data.cid);
            showStatus(`Uploaded to IPFS! CID: ${data.cid}`, "success");
        } catch (error: any) {
            showStatus(error.message || "Upload failed", "error");
        } finally {
            setUploading(false);
        }
    };

    // Step 2: Store CID on blockchain
    const handleStoreOnChain = async () => {
        if (!lastCid) return;
        setStoring(true);
        try {
            const provider = getProvider();
            if (!provider) throw new Error("Wallet not connected");
            const txHash = await storeRecordOnChain(provider, lastCid);
            showStatus(`Stored on blockchain! Tx: ${txHash.slice(0, 10)}...`, "success");
            setLastCid(null);
            setSessionId("");
            fetchRecords(); // Refresh
        } catch (error: any) {
            showStatus(error.message || "Blockchain storage failed", "error");
        } finally {
            setStoring(false);
        }
    };

    // Decrypt and view a record
    const handleDecrypt = async (index: number) => {
        const record = records[index];
        if (record.data) {
            // Toggle expand
            setRecords(prev => prev.map((r, i) =>
                i === index ? { ...r, expanded: !r.expanded } : r
            ));
            return;
        }

        setRecords(prev => prev.map((r, i) =>
            i === index ? { ...r, loading: true } : r
        ));

        try {
            const res = await fetch("/api/web3/ipfs/retrieve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cid: record.cid, walletAddress }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            setRecords(prev => prev.map((r, i) =>
                i === index ? { ...r, data: result.data, loading: false, expanded: true } : r
            ));
        } catch (error: any) {
            showStatus(error.message || "Decryption failed", "error");
            setRecords(prev => prev.map((r, i) =>
                i === index ? { ...r, loading: false } : r
            ));
        }
    };

    // Not connected state
    if (!walletAddress) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600
                                    flex items-center justify-center">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Secure Vault</h1>
                    <p className="text-muted-foreground">
                        Connect your wallet to access encrypted, blockchain-backed chat storage.
                        Your data is encrypted with your wallet key — only you can decrypt it.
                    </p>
                    <button
                        onClick={connectWallet}
                        disabled={!isWeb3Ready}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600
                                   text-white font-medium hover:from-violet-700 hover:to-indigo-700
                                   disabled:opacity-50 transition-all"
                    >
                        {isWeb3Ready ? "Connect Wallet" : "Initializing..."}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600
                                    flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Secure Vault</h1>
                        <p className="text-xs text-muted-foreground font-mono">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </p>
                    </div>
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                        statusType === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                        statusType === "error" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                    }`}>
                        {statusType === "success" ? <CheckCircle2 className="h-4 w-4" /> :
                         statusType === "error" ? <AlertCircle className="h-4 w-4" /> :
                         <Database className="h-4 w-4" />}
                        {statusMessage}
                    </div>
                )}

                {/* Upload Section */}
                <div className="rounded-xl border border-violet-500/30 p-6
                                bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Upload className="h-5 w-5 text-violet-400" />
                        Store Chat Session
                    </h2>
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <label className="text-sm text-muted-foreground mb-1 block">Session ID</label>
                            <input
                                type="number"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                placeholder="Enter chat session ID"
                                className="w-full px-3 py-2 rounded-lg bg-background border border-border
                                           text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                        {!lastCid ? (
                            <button
                                onClick={handleUploadToIPFS}
                                disabled={uploading || !sessionId}
                                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium
                                           hover:bg-violet-700 disabled:opacity-50 transition-all
                                           flex items-center gap-2"
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {uploading ? "Encrypting..." : "Encrypt & Upload"}
                            </button>
                        ) : (
                            <button
                                onClick={handleStoreOnChain}
                                disabled={storing}
                                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium
                                           hover:bg-emerald-700 disabled:opacity-50 transition-all
                                           flex items-center gap-2"
                            >
                                {storing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                                {storing ? "Storing..." : "Store on Blockchain"}
                            </button>
                        )}
                    </div>
                    {lastCid && (
                        <p className="mt-2 text-xs text-emerald-400">
                            ✓ Uploaded to IPFS: <span className="font-mono">{lastCid}</span>
                        </p>
                    )}
                </div>

                {/* Records Section */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Download className="h-5 w-5 text-violet-400" />
                        Your Stored Records
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </h2>

                    {!loading && records.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No records stored yet.</p>
                            <p className="text-sm">Upload a chat session to get started.</p>
                        </div>
                    )}

                    {records.map((record, index) => (
                        <div key={index} className="rounded-xl border border-border p-4 bg-card">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                        <Lock className="h-4 w-4 text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-mono">{record.cid.slice(0, 20)}...</p>
                                        <a
                                            href={`https://gateway.pinata.cloud/ipfs/${record.cid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-violet-400 hover:underline flex items-center gap-1"
                                        >
                                            View on IPFS <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDecrypt(index)}
                                    disabled={record.loading}
                                    className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-xs
                                               hover:bg-violet-600/30 disabled:opacity-50 transition-all
                                               flex items-center gap-1.5"
                                >
                                    {record.loading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : record.expanded ? (
                                        <ChevronUp className="h-3 w-3" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3" />
                                    )}
                                    {record.loading ? "Decrypting..." : record.expanded ? "Hide" : "Decrypt & View"}
                                </button>
                            </div>

                            {record.expanded && record.data && (
                                <div className="mt-4 pt-4 border-t border-border space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Clock className="h-3 w-3" />
                                        Exported: {record.data.exportedAt ? new Date(record.data.exportedAt).toLocaleString() : "N/A"}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto space-y-2">
                                        {record.data.messages?.map((msg: any, mIdx: number) => (
                                            <div
                                                key={mIdx}
                                                className={`p-3 rounded-lg text-sm ${
                                                    msg.sender === "user"
                                                        ? "bg-violet-500/10 border border-violet-500/20 ml-8"
                                                        : "bg-muted/50 mr-8"
                                                }`}
                                            >
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    {msg.sender === "user" ? "You" : "AI Companion"}
                                                </p>
                                                <p>{msg.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
