import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

// Polygon Amoy Testnet chain config
const polygonAmoyChain = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x13882", // 80002 in hex (Polygon Amoy)
    rpcTarget: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology",
    displayName: "Polygon Amoy Testnet",
    blockExplorerUrl: "https://amoy.polygonscan.com",
    ticker: "MATIC",
    tickerName: "MATIC",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
};

let web3authInstance: Web3Auth | null = null;

export function getWeb3AuthInstance(): Web3Auth {
    if (!web3authInstance) {
        web3authInstance = new Web3Auth({
            clientId,
            web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
            chains: [polygonAmoyChain],
        });
    }
    return web3authInstance;
}

export async function initWeb3Auth(): Promise<Web3Auth> {
    const web3auth = getWeb3AuthInstance();
    if (web3auth.status === "not_ready") {
        await web3auth.init();
    }
    return web3auth;
}
