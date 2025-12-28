
import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini/client";
import { db } from "@/config/db";
import { aiChatSessions, aiChatMessages, aiChatInsights } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { COMPANION_PROMPTS, INSIGHT_ENGINE_PROMPT } from "@/lib/gemini/prompts";
import { detectCrisis } from "@/lib/crisis";

export async function POST(req: NextRequest) {
    try {
        let { message, history, sessionId, language } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const userId = "test_user_123"; // Mock user for now
        language = language || 'en';

        // 1. Session Management
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const newSession = await db.insert(aiChatSessions).values({
                userId,
                language,
            }).returning({ sessionId: aiChatSessions.sessionId });
            currentSessionId = newSession[0].sessionId;
        }

        // 2. Save User Message
        await db.insert(aiChatMessages).values({
            sessionId: currentSessionId,
            sender: 'user',
            messageText: message,
        });

        // --- CRISIS DETECTION ---
        const crisisResult = detectCrisis(message, language);

        if (crisisResult.riskLevel === 'high') {
            console.log(`[CRISIS DETECTED] Session: ${currentSessionId}, Risk: HIGH, Keywords: ${crisisResult.detectedKeywords.join(", ")}`);

            // We still generate a response, but we might want to override or augment it.
            // For now, we perform the standard chat, but we will attach the crisis flag to the response
            // so the frontend can handle the UI Actions (Redirect/Alert).
            // However, strictly speaking, if it's high risk, maybe we should force a supportive message?
            // Let's rely on the Companion Prompt to be supportive, but the Frontend will handle the "Action".
        }
        // Uses strictly the Psychiatrist persona, NO analytics.
        const companionChat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: COMPANION_PROMPTS[language as keyof typeof COMPANION_PROMPTS] || COMPANION_PROMPTS['en'] }],
                },
                {
                    role: "model",
                    parts: [{ text: language === 'hi' ? "मैं समझता हूँ। मैं यहाँ आपकी बात सुनने और मदद करने के लिए हूँ।" : "I understand. I am here to listen and support you." }],
                },
                ...(history || []).map((msg: any) => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        const chatResult = await companionChat.sendMessage(message);
        const chatResponse = await chatResult.response;
        const aiResponseText = chatResponse.text();

        // 3. Save AI Response
        await db.insert(aiChatMessages).values({
            sessionId: currentSessionId,
            sender: 'ai',
            messageText: aiResponseText,
        });

        // --- STEP 2: INSIGHT ENGINE (Analytics) ---
        // Uses a separate prompt to analyze the conversation state.
        let aiInsight = null;
        try {
            // Fetch previous insight for smoothing
            const prevInsights = await db.select().from(aiChatInsights)
                .where(eq(aiChatInsights.sessionId, currentSessionId))
                .orderBy(desc(aiChatInsights.createdAt))
                .limit(1);

            const previousValues = prevInsights.length > 0 ? JSON.stringify(prevInsights[0]) : "None";

            // Construct context for analysis (last 3 messages)
            const recentHistory = [...(history || []).slice(-2), { role: 'user', content: message }, { role: 'ai', content: aiResponseText }];
            const contextText = recentHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

            const insightPrompt = `
${INSIGHT_ENGINE_PROMPT}

SESSION LANGUAGE: ${language}

PREVIOUS INSIGHT VALUES (FOR SMOOTHING):
${previousValues}

RECENT CONVERSATION LOG:
${contextText}

GENERATE INSIGHT JSON:`;

            const insightResult = await model.generateContent(insightPrompt);
            const insightResponse = await insightResult.response;
            const insightText = insightResponse.text();

            // Clean & Parse JSON
            const cleanText = insightText.replace(/```json\n?|\n?```/g, "").trim();
            aiInsight = JSON.parse(cleanText);

            // structure mapping if needed (mapping flat structure to UI structure if different)
            // The prompt asks for { topic, calmness, openness, suggestion }
            // The frontend expects { topic, tone: { Calmness, Openness }, suggestion }
            // Let's normalize it here to match Schema & Frontend
            if (aiInsight) {
                aiInsight = {
                    topic: aiInsight.topic,
                    tone: {
                        Calmness: aiInsight.calmness || aiInsight.Calmness || 50,
                        Openness: aiInsight.openness || aiInsight.Openness || 50
                    },
                    suggestion: aiInsight.suggestion
                };

                // 4. Save Insight
                await db.insert(aiChatInsights).values({
                    sessionId: currentSessionId,
                    currentTopic: aiInsight.topic,
                    emotionalTone: aiInsight.tone,
                    suggestionText: aiInsight.suggestion,
                    language: language,
                });
            }

        } catch (e) {
            console.error("Insight generation failed:", e);
            // Non-blocking, we just return the chat response without new insights
        }

        return NextResponse.json({
            role: "ai",
            content: aiResponseText,
            emotion: "neutral", // Legacy field, frontend might use it but insights are better
            insight: aiInsight, // The new structured insight
            sessionId: currentSessionId,
            action: crisisResult.actionRequired ? "crisis_alert" : null,
            riskLevel: crisisResult.riskLevel
        });

    } catch (error: any) {
        console.error("Error in chat API:", error);

        const status = error.message && error.message.includes("429") ? 429 : 500;
        return NextResponse.json(
            { error: "Failed to process request", details: error instanceof Error ? error.message : String(error) },
            { status }
        );
    }
}
