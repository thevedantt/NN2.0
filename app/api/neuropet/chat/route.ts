import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are NeuroPet, a friendly emotional support companion dog that helps users stay calm, motivated, and mindful. Your responses should be short (1-3 sentences max), warm, supportive, and slightly playful. Never respond like a robot. You speak like a caring little puppy friend. Add occasional gentle humor. If the user seems sad, be extra comforting. If they're happy, celebrate with them. You can use simple emotional words but avoid complex jargon.`

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json()

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        // Retry with backoff for rate limiting (429)
        let response
        let lastError
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: message,
                    config: {
                        systemInstruction: SYSTEM_PROMPT,
                        maxOutputTokens: 150,
                        temperature: 0.8,
                        topP: 0.9,
                    },
                })
                break // success, exit retry loop
            } catch (err: any) {
                lastError = err
                const is429 = err?.status === 429 || err?.message?.includes("429")
                if (is429 && attempt < 2) {
                    // Wait before retrying: 1s, 2s, 4s
                    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)))
                    console.log(`[NeuroPet Chat] Rate limited, retry ${attempt + 1}/3...`)
                    continue
                }
                throw err
            }
        }

        const text = response?.text ?? "Woof! I'm here for you! 🐾"

        // Determine which emotion/animation best fits the response
        const emotion = detectEmotion(message, text)

        return NextResponse.json({ reply: text, emotion })
    } catch (error) {
        console.error("[NeuroPet Chat] Error:", error)
        return NextResponse.json(
            { reply: "I'm here with you. Could you say that again? 🐾", emotion: "Curious" },
            { status: 200 }
        )
    }
}

/**
 * Simple keyword-based emotion detection to trigger matching pet animation.
 * Scans both user message and AI response for emotion cues.
 */
function detectEmotion(userMessage: string, aiReply: string): string {
    const combined = `${userMessage} ${aiReply}`.toLowerCase()

    const emotionKeywords: Record<string, string[]> = {
        Happy: ["happy", "great", "awesome", "wonderful", "love it", "excited", "yay", "amazing", "fantastic", "celebrate"],
        Sad: ["sad", "unhappy", "depressed", "down", "lonely", "miss", "cry", "hurt", "pain", "sorry"],
        Love: ["love", "care", "hug", "heart", "adore", "sweet", "kiss", "affection"],
        Angry: ["angry", "mad", "furious", "annoyed", "frustrated", "hate", "upset"],
        Excited: ["excited", "pumped", "thrilled", "can't wait", "woohoo", "let's go"],
        Confused: ["confused", "don't understand", "what", "huh", "weird", "strange", "how"],
        Sleepy: ["sleepy", "tired", "exhausted", "rest", "sleep", "nap", "night", "bed"],
        Scared: ["scared", "afraid", "fear", "worried", "anxious", "nervous", "stress"],
        Dance: ["dance", "music", "party", "fun", "groove"],
        Wave: ["hello", "hi", "hey", "greet", "morning", "bye", "goodbye"],
        Curious: ["tell me", "explain", "curious", "wonder", "think", "question", "why"],
        Nod: ["yes", "agree", "right", "correct", "sure", "okay", "definitely", "absolutely"],
    }

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some((kw) => combined.includes(kw))) {
            return emotion
        }
    }

    return "Nod"
}
