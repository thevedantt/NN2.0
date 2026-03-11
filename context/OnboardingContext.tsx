"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

const STORAGE_KEY = "nn_onboarding_profile_completed";

interface OnboardingContextType {
    isOnboardingActive: boolean;
    setOnboardingActive: (active: boolean) => void;
    completeOnboarding: () => void;
    isProfileComplete: boolean;
    setIsProfileComplete: (complete: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [isOnboardingActive, setOnboardingActive] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        const completed = localStorage.getItem(STORAGE_KEY);
        if (completed === "true") {
            setOnboardingActive(false);
        }
    }, []);

    const completeOnboarding = useCallback(() => {
        setOnboardingActive(false);
        localStorage.setItem(STORAGE_KEY, "true");
    }, []);

    return (
        <OnboardingContext.Provider
            value={{
                isOnboardingActive,
                setOnboardingActive,
                completeOnboarding,
                isProfileComplete,
                setIsProfileComplete,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
}
