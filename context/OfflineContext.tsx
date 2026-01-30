"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

interface OfflineContextType {
    isOffline: boolean
    isManualOffline: boolean
    toggleOfflineMode: (value: boolean) => void
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true)
    const [isManualOffline, setIsManualOffline] = useState(false)

    // Mock Sync Function
    const syncOfflineData = async () => {
        // In a real app, this would read from localStorage and POST to an API
        const journalEntries = localStorage.getItem("offline-journal-entries")
        const moodLogs = localStorage.getItem("offline-mood-logs")

        if (journalEntries || moodLogs) {
            console.log("Syncing offline data...", { journalEntries, moodLogs })
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 2000))
            // success
            // toast.success("Data synced with cloud") 
            // Note: We keeping data in local storage for now as we don't have a real backend endpoint in this context.
        }
    }

    useEffect(() => {
        // Initial check
        if (typeof window !== "undefined") {
            setIsOnline(navigator.onLine)

            const storedPreference = localStorage.getItem("manual-offline-mode")
            if (storedPreference === "true") {
                setIsManualOffline(true)
            }
        }

        const handleOnline = () => {
            setIsOnline(true)
            // Only toast if not manually offline
            if (!isManualOffline) {
                toast.success("Back online", {
                    description: "All features available.",
                })
                syncOfflineData()
            }
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast.info("You are offline", {
                description: "Switched to offline mode.",
            })
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [isManualOffline])

    const toggleOfflineMode = (value: boolean) => {
        setIsManualOffline(value)
        localStorage.setItem("manual-offline-mode", String(value))

        if (value) {
            toast.info("Offline Mode Active", {
                description: "You've manually switched to offline mode.",
            })
        } else if (isOnline) {
            toast.success("Back online", {
                description: "All features available.",
            })
            syncOfflineData()
        }
    }

    // Effective state: True if browser is offline OR user manually set offline
    const isOffline = !isOnline || isManualOffline

    return (
        <OfflineContext.Provider value={{ isOffline, isManualOffline, toggleOfflineMode }}>
            {children}
        </OfflineContext.Provider>
    )
}

export function useOffline() {
    const context = useContext(OfflineContext)
    if (context === undefined) {
        throw new Error("useOffline must be used within an OfflineProvider")
    }
    return context
}
