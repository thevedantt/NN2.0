
import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini/client";
import { THERAPIST_CONTEXT } from "@/lib/gemini/context";

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // specific handling for "gemini-2.5-flash" if it doesn't exist yet, 
        // we might need to fallback, but for now assuming the library/API handles the string or we get a specific error.

        // Construct chat history for the model
        // The SDK supports history in startChat
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: THERAPIST_CONTEXT }],
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I am Neura, ready to listen and support." }],
                },
                ...(history || []).map((msg: any) => ({
                    role: msg.role === "user" ? "user" : "model",
                    parts: [{ text: msg.content }],
                })),
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({
            role: "ai",
            content: text,
            emotion: "neutral" // You could ask the model to output JSON with emotion, but for now simple text.
        });

    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: "Failed to process request", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
