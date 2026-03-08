import { create } from "zustand"

/* ────────────────────────────────────────────────────
 * Growth stages — unlocked at specific levels.
 * The pet model doesn't change yet, but the structure
 * is ready for future visual evolution.
 * ──────────────────────────────────────────────────── */
export const GROWTH_STAGES = [
    { name: "Hatchling", minLevel: 1, emoji: "🥚" },
    { name: "Baby", minLevel: 3, emoji: "🐣" },
    { name: "Juvenile", minLevel: 6, emoji: "🐾" },
    { name: "Teen", minLevel: 10, emoji: "🌟" },
    { name: "Adult", minLevel: 15, emoji: "🔥" },
    { name: "Elder", minLevel: 25, emoji: "👑" },
    { name: "Mythic", minLevel: 40, emoji: "✨" },
    { name: "Legendary", minLevel: 50, emoji: "🏎️" },
] as const

export type GrowthStageName = (typeof GROWTH_STAGES)[number]["name"]

/* ────────────────────────────────────────────────────
 * XP → Level formula
 *
 * Each level requires progressively more XP:
 *   XP needed for level N  =  BASE * N ^ EXPONENT
 *
 * This gives a smooth curve that slows down as you
 * level up, without feeling impossible.
 * ──────────────────────────────────────────────────── */
const XP_BASE = 50
const XP_EXPONENT = 1.4

/** Total cumulative XP required to reach a given level */
export function xpForLevel(level: number): number {
    if (level <= 1) return 0
    let total = 0
    for (let i = 2; i <= level; i++) {
        total += Math.floor(XP_BASE * Math.pow(i, XP_EXPONENT))
    }
    return total
}

/** XP required just for the current level (the slice) */
export function xpForCurrentLevel(level: number): number {
    return Math.floor(XP_BASE * Math.pow(level, XP_EXPONENT))
}

/** Derive level from total XP */
function levelFromXP(totalXP: number): number {
    let level = 1
    let cumulative = 0
    while (true) {
        const nextCost = Math.floor(XP_BASE * Math.pow(level + 1, XP_EXPONENT))
        if (cumulative + nextCost > totalXP) break
        cumulative += nextCost
        level++
    }
    return level
}

/** Derive current growth stage from level */
function stageFromLevel(level: number): (typeof GROWTH_STAGES)[number] {
    let result: (typeof GROWTH_STAGES)[number] = GROWTH_STAGES[0]
    for (const stage of GROWTH_STAGES) {
        if (level >= stage.minLevel) result = stage
    }
    return result
}


/* ────────────────────────────────────────────────────
 * XP rewards for different user actions.
 * Playing an animation = interacting with your pet.
 * ──────────────────────────────────────────────────── */
export const ACTION_XP: Record<string, number> = {
    // Animation interactions
    play_animation: 5,
    // Special animations get bonus XP
    Dance: 12,
    Wave: 8,
    Happy: 10,
    Love: 15,
    Clap: 8,
    // Negative emotions penalize XP
    Sad: -5,
    Angry: -5,
    Scared: -5,
    // Generic interaction fallback
    interact: 3,
    // Future actions (feed, pet, clean, etc.)
    feed: 20,
    pet: 10,
    clean: 15,
}

/* ────────────────────────────────────────────────────
 * Store interface
 * ──────────────────────────────────────────────────── */
interface PetState {
    // Core progression
    totalXP: number
    level: number
    growthStage: (typeof GROWTH_STAGES)[number]

    // XP progress within current level
    currentLevelXP: number       // how much XP earned into current level
    currentLevelRequired: number // how much XP needed to complete current level

    // Action log (for future analytics / streak tracking)
    actionCount: number
    lastAction: string | null
    lastXPGain: number

    // Level up notification state
    justLeveledUp: boolean
    previousLevel: number

    // Pet details
    petName: string | null

    // Actions
    addXP: (amount: number, action?: string) => void
    performAction: (actionName: string) => void
    setPetName: (name: string) => void
    dismissLevelUp: () => void
    reset: () => void
}

function computeDerived(totalXP: number) {
    const level = levelFromXP(totalXP)
    const growthStage = stageFromLevel(level)
    const xpAtCurrentLevel = xpForLevel(level)
    const xpAtNextLevel = xpForLevel(level + 1)
    const currentLevelXP = totalXP - xpAtCurrentLevel
    const currentLevelRequired = xpAtNextLevel - xpAtCurrentLevel
    return { level, growthStage, currentLevelXP, currentLevelRequired }
}

export const usePetStore = create<PetState>((set, get) => ({
    // Initial state
    totalXP: 0,
    level: 1,
    growthStage: GROWTH_STAGES[0],
    currentLevelXP: 0,
    currentLevelRequired: xpForLevel(2),
    actionCount: 0,
    lastAction: null,
    lastXPGain: 0,
    justLeveledUp: false,
    previousLevel: 1,
    petName: null,

    addXP: (amount: number, action?: string) => {
        const state = get()
        const newTotalXP = Math.max(0, state.totalXP + amount)
        const derived = computeDerived(newTotalXP)
        const didLevelUp = derived.level > state.level

        set({
            totalXP: newTotalXP,
            ...derived,
            actionCount: state.actionCount + 1,
            lastAction: action ?? null,
            lastXPGain: amount,
            justLeveledUp: didLevelUp,
            previousLevel: didLevelUp ? state.level : state.previousLevel,
        })
    },

    performAction: (actionName: string) => {
        // Look up XP for specific action, then generic category, then fallback
        const xp = ACTION_XP[actionName] ?? ACTION_XP.play_animation ?? 5
        get().addXP(xp, actionName)
    },

    setPetName: (name: string) => set({ petName: name }),

    dismissLevelUp: () => set({ justLeveledUp: false }),

    reset: () => set({
        totalXP: 0,
        level: 1,
        growthStage: GROWTH_STAGES[0],
        currentLevelXP: 0,
        currentLevelRequired: xpForLevel(2),
        actionCount: 0,
        lastAction: null,
        lastXPGain: 0,
        justLeveledUp: false,
        previousLevel: 1,
        petName: null,
    }),
}))
