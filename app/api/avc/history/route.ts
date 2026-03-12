import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { avcSessions } from "@/config/schema";
import { eq, desc } from "drizzle-orm";

// Mock User ID for MVP, usually comes from session/auth token
const MOCK_USER_ID = "test-user-123";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { scenarioId, words, wpm, fillerWords, pauses, eyeContact, confidenceScore, transcript, aiFeedback } = body;

        // Ensure required fields
        if (!scenarioId || transcript === undefined) {
             return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newSession = await db.insert(avcSessions).values({
            userId: MOCK_USER_ID,
            scenario: scenarioId,
            words: words || 0,
            wpm: wpm || 0,
            fillerWords: fillerWords || 0,
            pauses: pauses || 0,
            eyeContact: eyeContact || 0,
            confidenceScore: confidenceScore || 0,
            transcript: transcript,
            aiFeedback: aiFeedback
        }).returning();

        return NextResponse.json({ success: true, session: newSession[0] });
    } catch (error) {
        console.error("Failed to save AVC session", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        // Query sessions for the logged in user using standard select
        const sessions = await db.select()
            .from(avcSessions)
            .where(eq(avcSessions.userId, MOCK_USER_ID))
            .orderBy(desc(avcSessions.createdAt));

        return NextResponse.json({ success: true, sessions });
    } catch (error) {
        console.error("Failed to fetch AVC sessions", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
