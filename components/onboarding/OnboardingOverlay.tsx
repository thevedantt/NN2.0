"use client";

import { useEffect, useState } from "react";
import { OnboardingStep } from "./OnboardingStep";

interface OnboardingOverlayProps {
    isActive: boolean;
}

export function OnboardingOverlay({ isActive }: OnboardingOverlayProps) {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isActive) {
            setMounted(true);
            // Small delay to trigger CSS transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setVisible(true);
                });
            });
        } else {
            setVisible(false);
            const timer = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isActive]);

    if (!mounted) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] pointer-events-none"
            style={{
                transition: "opacity 300ms ease-in-out",
                opacity: visible ? 1 : 0,
            }}
        >
            {/* Dark overlay background */}
            <div
                className="absolute inset-0"
                style={{
                    background: "rgba(0, 0, 0, 0.55)",
                }}
            />

            {/* Spotlight cutout area - positioned to roughly cover the form area */}
            {/* We use a radial gradient to create a spotlight effect in the center */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 500px 600px at 50% 55%, transparent 0%, transparent 100%)",
                    maskImage:
                        "radial-gradient(ellipse 400px 500px at 50% 60%, black 0%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 400px 500px at 50% 60%, black 0%, transparent 100%)",
                    backgroundColor: "rgba(0, 0, 0, 0.55)",
                    mixBlendMode: "multiply",
                }}
            />

            {/* Message card - positioned at the top center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
                <OnboardingStep
                    title="Welcome to NeuroNet!"
                    description="Let's start by completing your profile. Fill out the following details so NeuroNet can personalize your experience — from AI companions to therapy recommendations."
                />
            </div>

            {/* Bottom hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-full px-5 py-2.5 shadow-lg">
                    <p className="text-xs text-muted-foreground text-center">
                        <span className="text-primary font-medium">Tip:</span>{" "}
                        Fill the form below and click{" "}
                        <span className="font-semibold text-foreground">&quot;Save Profile&quot;</span>{" "}
                        to continue
                    </p>
                </div>
            </div>
        </div>
    );
}
