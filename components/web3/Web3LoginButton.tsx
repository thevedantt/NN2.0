"use client";

import React from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Shield, Wallet, Loader2, LogOut } from "lucide-react";

export function Web3LoginButton() {
    const { walletAddress, isWeb3Ready, isConnecting, connectWallet, disconnectWallet } = useWeb3();

    if (!isWeb3Ready) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Initializing Web3...</span>
            </div>
        );
    }

    if (walletAddress) {
        return (
            <div className="flex flex-col gap-1 px-3 py-2">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500">Wallet Connected</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                    <button
                        onClick={disconnectWallet}
                        className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                        title="Disconnect wallet"
                    >
                        <LogOut className="h-3 w-3" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-md
                       bg-gradient-to-r from-violet-600 to-indigo-600 text-white
                       hover:from-violet-700 hover:to-indigo-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
        >
            {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Wallet className="h-4 w-4" />
            )}
            <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
        </button>
    );
}
