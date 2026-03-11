import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { therapistProfiles, users } from "@/config/schema";
import { eq } from "drizzle-orm";

/**
 * GET - List all therapists with their wallet connection status.
 * Used by the patient's ShareAccessDialog to pick a therapist.
 */
export async function GET() {
    try {
        const therapists = await db
            .select({
                userId: therapistProfiles.userId,
                fullName: therapistProfiles.fullName,
                specializations: therapistProfiles.specializations,
                isVerified: therapistProfiles.isVerified,
                walletAddress: users.walletAddress,
            })
            .from(therapistProfiles)
            .innerJoin(users, eq(users.id, therapistProfiles.userId));

        return NextResponse.json({ therapists });
    } catch (error) {
        console.error("[Therapist List] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
