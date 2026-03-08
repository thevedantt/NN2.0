"use client"

import React, { useEffect, useState, useCallback } from "react"

/* ────────────────────────────────────────────────────
 * EmojiReaction — Google Meet-style emoji explosion
 *
 * Spawns a burst of emoji particles that explode outward
 * from a central point, float upward, and fade out.
 * Fully CSS-animated, zero runtime deps beyond React.
 * ──────────────────────────────────────────────────── */

interface EmojiParticle {
    id: number
    emoji: string
    x: number       // horizontal offset from center (px)
    y: number       // vertical start offset (px)
    dx: number      // horizontal drift direction
    dy: number      // upward speed multiplier
    rotation: number // initial rotation (deg)
    scale: number   // size multiplier
    delay: number   // stagger delay (ms)
}

interface EmojiReactionProps {
    /** Array of emojis to choose from for this burst */
    emojis: string[]
    /** Unique trigger key — change this to fire a new burst */
    triggerKey: number
    /** Number of particles per burst */
    particleCount?: number
    /** Duration of each particle animation (ms) */
    duration?: number
    /** Accent color for the glow ring */
    accentColor?: string
}

let globalParticleId = 0

export default function EmojiReaction({
    emojis,
    triggerKey,
    particleCount = 12,
    duration = 1800,
    accentColor = "#FFD700",
}: EmojiReactionProps) {
    const [particles, setParticles] = useState<EmojiParticle[]>([])
    const [showRing, setShowRing] = useState(false)

    const spawnBurst = useCallback(() => {
        const newParticles: EmojiParticle[] = []
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
            const speed = 40 + Math.random() * 60
            newParticles.push({
                id: ++globalParticleId,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                x: 0,
                y: 0,
                dx: Math.cos(angle) * speed,
                dy: -Math.abs(Math.sin(angle)) * speed - 20 - Math.random() * 40,
                rotation: (Math.random() - 0.5) * 60,
                scale: 0.7 + Math.random() * 0.6,
                delay: Math.random() * 120,
            })
        }
        setParticles(newParticles)
        setShowRing(true)

        // Clean up particles after animation completes
        setTimeout(() => {
            setParticles([])
            setShowRing(false)
        }, duration + 200)
    }, [emojis, particleCount, duration])

    // Trigger burst when triggerKey changes (but skip initial mount / key=0)
    useEffect(() => {
        if (triggerKey > 0) {
            spawnBurst()
        }
    }, [triggerKey, spawnBurst])

    if (particles.length === 0 && !showRing) return null

    return (
        <div
            style={{
                position: "absolute",
                top: "30%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 25,
                pointerEvents: "none",
                width: 0,
                height: 0,
            }}
        >
            {/* Glow ring pulse */}
            {showRing && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
                        animation: `ring-pulse ${duration * 0.4}ms ease-out forwards`,
                    }}
                />
            )}

            {/* Emoji particles */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    style={{
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        fontSize: `${24 * p.scale}px`,
                        animationName: "emoji-burst",
                        animationDuration: `${duration}ms`,
                        animationTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
                        animationFillMode: "forwards",
                        animationDelay: `${p.delay}ms`,
                        opacity: 0,
                        // Pass motion params via CSS custom properties
                        ["--burst-dx" as string]: `${p.dx}px`,
                        ["--burst-dy" as string]: `${p.dy}px`,
                        ["--burst-rot" as string]: `${p.rotation}deg`,
                        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
                        willChange: "transform, opacity",
                    }}
                >
                    {p.emoji}
                </div>
            ))}

            {/* Keyframe styles (injected once via React) */}
            <style>{`
        @keyframes emoji-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.3);
          }
          15% {
            opacity: 1;
            transform: translate(
              calc(var(--burst-dx) * 0.4),
              calc(var(--burst-dy) * 0.3)
            ) rotate(calc(var(--burst-rot) * 0.5)) scale(1.2);
          }
          40% {
            opacity: 1;
            transform: translate(
              calc(var(--burst-dx) * 0.8),
              calc(var(--burst-dy) * 0.7)
            ) rotate(var(--burst-rot)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
              var(--burst-dx),
              calc(var(--burst-dy) - 60px)
            ) rotate(var(--burst-rot)) scale(0.6);
          }
        }

        @keyframes ring-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    )
}
