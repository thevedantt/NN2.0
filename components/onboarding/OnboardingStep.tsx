"use client";

import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface OnboardingStepProps {
    title: string;
    description: string;
    children?: ReactNode;
}

export function OnboardingStep({ title, description, children }: OnboardingStepProps) {
    return (
        <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl p-6 max-w-sm w-full backdrop-blur-sm">
            {/* Decorative glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-sm -z-10" />

            {/* Icon badge */}
            <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground leading-tight">
                    {title}
                </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {description}
            </p>

            {/* Arrow pointing down toward the form */}
            <div className="flex justify-center">
                <div className="flex flex-col items-center gap-1 text-primary/60">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-bounce">
                        <path
                            d="M12 4v14m0 0l-5-5m5 5l5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            {children}
        </div>
    );
}
