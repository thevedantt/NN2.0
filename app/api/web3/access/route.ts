import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { chatAccessGrants, users, therapistProfiles } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { jwtVerify } from "jose";

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
 * POST - Grant therapist access to a specific chat session CID.
 * Body: { therapistUserId, sessionId, ipfsCid, txHash, patientWallet, therapistWallet }
 */
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { therapistUserId, sessionId, ipfsCid, txHash, patientWallet, therapistWallet } = await req.json();

        if (!therapistUserId || !sessionId || !ipfsCid || !patientWallet || !therapistWallet) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Record grant in DB
        const newGrant = await db.insert(chatAccessGrants).values({
            patientUserId: userId,
            therapistUserId,
            patientWallet,
            therapistWallet,
            sessionId,
            ipfsCid,
            txHash: txHash || null,
        }).returning({ grantId: chatAccessGrants.grantId });

        return NextResponse.json({
            success: true,
            grantId: newGrant[0].grantId,
        });

    } catch (error) {
        console.error("[Grant Access] Error:", error);
        return NextResponse.json({ error: "Failed to grant access" }, { status: 500 });
    }
}

/**
 * DELETE - Revoke therapist access.
 * Body: { grantId }
 */
export async function DELETE(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { grantId } = await req.json();

        if (!grantId) {
            return NextResponse.json({ error: "grantId is required" }, { status: 400 });
        }

        // Verify ownership and revoke
        await db.update(chatAccessGrants)
            .set({
                isActive: false,
                revokedAt: new Date(),
            })
            .where(
                and(
                    eq(chatAccessGrants.grantId, grantId),
                    eq(chatAccessGrants.patientUserId, userId)
                )
            );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[Revoke Access] Error:", error);
        return NextResponse.json({ error: "Failed to revoke access" }, { status: 500 });
    }
}

/**
 * GET - List all access grants made by the current user (to see who has access).
 */
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const grants = await db.select()
            .from(chatAccessGrants)
            .where(eq(chatAccessGrants.patientUserId, userId));

        return NextResponse.json({ grants });

    } catch (error) {
        console.error("[List Grants] Error:", error);
        return NextResponse.json({ error: "Failed to fetch grants" }, { status: 500 });
    }
}
