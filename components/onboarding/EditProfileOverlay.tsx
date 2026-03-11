"use client";

import { useEffect, useState, useCallback, RefObject } from "react";
import { Sparkles } from "lucide-react";

interface EditProfileOverlayProps {
    formRef: RefObject<HTMLDivElement | null>;
}

interface CardPosition {
    top: number;
    left: number;
    arrowDirection: "right" | "up";
}

export function EditProfileOverlay({ formRef }: EditProfileOverlayProps) {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<CardPosition | null>(null);

    const CARD_WIDTH = 280;
    const CARD_GAP = 24;

    const updatePosition = useCallback(() => {
        if (!formRef.current) return;

        const rect = formRef.current.getBoundingClientRect();

        // Check if there's enough room to the left of the form
        const spaceOnLeft = rect.left;
        const neededSpace = CARD_WIDTH + CARD_GAP + 14; // card + gap + arrow

        if (spaceOnLeft >= neededSpace) {
            // Place to the LEFT of the form
            setPosition({
                top: rect.top + 40,
                left: rect.left - CARD_WIDTH - CARD_GAP,
                arrowDirection: "right",
            });
        } else {
            // Not enough space on left — place ABOVE the form, centered
            setPosition({
                top: Math.max(12, rect.top - 220),
                left: rect.left + (rect.width / 2) - (CARD_WIDTH / 2),
                arrowDirection: "up",
            });
        }
    }, [formRef]);

    useEffect(() => {
        // Initial position calculation (slight delay to let layout settle)
        const initialTimer = setTimeout(updatePosition, 100);

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            clearTimeout(initialTimer);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [updatePosition]);

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
            {/* Onboarding card — dynamically positioned */}
            {position && (
                <div
                    style={{
                        position: "fixed",
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        pointerEvents: "auto",
                        zIndex: 100001,
                        display: "flex",
                        alignItems: "center",
                        gap: "0px",
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(10px)",
                        transition: "opacity 300ms ease-in-out, transform 300ms ease-in-out",
                    }}
                >
                    {/* Card */}
                    <div
                        style={{
                            background: "var(--card, #ffffff)",
                            borderRadius: "12px",
                            padding: "18px 22px",
                            width: `${CARD_WIDTH}px`,
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                            border: "1px solid var(--border, #e5e7eb)",
                        }}
                    >
                        {/* Icon + Title */}
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
                                Welcome to NeuroNet!
                            </h3>
                        </div>

                        {/* Body */}
                        <p
                            style={{
                                fontSize: "13px",
                                color: "var(--muted-foreground, #6b7280)",
                                lineHeight: 1.6,
                                margin: "0 0 10px 0",
                            }}
                        >
                            Before continuing, please complete your profile so we can personalize your experience.
                        </p>

                        {/* Secondary */}
                        <p
                            style={{
                                fontSize: "12px",
                                color: "var(--muted-foreground, #9ca3af)",
                                lineHeight: 1.5,
                                margin: 0,
                                fontStyle: "italic",
                            }}
                        >
                            Fill out the form on the right to continue.
                        </p>
                    </div>

                    {/* Right-pointing arrow (when card is to the left of form) */}
                    {position.arrowDirection === "right" && (
                        <div
                            style={{
                                width: 0,
                                height: 0,
                                borderTop: "10px solid transparent",
                                borderBottom: "10px solid transparent",
                                borderLeft: "14px solid var(--card, #ffffff)",
                                flexShrink: 0,
                                filter: "drop-shadow(2px 0 2px rgba(0,0,0,0.08))",
                            }}
                        />
                    )}
                </div>
            )}

            {/* Down-pointing arrow below card (when card is above form) */}
            {position && position.arrowDirection === "up" && (
                <div
                    style={{
                        position: "fixed",
                        top: `${position.top + 180}px`,
                        left: `${position.left + CARD_WIDTH / 2 - 10}px`,
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

            {/* Bottom tip pill */}
            <div
                style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    pointerEvents: "auto",
                    zIndex: 100001,
                }}
            >
                <div
                    style={{
                        background: "var(--card, #ffffff)",
                        border: "1px solid var(--border, #e5e7eb)",
                        borderRadius: "999px",
                        padding: "10px 20px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                    }}
                >
                    <p
                        style={{
                            fontSize: "12px",
                            color: "var(--muted-foreground, #6b7280)",
                            margin: 0,
                            textAlign: "center",
                        }}
                    >
                        <span style={{ color: "hsl(var(--primary))", fontWeight: 500 }}>Tip:</span>{" "}
                        Fill the form and click{" "}
                        <span style={{ fontWeight: 600, color: "var(--foreground, #111827)" }}>
                            &quot;Save Profile&quot;
                        </span>{" "}
                        to continue
                    </p>
                </div>
            </div>
        </div>
    );
}
