import { NextRequest, NextResponse } from "next/server";
import { decryptData } from "@/lib/web3/encryption";
import { fetchFromIPFS } from "@/lib/web3/ipfs";

/**
 * POST - Fetch encrypted data from IPFS and decrypt it
 * Body: { cid: string, walletAddress: string }
 * Returns: { data: object } (decrypted chat data)
 */
export async function POST(req: NextRequest) {
    try {
        const { cid, walletAddress } = await req.json();

        if (!cid || !walletAddress) {
            return NextResponse.json(
                { error: "cid and walletAddress are required" },
                { status: 400 }
            );
        }

        // Fetch encrypted data from IPFS
        const ipfsData = await fetchFromIPFS(cid);

        if (!ipfsData?.encrypted) {
            return NextResponse.json(
                { error: "Invalid IPFS data format" },
                { status: 400 }
            );
        }

        // Decrypt using wallet address
        const decrypted = decryptData(ipfsData.encrypted, walletAddress);

        if (!decrypted) {
            return NextResponse.json(
                { error: "Decryption failed. Wrong wallet or corrupted data." },
                { status: 403 }
            );
        }

        const chatData = JSON.parse(decrypted);

        return NextResponse.json({ data: chatData });

    } catch (error) {
        console.error("[IPFS Retrieve] Error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve from IPFS" },
            { status: 500 }
        );
    }
}
