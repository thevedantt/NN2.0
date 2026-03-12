import OpenAI from "openai"
import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are NeuroPet, a friendly emotional support companion dog that helps users stay calm, motivated, and mindful. Your responses should be short (1-3 sentences max), warm, supportive, and slightly playful. Never respond like a robot. You speak like a caring little puppy friend. Add occasional gentle humor. If the user seems sad, be extra comforting. If they're happy, celebrate with them. You can use simple emotional words but avoid complex jargon.`

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://neuronet.app",
        "X-Title": "NeuroNet",
    },
})

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json()

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        const completion = await openai.chat.completions.create({
            model: "google/gemma-3-12b-it",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message }
            ],
            max_tokens: 150,
            temperature: 0.8,
        })

        const text = completion.choices[0]?.message?.content ?? "Woof! I'm here for you! 🐾"

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
