
import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini/client";
import { db } from "@/config/db";
import { aiChatSessions, aiChatMessages, aiChatInsights, userProfiles } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { buildPersonalizedPrompt, INSIGHT_ENGINE_PROMPT } from "@/lib/gemini/prompts";
import { detectCrisis } from "@/lib/crisis";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

// --- TELEMETRY HELPERS (Minimal Overhead) ---
const monitor = (label: string, start: number) => {
    console.log(`[LATENCY] ${label}: ${Date.now() - start}ms`);
}

/**
 * ASYNC BACKGROUND JOB
 * Handles Analytics, Insights, and DB Logging
 * COMPLETELY DECOUPLED from User Response
 */
async function runBackgroundJobs(
    sessionId: number,
    history: any[],
    userMessage: string,
    aiResponseText: string,
    language: string,
    userId: string
) {
    const jobStart = Date.now();
    try {
        console.log(`[BACKGROUND] Starting background jobs for Session ${sessionId}...`);

        // JOB 1: PERSIST CHAT (Moved from critical path)
        // We log BOTH user and AI message here to remove DB writes from the hot path.
        // NOTE: This introduces a tiny risk of data loss if the server crashes exactly here,
        // but it drastically improves latency.
        await db.insert(aiChatMessages).values({
            sessionId: sessionId,
            sender: 'user',
            messageText: userMessage,
        });
        await db.insert(aiChatMessages).values({
            sessionId: sessionId,
            sender: 'ai',
            messageText: aiResponseText,
        });

        monitor("Background:DB_Persist", jobStart);


        // JOB 2: INSIGHT ENGINE (Expensive) if session exists
        const insightStart = Date.now();

        // Fetch previous insight
        const prevInsights = await db.select().from(aiChatInsights)
            .where(eq(aiChatInsights.sessionId, sessionId))
            .orderBy(desc(aiChatInsights.createdAt))
            .limit(1);

        const previousValues = prevInsights.length > 0 ? JSON.stringify(prevInsights[0]) : "None";

        // REDUCED CONTEXT: Last 2 messages + current turn
        const recentHistory = [...(history || []).slice(-2), { role: 'user', content: userMessage }, { role: 'ai', content: aiResponseText }];
        const contextText = recentHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

        const insightPrompt = `
${INSIGHT_ENGINE_PROMPT}

SESSION LANGUAGE: ${language}

PREVIOUS INSIGHT VALUES:
${previousValues}

RECENT CONVERSATION LOG:
${contextText}

GENERATE INSIGHT JSON:`;

        const insightResult = await model.generateContent(insightPrompt);

        const insightText = insightResult.response.text();
        const cleanText = insightText.replace(/```json\n?|\n?```/g, "").trim();
        let aiInsight = JSON.parse(cleanText);

        if (aiInsight) {
            aiInsight = {
                topic: aiInsight.topic,
                tone: {
                    Calmness: aiInsight.calmness || aiInsight.Calmness || 50,
                    Openness: aiInsight.openness || aiInsight.Openness || 50
                },
                suggestion: aiInsight.suggestion
            };

            await db.insert(aiChatInsights).values({
                sessionId: sessionId,
                currentTopic: aiInsight.topic,
                emotionalTone: aiInsight.tone,
                suggestionText: aiInsight.suggestion,
                language: language,
            });

            monitor("Background:Insight_Engine", insightStart);
        }

    } catch (e) {
        console.error("[BACKGROUND] Job Failed:", e);
    }
}


async function getUserIdFromCookie(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return null;
        const payload = await verifyAccessToken(token);
        return payload ? (payload.sub as string) : null;
    } catch {
        return null;
    }
}

async function fetchUserProfile(userId: string): Promise<Record<string, any> | null> {
    try {
        const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
        return result.length > 0 ? result[0] : null;
    } catch {
        return null;
    }
}

// Matches: "add in memory: ...", "add to memory: ...", "remember this: ...", "save this: ..."
const MEMORY_TRIGGER = /^(add\s+(in|to)\s+memory|remember\s+this|save\s+this)[:\s]+/i;

async function appendUserMemory(userId: string, memoryText: string): Promise<void> {
    const existing = await db.select({ memories: userProfiles.memories })
        .from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);

    const currentMemories: string[] = Array.isArray(existing[0]?.memories)
        ? (existing[0].memories as string[])
        : [];

    const updatedMemories = [...currentMemories, memoryText];

    if (existing.length > 0) {
        await db.update(userProfiles)
            .set({ memories: updatedMemories })
            .where(eq(userProfiles.userId, userId));
    } else {
        await db.insert(userProfiles).values({ userId, memories: updatedMemories });
    }
}

export async function POST(req: NextRequest) {
    const totalStart = Date.now();

    try {
        let { message, history, sessionId, language } = await req.json();

        if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

        // Resolve authenticated user (falls back to anonymous ID if not logged in)
        const userId = (await getUserIdFromCookie()) || "anonymous";
        language = language || 'en';

        monitor("Parse_Request", totalStart);

        // --- 0. FETCH USER PROFILE for personalisation ---
        const profileStart = Date.now();
        const userProfile = userId !== "anonymous" ? await fetchUserProfile(userId) : null;
        monitor("Profile_Fetch", profileStart);

        // --- 1. MEMORY INTERCEPT ---
        // If the message starts with a "add in memory" trigger, save it and return early.
        const memoryMatch = message.match(MEMORY_TRIGGER);
        if (memoryMatch) {
            const memoryText = message.replace(MEMORY_TRIGGER, '').trim();
            if (memoryText && userId !== "anonymous") {
                await appendUserMemory(userId, memoryText);
                const confirmation = language === 'hi'
                    ? `याद रखा! ✓ मैंने यह नोट कर लिया है: "${memoryText}" — आगे की बातचीत में मैं इसे ध्यान में रखूँगा।`
                    : `Noted! ✓ I've saved that to memory: "${memoryText}" — I'll keep this in mind throughout our conversations.`;
                return NextResponse.json({
                    role: "ai",
                    content: confirmation,
                    emotion: "warm",
                    sessionId: sessionId || null,
                    action: null,
                    riskLevel: "none"
                });
            }
        }

        // --- 2. CRISIS CHECK (Sync, Fast) ---
        const crisisStart = Date.now();
        const crisisResult = detectCrisis(message, language);
        if (crisisResult.riskLevel === 'high') {
            console.log(`[CRISIS] High Risk Detected`);
        }
        monitor("Crisis_Check", crisisStart);


        // --- 3. SESSION HANDLING (Optimized) ---
        // If no session ID, we MUST create one sync to return it.
        // Use a lightweight insert if possible.
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const sessStart = Date.now();
            const newSession = await db.insert(aiChatSessions).values({
                userId,
                language,
            }).returning({ sessionId: aiChatSessions.sessionId });
            currentSessionId = newSession[0].sessionId;
            monitor("Session_Create", sessStart);
        }

        // --- 3. CHAT GENERATION (The Core Latency Path) ---
        const chatStart = Date.now();

        // CONTEXT AMPUTATION: Send only system prompt + last 5 messages
        // This is the biggest latency killer.
        const SLIM_HISTORY_LIMIT = 5;
        const slimHistory = (history || []).slice(-SLIM_HISTORY_LIMIT);

        const systemPrompt = buildPersonalizedPrompt(language, userProfile);

        const chatSession = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: language === 'hi' ? "मैं समझता हूँ। मैं यहाँ आपकी बात सुनने और मदद करने के लिए हूँ।" : "I understand. I am here to listen and support you." }],
                },
                ...slimHistory.map((msg: any) => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.content }],
                })),
            ],
            // generationConfig ignored by adapter, removing to fix TS error
        });

        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        const aiResponseText = response.text();

        monitor("Chat_Generation", chatStart);


        // --- 4. FIRE AND FORGET BACKGROUND JOBS ---
        // DO NOT AWAIT THIS
        runBackgroundJobs(currentSessionId, slimHistory, message, aiResponseText, language, userId)
            .catch(err => console.error("Background job launch failed", err));


        // --- 5. IMMEDIATE RESPONSE ---
        // Send back ONLY what is needed for UI rendering.
        monitor("Total_Latency", totalStart);

        return NextResponse.json({
            role: "ai",
            content: aiResponseText,
            emotion: "neutral",
            insight: null,
            sessionId: currentSessionId,
            action: crisisResult.actionRequired ? "crisis_alert" : null,
            riskLevel: crisisResult.riskLevel
        });

    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: "Failed to process request", details: String(error) },
            { status: 500 }
        );
    }
}
