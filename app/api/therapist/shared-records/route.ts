import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { chatAccessGrants, aiChatSessions, users } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { jwtVerify } from "jose";
import { decryptData } from "@/lib/web3/encryption";
import { fetchFromIPFS } from "@/lib/web3/ipfs";

const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_key_change_me";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, encodedKey);
        return payload.sub as string;
    } catch {
        return null;
    }
}

/**
 * GET - Retrieve all shared chat records for the logged-in therapist.
 * Returns a list of grants (session metadata + decrypted status).
 */
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify user is a therapist
        const userResult = await db.select({ role: users.role, walletAddress: users.walletAddress })
            .from(users)
            .where(eq(users.id, userId));

        if (!userResult[0] || userResult[0].role !== "therapist") {
            return NextResponse.json({ error: "Access denied. Therapists only." }, { status: 403 });
        }

        // Fetch all active grants for this therapist
        const grants = await db.select()
            .from(chatAccessGrants)
            .where(
                and(
                    eq(chatAccessGrants.therapistUserId, userId),
                    eq(chatAccessGrants.isActive, true)
                )
            );

        return NextResponse.json({ grants });

    } catch (error) {
        console.error("[Shared Records GET] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST - Decrypt and view a specific shared chat record.
 * Body: { grantId: number, walletAddress: string }
 * The walletAddress is the PATIENT's wallet address (needed for decryption key derivation).
 */
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { grantId, patientWalletAddress } = await req.json();
        if (!grantId || !patientWalletAddress) {
            return NextResponse.json({ error: "grantId and patientWalletAddress are required" }, { status: 400 });
        }

        // Verify this grant exists and belongs to this therapist
        const grantResult = await db.select()
            .from(chatAccessGrants)
            .where(
                and(
                    eq(chatAccessGrants.grantId, grantId),
                    eq(chatAccessGrants.therapistUserId, userId),
                    eq(chatAccessGrants.isActive, true)
                )
            );

        if (grantResult.length === 0) {
            return NextResponse.json({ error: "Access grant not found or revoked" }, { status: 404 });
        }

        const grant = grantResult[0];

        // Fetch encrypted data from IPFS
        const ipfsData = await fetchFromIPFS(grant.ipfsCid);

        if (!ipfsData?.encrypted) {
            return NextResponse.json({ error: "Invalid IPFS data format" }, { status: 400 });
        }

        // Decrypt using the patient's wallet address
        const decrypted = decryptData(ipfsData.encrypted, patientWalletAddress);

        if (!decrypted) {
            return NextResponse.json({ error: "Decryption failed" }, { status: 403 });
        }

        const chatData = JSON.parse(decrypted);

        return NextResponse.json({ data: chatData, grant });

    } catch (error) {
        console.error("[Shared Records POST] Error:", error);
        return NextResponse.json({ error: "Failed to retrieve shared record" }, { status: 500 });
    }
}
