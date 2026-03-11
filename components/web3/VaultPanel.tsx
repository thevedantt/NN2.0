"use client";

import React from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Shield, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

export function VaultPanel() {
    const { walletAddress } = useWeb3();

    if (!walletAddress) {
        return (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Secure Vault</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Connect your wallet to enable encrypted blockchain-backed chat storage.
                </p>
            </div>
        );
    }

    return (
        <Link href="/web3-vault">
            <div className="rounded-xl border border-violet-500/30 p-4
                            bg-gradient-to-br from-violet-500/10 to-indigo-500/10
                            hover:from-violet-500/20 hover:to-indigo-500/20
                            transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-violet-400" />
                        <span className="text-sm font-semibold text-violet-300">🔒 Secure Vault</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-muted-foreground">
                    Your chats are encrypted and stored on IPFS with blockchain access control.
                </p>
            </div>
        </Link>
    );
}
