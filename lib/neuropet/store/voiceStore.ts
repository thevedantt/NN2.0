import { create } from "zustand"

export type VoiceState = "idle" | "listening" | "processing" | "speaking"

interface VoiceStore {
    state: VoiceState
    lastUserMessage: string | null
    lastPetMessage: string | null
    lastEmotion: string | null

    setState: (state: VoiceState) => void
    setMessages: (user: string, pet: string, emotion: string) => void
    reset: () => void
}

export const useVoiceStore = create<VoiceStore>((set) => ({
    state: "idle",
    lastUserMessage: null,
    lastPetMessage: null,
    lastEmotion: null,

    setState: (state) => set({ state }),
    setMessages: (user, pet, emotion) =>
        set({ lastUserMessage: user, lastPetMessage: pet, lastEmotion: emotion }),
    reset: () =>
        set({
            state: "idle",
            lastUserMessage: null,
            lastPetMessage: null,
            lastEmotion: null,
        }),
}))
