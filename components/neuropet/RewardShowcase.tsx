"use client"

import React from "react"
import { usePetStore } from "@/lib/neuropet/store/petStore"

/**
 * RewardShowcase — BMW M4 reward displayed on the same visual plane as the pet.
 * 
 * Before level 50: shows a locked teaser badge (top-left).
 * At level 50+: renders the Sketchfab 3D car embed directly on the viewport,
 * positioned to the left of the pet so it appears on the same ground surface.
 */

const REWARD_LEVEL = 50
const SKETCHFAB_URL =
    "https://sketchfab.com/models/46e26dc0643f40b58f02ccec531c54f7/embed?autostart=1&transparent=1&ui_theme=dark&ui_controls=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&camera=0"

export default function RewardShowcase() {
    const level = usePetStore((s) => s.level)
    const isUnlocked = level >= REWARD_LEVEL
    const progressPercent = Math.min((level / REWARD_LEVEL) * 100, 100)

    return (
        <>
            {/* ─── Locked teaser badge (top-left) — shown before level 50 ─── */}
            {!isUnlocked && (
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        zIndex: 20,
                        pointerEvents: "auto",
                        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                        animation: "reward-slide-in 0.4s ease-out forwards",
                    }}
                >
                    <div
                        style={{
                            background: "rgba(15, 10, 25, 0.75)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "14px",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        {/* Blurred car icon */}
                        <div
                            style={{
                                fontSize: "26px",
                                filter: "blur(1.5px) grayscale(70%)",
                                opacity: 0.5,
                            }}
                        >
                            🏎️
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "rgba(245, 230, 208, 0.5)",
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                    marginBottom: "4px",
                                }}
                            >
                                🔒 Lv.{REWARD_LEVEL} Reward
                            </div>

                            {/* Mini progress bar */}
                            <div
                                style={{
                                    width: "120px",
                                    height: "4px",
                                    background: "rgba(255, 255, 255, 0.06)",
                                    borderRadius: "2px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${progressPercent}%`,
                                        height: "100%",
                                        background: "linear-gradient(90deg, #1CAAD9, #00E5FF)",
                                        borderRadius: "2px",
                                        transition: "width 0.6s ease",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    fontSize: "10px",
                                    color: "rgba(245, 230, 208, 0.3)",
                                    marginTop: "3px",
                                }}
                            >
                                {REWARD_LEVEL - level} levels away
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Unlocked: car on the ground surface beside the pet ─── */}
            {/* 
            {isUnlocked && (
                <div
                    style={{
                        position: "absolute",
                        // Position to sit on the right side of the ground surface
                        bottom: "15%",
                        right: "5%",
                        width: "40vw",
                        height: "55vh",
                        zIndex: 5,
                        pointerEvents: "auto",
                        animation: "car-drive-in-right 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                    }}
                >
                    <iframe
                        title="BMW M4 CS LCI G82 — Level 50 Reward"
                        src={SKETCHFAB_URL}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            background: "transparent",
                        }}
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        allowFullScreen
                    />

                    <div
                        style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontFamily: "'Inter', system-ui, sans-serif",
                            textAlign: "center",
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            style={{
                                background: "rgba(15, 10, 25, 0.7)",
                                backdropFilter: "blur(8px)",
                                borderRadius: "8px",
                                padding: "5px 14px",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#1CAAD9",
                                border: "1px solid rgba(28, 170, 217, 0.2)",
                                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                            }}
                        >
                            🏆 BMW M4 CS — Level {REWARD_LEVEL} Reward
                        </div>
                    </div>
                </div>
            )}
            */}

            {/* Keyframes */}
            <style>{`
        @keyframes reward-slide-in {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes car-drive-in-right {
          0% {
            opacity: 0;
            transform: translateX(100px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </>
    )
}
