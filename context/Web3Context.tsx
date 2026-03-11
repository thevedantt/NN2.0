"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { initWeb3Auth, getWeb3AuthInstance } from "@/lib/web3/web3auth";
import { BrowserProvider } from "ethers";

interface Web3ContextType {
    walletAddress: string | null;
    isWeb3Ready: boolean;
    isConnecting: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    getProvider: () => any | null;
}

const Web3Context = createContext<Web3ContextType>({
    walletAddress: null,
    isWeb3Ready: false,
    isConnecting: false,
    connectWallet: async () => {},
    disconnectWallet: async () => {},
    getProvider: () => null,
});

export function useWeb3() {
    return useContext(Web3Context);
}

export function Web3Provider({ children }: { children: ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isWeb3Ready, setIsWeb3Ready] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Initialize Web3Auth on mount
    useEffect(() => {
        const init = async () => {
            try {
                const web3auth = await initWeb3Auth();
                setIsWeb3Ready(true);

                // If already connected (e.g. session restored), get address
                if (web3auth.connected && web3auth.provider) {
                    const ethersProvider = new BrowserProvider(web3auth.provider);
                    const signer = await ethersProvider.getSigner();
                    const address = await signer.getAddress();
                    setWalletAddress(address);
                }
            } catch (error) {
                console.error("[Web3] Init failed:", error);
                setIsWeb3Ready(true); // Still mark ready so app doesn't hang
            }
        };
        init();
    }, []);

    const connectWallet = useCallback(async () => {
        try {
            setIsConnecting(true);
            const web3auth = getWeb3AuthInstance();
            const provider = await web3auth.connect();

            if (provider) {
                const ethersProvider = new BrowserProvider(provider);
                const signer = await ethersProvider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);

                // Store wallet address in backend
                try {
                    await fetch("/api/web3/wallet", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ walletAddress: address }),
                    });
                } catch (err) {
                    console.error("[Web3] Failed to store wallet:", err);
                }
            }
        } catch (error) {
            console.error("[Web3] Connect failed:", error);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnectWallet = useCallback(async () => {
        try {
            const web3auth = getWeb3AuthInstance();
            await web3auth.logout();
            setWalletAddress(null);
        } catch (error) {
            console.error("[Web3] Disconnect failed:", error);
        }
    }, []);

    const getProvider = useCallback(() => {
        const web3auth = getWeb3AuthInstance();
        return web3auth.provider;
    }, []);

    return (
        <Web3Context.Provider
            value={{
                walletAddress,
                isWeb3Ready,
                isConnecting,
                connectWallet,
                disconnectWallet,
                getProvider,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
}
