/**
 * Emotion mapping for pet animations.
 * Maps each animation name to its emoji set and notification message.
 */

export interface EmotionConfig {
    emojis: string[]
    message: string
    color: string  // accent color for the toast
    sound?: string // optional sound file path (relative to public/)
}

export const EMOTION_MAP: Record<string, EmotionConfig> = {
    Happy: {
        emojis: ["😄", "🎉", "✨", "😊", "🌟"],
        message: "Your pet is happy! 🎉",
        color: "#FFD700",
    },
    Sad: {
        emojis: ["😢", "💧", "🥺", "😿", "💙"],
        message: "Your pet looks sad. See what's wrong. 😢",
        color: "#6BA3D6",
    },
    Love: {
        emojis: ["❤️", "💖", "💕", "😍", "💗"],
        message: "Your pet feels loved ❤️",
        color: "#FF6B8A",
    },
    Angry: {
        emojis: ["😠", "💢", "🔥", "😤", "⚡"],
        message: "Your pet seems angry! 😠",
        color: "#FF4444",
        sound: "/neuropet/voices/angry.mpeg",
    },
    Excited: {
        emojis: ["🤩", "🎊", "🚀", "⭐", "🎆"],
        message: "Your pet is excited! 🤩",
        color: "#FF8C00",
    },
    Confused: {
        emojis: ["🤔", "❓", "😵‍💫", "🌀", "❔"],
        message: "Your pet is confused... 🤔",
        color: "#B39DDB",
        sound: "/neuropet/voices/bgvoice.mpeg",
    },
    Sleepy: {
        emojis: ["😴", "💤", "🌙", "😪", "☁️"],
        message: "Your pet is getting sleepy... 😴",
        color: "#7986CB",
    },
    Scared: {
        emojis: ["😱", "⚡", "😨", "💀", "🙀"],
        message: "Your pet is scared! 😱",
        color: "#AB47BC",
    },
    Idle: {
        emojis: ["😌", "🍃", "🌿"],
        message: "Your pet is relaxing 🍃",
        color: "#81C784",
        sound: "/neuropet/voices/hello.mpeg",
    },
    Wave: {
        emojis: ["👋", "😊", "✨", "🤗"],
        message: "Your pet is waving at you! 👋",
        color: "#FFB74D",
    },
    Dance: {
        emojis: ["💃", "🕺", "🎵", "🎶", "✨"],
        message: "Your pet is dancing! 💃",
        color: "#FF7043",
    },
    Curious: {
        emojis: ["🧐", "👀", "🔍", "❓", "✨"],
        message: "Your pet is curious about something 🧐",
        color: "#4FC3F7",
    },
    Dizzy: {
        emojis: ["😵", "🌀", "💫", "⭐", "🔄"],
        message: "Your pet is dizzy! 😵",
        color: "#CE93D8",
        sound: "/neuropet/voices/dizzy.mpeg",
    },
    Clap: {
        emojis: ["👏", "🎉", "✨", "🤝", "⭐"],
        message: "Your pet is clapping! 👏",
        color: "#FFD54F",
    },
    Nod: {
        emojis: ["😊", "👍", "✅", "💚"],
        message: "Your pet is nodding in agreement 😊",
        color: "#66BB6A",
    },
    Shake: {
        emojis: ["😤", "🚫", "❌", "👎"],
        message: "Your pet disagrees! 😤",
        color: "#EF5350",
    },
}

/** Fallback for unmapped animations */
export const DEFAULT_EMOTION: EmotionConfig = {
    emojis: ["✨", "💫", "⭐"],
    message: "Your pet reacted!",
    color: "#FFB74D",
}

/** Get emotion config for an animation name */
export function getEmotion(animationName: string): EmotionConfig {
    return EMOTION_MAP[animationName] ?? DEFAULT_EMOTION
}
