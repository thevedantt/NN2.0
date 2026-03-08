"use client"

import React from "react"

interface ActionButtonsProps {
    animations: string[]
    onPlay: (name: string) => void
}

const EMOJI_MAP: Record<string, string> = {
    Idle: "😌",
    Happy: "😄",
    Sad: "😢",
    Excited: "🤩",
    Sleepy: "😴",
    Wave: "👋",
    Dance: "💃",
    Scared: "😱",
    Curious: "🤔",
    Angry: "😠",
    Love: "❤️",
    Confused: "❓",
    Dizzy: "😵",
    Clap: "👏",
    Nod: "👍",
    Shake: "👎",
}

export default function ActionButtons({ animations, onPlay }: ActionButtonsProps) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginTop: "12px",
                background: "rgba(15, 10, 25, 0.6)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                padding: "12px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
        >
            <style>{`
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: scale(1.1);
          border-color: rgba(255, 212, 117, 0.4) !important;
          box-shadow: 0 4px 12px rgba(255, 170, 80, 0.3) !important;
        }
        .action-btn:active {
          transform: scale(0.95);
        }
      `}</style>

            {animations.map((name) => (
                <button
                    key={name}
                    onClick={() => onPlay(name)}
                    title={name}
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.05)",
                        fontSize: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                        position: "relative",
                    }}
                    className="action-btn"
                >
                    {EMOJI_MAP[name] || "✨"}
                </button>
            ))}
        </div>
    )
}
