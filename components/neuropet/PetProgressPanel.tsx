"use client"

import React, { useEffect, useState } from "react"
import { usePetStore, GROWTH_STAGES } from "@/lib/neuropet/store/petStore"

/**
 * PetProgressPanel — a floating HUD showing the pet's level, XP, and growth stage.
 * Renders as an overlay on top of the 3D canvas.
 */
export default function PetProgressPanel({ children }: { children?: React.ReactNode }) {
    const {
        totalXP,
        level,
        growthStage,
        currentLevelXP,
        currentLevelRequired,
        actionCount,
        lastXPGain,
        justLeveledUp,
        dismissLevelUp,
        petName,
    } = usePetStore()

    const progressPercent = currentLevelRequired > 0
        ? Math.min((currentLevelXP / currentLevelRequired) * 100, 100)
        : 0

    // Find next growth stage
    const nextStage = GROWTH_STAGES.find((s) => s.minLevel > level)

    // XP float animation
    const [xpPopups, setXpPopups] = useState<{ id: number; amount: number }[]>([])

    useEffect(() => {
        if (lastXPGain > 0 && actionCount > 0) {
            const id = Date.now()
            setXpPopups((prev) => [...prev, { id, amount: lastXPGain }])
            const timer = setTimeout(() => {
                setXpPopups((prev) => prev.filter((p) => p.id !== id))
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [lastXPGain, actionCount])

    // Auto-dismiss level up after a few seconds
    useEffect(() => {
        if (justLeveledUp) {
            const timer = setTimeout(dismissLevelUp, 4000)
            return () => clearTimeout(timer)
        }
    }, [justLeveledUp, dismissLevelUp])

    return (
        <>
            {/* ─── Main Progress Panel (top-right) ─── */}
            <div
                style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    zIndex: 20,
                    pointerEvents: "auto",
                    width: "280px",
                    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                }}
            >
                <div
                    style={{
                        background: "rgba(15, 10, 25, 0.75)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 180, 100, 0.15)",
                        borderRadius: "16px",
                        padding: "18px 20px",
                        color: "#f5e6d0",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 200, 130, 0.08)",
                    }}
                >
                    {/* Header: Stage emoji + Level */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {/* Puppy Face Circular Avatar */}
                            <div
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    border: "2px solid #ffd475",
                                    boxShadow: "0 0 15px rgba(255, 212, 117, 0.3)",
                                    overflow: "hidden",
                                    position: "relative",
                                    animation: "gentle-bounce 3s ease-in-out infinite",
                                }}
                            >
                                <img
                                    src="/neuropet/pappyaface.png"
                                    alt="NeuroPet"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                {/* Small Emoji Overlay */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "-2px",
                                        right: "-2px",
                                        background: "rgba(15, 10, 25, 0.8)",
                                        borderRadius: "50%",
                                        width: "18px",
                                        height: "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "10px",
                                        border: "1px solid #ff9a56",
                                    }}
                                >
                                    {growthStage.emoji}
                                </div>
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 800,
                                        color: "#ffd475",
                                        marginBottom: "2px",
                                    }}
                                >
                                    {petName || "My NeuroPet"}
                                </div>
                                <div
                                    style={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: "1px",
                                        color: "rgba(255, 200, 130, 0.5)",
                                    }}
                                >
                                    {growthStage.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: 700,
                                        background: "linear-gradient(135deg, #ffd475, #ff9a56)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Level {level}
                                </div>
                            </div>
                        </div>

                        {/* Total XP badge */}
                        <div
                            style={{
                                background: "rgba(255, 180, 100, 0.1)",
                                border: "1px solid rgba(255, 180, 100, 0.2)",
                                borderRadius: "8px",
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#ffc880",
                            }}
                        >
                            {totalXP.toLocaleString()} XP
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div style={{ marginBottom: "10px" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "11px",
                                color: "rgba(245, 230, 208, 0.5)",
                                marginBottom: "6px",
                                fontWeight: 500,
                            }}
                        >
                            <span>Progress to Level {level + 1}</span>
                            <span>{currentLevelXP} / {currentLevelRequired}</span>
                        </div>

                        {/* Bar track */}
                        <div
                            style={{
                                width: "100%",
                                height: "8px",
                                background: "rgba(255, 255, 255, 0.06)",
                                borderRadius: "4px",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            {/* Filled portion */}
                            <div
                                style={{
                                    width: `${progressPercent}%`,
                                    height: "100%",
                                    background: "linear-gradient(90deg, #ff8c47, #ffd475, #ffab5e)",
                                    borderRadius: "4px",
                                    transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                                    position: "relative",
                                    boxShadow: "0 0 12px rgba(255, 170, 80, 0.4)",
                                }}
                            >
                                {/* Shimmer effect */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                                        animation: "shimmer 2s ease-in-out infinite",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Next Stage Preview */}
                    {nextStage && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "11px",
                                color: "rgba(245, 230, 208, 0.4)",
                                fontWeight: 500,
                            }}
                        >
                            <span style={{ fontSize: "13px" }}>{nextStage.emoji}</span>
                            <span>
                                Next stage: <span style={{ color: "rgba(255, 200, 130, 0.7)" }}>{nextStage.name}</span> at Lv.{nextStage.minLevel}
                            </span>
                        </div>
                    )}
                </div>

                {/* Children (Action Buttons) */}
                {children}

                {/* XP Popup Floaters */}
                <div style={{ position: "relative" }}>
                    {xpPopups.map((popup) => (
                        <div
                            key={popup.id}
                            style={{
                                position: "absolute",
                                top: "-30px",
                                right: "20px",
                                fontSize: "16px",
                                fontWeight: 700,
                                color: "#ffd475",
                                textShadow: "0 2px 8px rgba(255, 170, 50, 0.5)",
                                animation: "xp-float 1.5s ease-out forwards",
                                pointerEvents: "none",
                            }}
                        >
                            +{popup.amount} XP
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Level Up Toast ─── */}
            {justLeveledUp && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 30,
                        pointerEvents: "auto",
                        animation: "level-up-appear 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                    }}
                    onClick={dismissLevelUp}
                >
                    <div
                        style={{
                            background: "rgba(15, 10, 25, 0.9)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 210, 100, 0.3)",
                            borderRadius: "20px",
                            padding: "30px 50px",
                            textAlign: "center",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 80px rgba(255, 170, 50, 0.15)",
                            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                        }}
                    >
                        <div
                            style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                border: "3px solid #ffd475",
                                margin: "0 auto 16px",
                                overflow: "hidden",
                                position: "relative",
                                boxShadow: "0 0 30px rgba(255, 212, 117, 0.4)",
                                animation: "gentle-bounce 1.5s ease-in-out infinite"
                            }}
                        >
                            <img
                                src="/neuropet/pappyaface.png"
                                alt="NeuroPet"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            {/* Growth emoji as a small corner badge in the toast too */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "0px",
                                    right: "0px",
                                    background: "#1a1a2e",
                                    borderRadius: "50%",
                                    width: "28px",
                                    height: "28px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "16px",
                                    border: "2px solid #ff9a56",
                                }}
                            >
                                {growthStage.emoji}
                            </div>
                        </div>
                        <div
                            style={{
                                fontSize: "16px",
                                fontWeight: 800,
                                color: "#ffd475",
                                marginBottom: "4px",
                            }}
                        >
                            {petName}!
                        </div>
                        <div
                            style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "3px",
                                color: "rgba(255, 200, 130, 0.7)",
                                marginBottom: "6px",
                            }}
                        >
                            Level Up!
                        </div>
                        <div
                            style={{
                                fontSize: "36px",
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #ffd475, #ff9a56)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: "8px",
                            }}
                        >
                            Level {level}
                        </div>
                        <div
                            style={{
                                fontSize: "13px",
                                color: "rgba(245, 230, 208, 0.5)",
                            }}
                        >
                            {growthStage.name} Stage • Click to dismiss
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Keyframe animations (injected once) ─── */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes xp-float {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes level-up-appear {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
        </>
    )
}
