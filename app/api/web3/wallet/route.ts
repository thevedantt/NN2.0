import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { users } from "@/config/schema";
import { eq } from "drizzle-orm";
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
 * POST - Store wallet address for the authenticated user
 */
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { walletAddress } = await req.json();
        if (!walletAddress) {
            return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
        }

        await db.update(users)
            .set({ walletAddress })
            .where(eq(users.id, userId));

        return NextResponse.json({ success: true, walletAddress });
    } catch (error) {
        console.error("[Web3 Wallet] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * GET - Retrieve wallet address for the authenticated user
 */
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await db.select({ walletAddress: users.walletAddress })
            .from(users)
            .where(eq(users.id, userId));

        return NextResponse.json({ walletAddress: result[0]?.walletAddress || null });
    } catch (error) {
        console.error("[Web3 Wallet] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
