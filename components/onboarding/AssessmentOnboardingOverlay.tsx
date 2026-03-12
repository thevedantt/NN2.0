"use client";

import { useEffect, useState, RefObject } from "react";
import { Sparkles } from "lucide-react";

interface AssessmentOnboardingOverlayProps {
    cardsRef: RefObject<HTMLDivElement | null>;
}

export function AssessmentOnboardingOverlay({ cardsRef }: AssessmentOnboardingOverlayProps) {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null);

    useEffect(() => {
        const updatePosition = () => {
            if (!cardsRef.current) return;
            const rect = cardsRef.current.getBoundingClientRect();
            // Place tooltip card centered above the assessment cards
            setPosition({
                top: Math.max(20, rect.top - 200),
                left: rect.left + (rect.width / 2) - (340 / 2)
            });
        };

        const initialTimer = setTimeout(updatePosition, 100);
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            clearTimeout(initialTimer);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [cardsRef]);

    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setVisible(true);
            });
        });
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0, 0, 0, 0.55)",
                zIndex: 99999,
                pointerEvents: "none",
                opacity: visible ? 1 : 0,
                transition: "opacity 300ms ease-in-out",
            }}
        >
            {/* Onboarding message card */}
            {position && (
                <div
                    style={{
                        position: "fixed",
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        pointerEvents: "auto",
                        zIndex: 100001,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0px",
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(10px)",
                        transition: "opacity 300ms ease-in-out, transform 300ms ease-in-out",
                    }}
                >
                    {/* Card container */}
                    <div
                        style={{
                            background: "var(--card, #ffffff)",
                            borderRadius: "12px",
                            padding: "18px 22px",
                            width: "340px",
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                            border: "1px solid var(--border, #e5e7eb)",
                        }}
                    >
                        {/* Title Row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "10px",
                                    background: "hsl(var(--primary) / 0.1)",
                                    color: "hsl(var(--primary))",
                                    flexShrink: 0,
                                }}
                            >
                                <Sparkles style={{ width: "18px", height: "18px" }} />
                            </div>
                            <h3
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "var(--foreground, #111827)",
                                    margin: 0,
                                    lineHeight: 1.3,
                                }}
                            >
                                Let's understand how you're feeling.
                            </h3>
                        </div>

                        <p
                            style={{
                                fontSize: "13px",
                                color: "var(--muted-foreground, #6b7280)",
                                lineHeight: 1.6,
                                margin: "0 0 10px 0",
                            }}
                        >
                            Answer these short questions so NeuroNet can better understand your thoughts and emotional state.
                        </p>

                        <p
                            style={{
                                fontSize: "12px",
                                color: "var(--muted-foreground, #9ca3af)",
                                lineHeight: 1.5,
                                margin: 0,
                                fontStyle: "italic",
                            }}
                        >
                            It only takes a few minutes and helps personalize your experience.
                        </p>
                    </div>
                </div>
            )}

            {/* Down-pointing arrow */}
            {position && (
                <div
                    style={{
                        position: "fixed",
                        top: `${position.top + 160}px`,
                        left: `${position.left + (340 / 2) - 10}px`,
                        pointerEvents: "none",
                        zIndex: 100001,
                        width: 0,
                        height: 0,
                        borderLeft: "10px solid transparent",
                        borderRight: "10px solid transparent",
                        borderTop: "14px solid var(--card, #ffffff)",
                        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.08))",
                    }}
                />
            )}
        </div>
    );
}
