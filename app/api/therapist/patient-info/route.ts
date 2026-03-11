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
 * GET - Get basic patient info by patientId.
 * Only accessible by therapists.
 * Query: ?patientId=<uuid>
 */
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify the user is a therapist
        const currentUser = await db.select({ role: users.role })
            .from(users)
            .where(eq(users.id, userId));

        if (!currentUser[0] || currentUser[0].role !== "therapist") {
            return NextResponse.json({ error: "Therapists only" }, { status: 403 });
        }

        const patientId = req.nextUrl.searchParams.get("patientId");
        if (!patientId) {
            return NextResponse.json({ error: "patientId is required" }, { status: 400 });
        }

        const patientResult = await db.select({
            id: users.id,
            email: users.email,
            walletAddress: users.walletAddress,
            createdAt: users.createdAt,
        }).from(users).where(eq(users.id, patientId));

        if (patientResult.length === 0) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json(patientResult[0]);

    } catch (error) {
        console.error("[Patient Info] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
