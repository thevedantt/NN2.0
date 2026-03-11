import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { users, aiChatMessages } from "@/config/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { encryptData } from "@/lib/web3/encryption";
import { uploadToIPFS } from "@/lib/web3/ipfs";

const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_key_change_me";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

/**
 * POST - Encrypt a chat session and upload to IPFS
 * Body: { sessionId: number }
 * Returns: { cid: string }
 */
export async function POST(req: NextRequest) {
    try {
        // Auth check
        const token = req.cookies.get("auth_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
        const userId = payload.sub as string;

        // Get wallet address
        const userResult = await db.select({ walletAddress: users.walletAddress })
            .from(users)
            .where(eq(users.id, userId));
        
        const walletAddress = userResult[0]?.walletAddress;
        if (!walletAddress) {
            return NextResponse.json({ error: "No wallet connected. Connect your wallet first." }, { status: 400 });
        }

        const { sessionId } = await req.json();
        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        // Fetch messages for this session
        const messages = await db.select()
            .from(aiChatMessages)
            .where(eq(aiChatMessages.sessionId, sessionId));

        if (messages.length === 0) {
            return NextResponse.json({ error: "No messages found for this session" }, { status: 404 });
        }

        // Prepare chat data
        const chatData = {
            sessionId,
            userId,
            messages: messages.map(m => ({
                sender: m.sender,
                text: m.messageText,
                timestamp: m.createdAt,
            })),
            exportedAt: new Date().toISOString(),
        };

        // Encrypt using wallet address as key
        const encrypted = encryptData(JSON.stringify(chatData), walletAddress);

        // Upload to IPFS
        const cid = await uploadToIPFS(
            { encrypted, version: 1 },
            `neuronet-session-${sessionId}`
        );

        return NextResponse.json({ cid, sessionId });

    } catch (error) {
        console.error("[IPFS Upload] Error:", error);
        return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 });
    }
}
