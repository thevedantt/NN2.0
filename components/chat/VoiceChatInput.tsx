"use client"

import * as React from "react"
import { Mic, Send, AlertCircle, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useSpeechToText } from "@/hooks/useSpeechToText"
import { useLanguage } from "@/context/LanguageContext"

type VoiceState = "idle" | "listening" | "error"

interface VoiceChatInputProps {
    value: string
    onChange: (value: string) => void
    onSend: () => void
    disabled?: boolean
    className?: string
}

export function VoiceChatInput({
    value,
    onChange,
    onSend,
    disabled = false,
    className,
}: VoiceChatInputProps) {

    const { language, t } = useLanguage()

    // Map simple language code to full locale for STT
    const getLocale = (lang: string) => {
        switch (lang) {
            case 'hi': return 'hi-IN';
            case 'mr': return 'mr-IN';
            default: return 'en-US';
        }
    }

    // Real STT Hook
    const {
        state: voiceState,
        transcript,
        startListening,
        stopListening,
        resetState,
        isSupported
    } = useSpeechToText({
        language: getLocale(language),
        onTranscript: (text) => {
            // Handled via effect below
        }
    })

    // Ref to hold the text *before* current speech session
    const baseTextRef = React.useRef(value)

    const handleVoiceToggle = () => {
        if (disabled || !isSupported) return

        if (voiceState === "listening") {
            stopListening()
        } else {
            baseTextRef.current = value
            startListening()
        }
    }

    // Effect: Update parent `onChange` when `transcript` updates
    React.useEffect(() => {
        if (voiceState === 'listening' && transcript) {
            const spacer = baseTextRef.current && !baseTextRef.current.endsWith(' ') ? ' ' : ''
            onChange(baseTextRef.current + spacer + transcript)
        }
    }, [transcript, voiceState])


    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Language & Localization Labels
    const LABELS = {
        idle: {
            placeholder: t("chat_placeholder_idle"),
            micAria: t("chat_mic_start"),
        },
        listening: {
            placeholder: t("chat_placeholder_listening"),
            micAria: t("chat_mic_stop"),
        },
        error: {
            placeholder: t("chat_placeholder_error"),
            micAria: t("chat_mic_retry"),
        },
        send: {
            aria: t("chat_send"),
        }
    }

    // Auto-resize textarea
    React.useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
        }
    }, [value])


    const handleSend = () => {
        if (value.trim()) {
            onSend()
            // Reset height after send
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Dynamic Styles based on state
    // Now using flex-row to put textarea and buttons side-by-side conceptually (or rather, buttons inline)
    const containerClasses = cn(
        "relative flex w-full items-end bg-card border-2 rounded-3xl transition-all duration-300 p-2",
        "focus-within:ring-2 focus-within:ring-primary/20",
        voiceState === "idle" && "border-border",
        voiceState === "listening" && "border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]",
        voiceState === "error" && "border-orange-300 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10",
        className
    )

    const placeholderText =
        voiceState === "listening" ? LABELS.listening.placeholder :
            voiceState === "error" ? LABELS.error.placeholder :
                LABELS.idle.placeholder

    return (
        <div className={containerClasses}>
            {/* 1. Growing Textarea (Left/Middle) */}
            <div className="flex-1 min-w-0">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholderText}
                    className={cn(
                        "w-full bg-transparent border-0 focus-visible:ring-0 resize-none text-lg py-3 px-3 min-h-[50px] max-h-[200px]",
                        "placeholder:text-muted-foreground/80 placeholder:transition-all",
                        voiceState === "listening" && "placeholder:text-primary animate-pulse cursor-not-allowed opacity-80"
                    )}
                    rows={1}
                    aria-label="Message input"
                />
            </div>

            {/* 2. Actions (Right Side - Side by Side) */}
            <div className="flex items-center gap-2 pb-1 pr-1 flex-none">

                {/* Microphone Controls */}
                <div className="relative">
                    {isSupported ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleVoiceToggle}
                            disabled={disabled}
                            className={cn(
                                "h-10 w-10 rounded-full transition-all duration-300",
                                voiceState === "idle" && "text-muted-foreground hover:bg-muted hover:text-foreground",
                                voiceState === "listening" && "bg-red-500 hover:bg-red-600 text-white animate-pulse scale-105",
                                voiceState === "error" && "text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                            )}
                            aria-label={
                                voiceState === "listening" ? LABELS.listening.micAria :
                                    voiceState === "error" ? LABELS.error.micAria :
                                        LABELS.idle.micAria
                            }
                            aria-live="polite"
                        >
                            {voiceState === "listening" ? (
                                <div className="relative flex items-center justify-center">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-30 animate-ping"></span>
                                    <Mic className="h-5 w-5" />
                                </div>
                            ) : voiceState === "error" ? (
                                <AlertCircle className="h-5 w-5" />
                            ) : (
                                <Mic className="h-6 w-6" />
                            )}
                        </Button>
                    ) : (
                        // Fallback if not supported
                        null
                    )}
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={!value.trim() || disabled}
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-full transition-all duration-300 shadow-sm",
                        value.trim()
                            ? "bg-primary text-primary-foreground hover:opacity-90 scale-100"
                            : "bg-muted text-muted-foreground/50 cursor-not-allowed scale-95 opacity-50"
                    )}
                    aria-label={LABELS.send.aria}
                >
                    <Send className="h-5 w-5 ml-0.5" />
                </Button>
            </div>

        </div>
    )
}
