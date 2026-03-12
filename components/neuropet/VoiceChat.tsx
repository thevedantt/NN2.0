"use client"

import React, { useRef, useCallback, useEffect, useState } from "react"
import { useVoiceStore, VoiceState } from "@/lib/neuropet/store/voiceStore"
import { toast } from "sonner"

/* ────────────────────────────────────────────────────
 * VoiceChat — Floating microphone button that enables
 * voice conversation with NeuroPet.
 *
 * Flow: Mic → SpeechRecognition → Gemini API → SpeechSynthesis
 * ──────────────────────────────────────────────────── */

interface VoiceChatProps {
    onPetSpeak?: (emotion: string) => void
    onPetFinishSpeaking?: () => void
}

// Extend Window for webkitSpeechRecognition
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList
    resultIndex: number
}

export default function VoiceChat({ onPetSpeak, onPetFinishSpeaking }: VoiceChatProps) {
    const { state, lastPetMessage, setState, setMessages } = useVoiceStore()
    const recognitionRef = useRef<any>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [pulseKey, setPulseKey] = useState(0)
    const [liveTranscript, setLiveTranscript] = useState("")
    const finalTranscriptRef = useRef("")

    // Create a fresh speech recognition instance each time
    const createRecognition = useCallback(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            toast.error("Speech recognition is not supported in this browser. Use Chrome or Edge.")
            return null
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognition.maxAlternatives = 1
        return recognition
    }, [])

    // Speak the pet's response using ElevenLabs via API 
    const speakResponse = useCallback(
        async (text: string, emotion: string) => {
            // Cancel any ongoing speech
            if (audioRef.current) {
                audioRef.current.pause()
                URL.revokeObjectURL(audioRef.current.src)
                audioRef.current = null
            }

            setState("speaking")
            onPetSpeak?.(emotion)

            try {
                const res = await fetch("/api/neuropet/tts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                })

                if (!res.ok) throw new Error("TTS failed")

                const blob = await res.blob()
                const audioUrl = URL.createObjectURL(blob)

                const audio = new Audio(audioUrl)
                audioRef.current = audio

                audio.onended = () => {
                    setState("idle")
                    onPetFinishSpeaking?.()
                    URL.revokeObjectURL(audioUrl)
                }

                audio.onerror = () => {
                    setState("idle")
                    onPetFinishSpeaking?.()
                    URL.revokeObjectURL(audioUrl)
                }

                await audio.play()

            } catch (err) {
                console.error("[VoiceChat] TTS Error:", err)
                // Fallback to idle if TTS fails
                setState("idle")
                onPetFinishSpeaking?.()
            }
        },
        [setState, onPetSpeak, onPetFinishSpeaking]
    )

    // Send message to Gemini via API route
    const sendToGemini = useCallback(
        async (userMessage: string) => {
            setState("processing")

            try {
                const res = await fetch("/api/neuropet/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: userMessage }),
                })

                const data = await res.json()
                const reply = data.reply || "I'm here with you! 🐾"
                const emotion = data.emotion || "Nod"

                setMessages(userMessage, reply, emotion)

                // Speak the response
                speakResponse(reply, emotion)
            } catch (err) {
                console.error("[VoiceChat] Gemini error:", err)
                const fallback = "I'm here with you. Could you say that again? 🐾"
                setMessages(userMessage, fallback, "Curious")
                speakResponse(fallback, "Curious")
                toast("I had trouble thinking. Let me try again!", {
                    icon: "🐾",
                })
            }
        },
        [setState, setMessages, speakResponse]
    )

    // Start listening
    const startListening = useCallback(() => {
        // Stop any ongoing speech
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }

        // Stop previous recognition if any
        if (recognitionRef.current) {
            try { recognitionRef.current.abort() } catch { /* */ }
        }

        const recognition = createRecognition()
        if (!recognition) return

        recognitionRef.current = recognition
        finalTranscriptRef.current = ""
        setLiveTranscript("")

        setState("listening")
        setPulseKey((k) => k + 1)

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = ""
            let final = ""
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    final += result[0].transcript + " "
                } else {
                    interim += result[0].transcript
                }
            }

            if (final) {
                finalTranscriptRef.current += final
            }

            // Show live text so user sees the mic is working
            const display = (finalTranscriptRef.current + interim).trim()
            setLiveTranscript(display)
            console.log("[VoiceChat] Live:", display)
        }

        recognition.onerror = (event: any) => {
            const error = event?.error || "unknown"
            console.warn("[VoiceChat] Recognition error:", error)

            switch (error) {
                case "not-allowed":
                    setState("idle")
                    setLiveTranscript("")
                    toast.error("Microphone access denied. Please allow mic in browser settings.", { icon: "🔒" })
                    break
                case "no-speech":
                    // Don't stop — just keep listening, the user might speak soon
                    console.log("[VoiceChat] No speech detected yet, still listening...")
                    break
                case "audio-capture":
                    setState("idle")
                    setLiveTranscript("")
                    toast.error("No microphone found. Connect a mic and try again.", { icon: "🎤" })
                    break
                case "network":
                    setState("idle")
                    setLiveTranscript("")
                    toast.error("Network error. Speech recognition needs internet.", { icon: "🌐" })
                    break
                case "aborted":
                    // Aborted intentionally by clicking 'stop sensing', do not reset UI state
                    console.log("[VoiceChat] Recognition manually aborted to submit text.")
                    break
                default:
                    setState("idle")
                    setLiveTranscript("")
                    toast(`Speech error: ${error}`, { icon: "⚠️" })
                    break
            }
        }

        recognition.onend = () => {
            // In continuous mode, if it ends unexpectedly, restart
            if (useVoiceStore.getState().state === "listening") {
                // Auto-restart to keep listening
                try {
                    recognition.start()
                    console.log("[VoiceChat] Auto-restarted recognition")
                } catch {
                    // If restart fails, submit whatever we have
                    const text = finalTranscriptRef.current.trim()
                    if (text) {
                        submitTranscript(text)
                    } else {
                        setState("idle")
                        setLiveTranscript("")
                    }
                }
            }
        }

        try {
            recognition.start()
            console.log("[VoiceChat] Recognition started — speak now!")
        } catch (err) {
            console.error("[VoiceChat] Failed to start:", err)
            setState("idle")
            toast.error("Could not start speech recognition. Try refreshing.", { icon: "⚠️" })
        }
    }, [createRecognition, setState, sendToGemini])

    // Submit the final transcript
    const submitTranscript = useCallback((text: string) => {
        setLiveTranscript("")
        finalTranscriptRef.current = ""
        if (text) {
            toast(`You said: "${text}"`, { icon: "🎤", duration: 2500 })
            sendToGemini(text)
        } else {
            setState("idle")
            toast("I didn't catch anything. Try again! 🐾", { icon: "🔇" })
        }
    }, [sendToGemini, setState])

    // Stop listening and submit
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort()
            } catch {
                // ignore
            }
        }
        const text = finalTranscriptRef.current.trim() || liveTranscript.trim()
        submitTranscript(text)
    }, [liveTranscript, submitTranscript])

    // Handle button click
    const handleClick = useCallback(() => {
        if (state === "listening") {
            stopListening()
        } else if (state === "speaking") {
            if (audioRef.current) audioRef.current.pause()
            setState("idle")
            onPetFinishSpeaking?.()
        } else if (state === "idle") {
            startListening()
        }
        // If processing, do nothing (wait for Gemini)
    }, [state, startListening, stopListening, setState, onPetFinishSpeaking])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                URL.revokeObjectURL(audioRef.current.src)
            }
            if (recognitionRef.current) {
                try { recognitionRef.current.stop() } catch { /* */ }
            }
        }
    }, [])

    const config = STATE_CONFIG[state]

    return (
        <>
            {/* Floating mic button — bottom right */}
            <div
                style={{
                    position: "absolute",
                    bottom: "40px",
                    right: "40px",
                    zIndex: 30,
                    pointerEvents: "auto",
                }}
            >
                {/* Pulse ring behind button */}
                {(state === "listening" || state === "speaking") && (
                    <div
                        key={pulseKey}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            border: `2px solid ${config.color}`,
                            animation: "voice-pulse 1.5s ease-out infinite",
                            opacity: 0.6,
                        }}
                    />
                )}

                <button
                    onClick={handleClick}
                    disabled={state === "processing"}
                    style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        border: `2px solid ${config.color}`,
                        background: config.bg,
                        cursor: state === "processing" ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 20px ${config.color}66, 0 8px 32px rgba(0,0,0,0.3)`,
                        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                        transform: state === "listening" ? "scale(1.1)" : "scale(1)",
                        position: "relative",
                        overflow: "visible", // To allow badge to overflow
                        padding: 0,
                    }}
                    title={config.tooltip}
                >
                    {/* Puppy face image icon */}
                    <img
                        src="/neuropet/pappyaface.png"
                        alt="NeuroPet"
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />

                    {/* Status badge Overlay */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: "-2px",
                            right: "-2px",
                            width: "24px",
                            height: "24px",
                            background: "rgba(15, 10, 25, 0.9)",
                            backdropFilter: "blur(4px)",
                            border: `1px solid ${config.color}`,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        }}
                    >
                        {config.icon}
                    </div>
                </button>

                {/* State label */}
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: config.color,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        opacity: state === "idle" ? 0.5 : 1,
                        transition: "opacity 0.3s",
                    }}
                >
                    {state === "listening" && liveTranscript
                        ? "Click to send"
                        : config.label}
                </div>

                {/* Live transcript while listening */}
                {state === "listening" && liveTranscript && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: "110px",
                            right: "0",
                            width: "280px",
                            background: "rgba(15, 10, 25, 0.85)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1px solid rgba(79, 195, 247, 0.25)",
                            borderRadius: "14px",
                            padding: "12px 16px",
                            color: "#e0e0e0",
                            fontSize: "14px",
                            lineHeight: 1.5,
                            fontFamily: "'Inter', system-ui, sans-serif",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                            animation: "speech-bubble-in 0.3s ease-out forwards",
                        }}
                    >
                        <span style={{ color: "#4FC3F7", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Hearing:{" "}
                        </span>
                        <span style={{ color: "#f5e6d0" }}>
                            {liveTranscript}
                        </span>
                        <span style={{ animation: "blink 1s step-end infinite", color: "#4FC3F7" }}>|</span>
                    </div>
                )}
            </div>

            {/* Speech bubble showing pet's last message */}
            {state === "speaking" && lastPetMessage && (
                <div
                    style={{
                        position: "absolute",
                        top: "15%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 25,
                        maxWidth: "400px",
                        animation: "speech-bubble-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                        fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                >
                    <div
                        style={{
                            background: "rgba(15, 10, 25, 0.85)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1px solid rgba(255, 180, 100, 0.2)",
                            borderRadius: "16px",
                            padding: "16px 22px",
                            color: "#f5e6d0",
                            fontSize: "15px",
                            lineHeight: 1.5,
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                            position: "relative",
                        }}
                    >
                        <span style={{ marginRight: "8px", fontSize: "18px" }}>🐾</span>
                        {lastPetMessage}
                        {/* Speech bubble arrow */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: "-8px",
                                left: "50%",
                                transform: "translateX(-50%) rotate(45deg)",
                                width: "16px",
                                height: "16px",
                                background: "rgba(15, 10, 25, 0.85)",
                                borderRight: "1px solid rgba(255, 180, 100, 0.2)",
                                borderBottom: "1px solid rgba(255, 180, 100, 0.2)",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Keyframe styles */}
            <style>{`
        @keyframes voice-pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.2);
            opacity: 0;
          }
        }
        @keyframes speech-bubble-in {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
        </>
    )
}

/* ────────────────────────────────────────────────────
 * State visual config
 * ──────────────────────────────────────────────────── */
const STATE_CONFIG: Record<
    VoiceState,
    {
        icon: string
        label: string
        tooltip: string
        color: string
        bg: string
    }
> = {
    idle: {
        icon: "🎤",
        label: "Talk to me",
        tooltip: "Click to start talking to your pet",
        color: "#888",
        bg: "linear-gradient(135deg, #3a3a4a, #2a2a3a)",
    },
    listening: {
        icon: "👂",
        label: "Listening...",
        tooltip: "Speak now! Click again to stop",
        color: "#4FC3F7",
        bg: "linear-gradient(135deg, #1565C0, #0D47A1)",
    },
    processing: {
        icon: "💭",
        label: "Thinking...",
        tooltip: "NeuroPet is thinking...",
        color: "#CE93D8",
        bg: "linear-gradient(135deg, #7B1FA2, #4A148C)",
    },
    speaking: {
        icon: "🔊",
        label: "Speaking",
        tooltip: "Click to stop speaking",
        color: "#81C784",
        bg: "linear-gradient(135deg, #2E7D32, #1B5E20)",
    },
}
