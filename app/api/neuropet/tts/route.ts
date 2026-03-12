import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json()

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 })
        }

        const apiKey = process.env.ELEVENLABS_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: "ELEVENLABS_API_KEY is not configured" },
                { status: 500 }
            )
        }

        // Using a friendly, energetic dog-like voice if possible, or a default soft voice
        // "MF3mGyEYCl7XYWbV9V6O" is 'Elli' - a popular friendly voice on ElevenLabs
        // "EXAVITQu4vr4xnSDxMaL" is 'Bella' - soft and sweet
        const voiceId = "EXAVITQu4vr4xnSDxMaL" 
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "audio/mpeg",
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_turbo_v2_5", // Faster model, good for conversational AI
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("[ElevenLabs API Error]", response.status, errorText)
            return NextResponse.json(
                { error: "Failed to generate speech from ElevenLabs" },
                { status: response.status }
            )
        }

        // Pipe the audio stream directly back to the client
        return new NextResponse(response.body, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-cache",
            },
        })
    } catch (error) {
        console.error("[NeuroPet TTS Error]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
