import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const GROUP_IDS = [
    "anxiety-warriors",
    "mindful-living",
    "depression-support",
    "social-confidence",
    "sleep-and-insomnia",
    "work-stress",
];

const MESSAGES_POOL = [
    [
        { text: "Had a tough morning, but trying deep breathing.", username: "HopefulSky" },
        { text: "You're not alone. This community helps.", username: "CalmBadger" },
        { text: "Small steps still matter.", username: "GentleRain" },
    ],
    [
        { text: "Anyone else feeling overwhelmed today?", username: "BlueOcean" },
        { text: "Just take it one hour at a time.", username: "MountainHiker" },
        { text: "Sending positive vibes to everyone.", username: "SunnyDay" },
        { text: "Thanks, I really needed to hear that.", username: "BlueOcean" },
    ],
    [
        { text: "Found a great book on this topic.", username: "ReaderOne" },
        { text: "Please share the title!", username: "CuriousMind" },
        { text: "It's called 'The Upward Spiral'.", username: "ReaderOne" },
    ],
    [
        { text: "Is anyone awake?", username: "NightOwl" },
        { text: "Yeah, can't sleep either.", username: "SleeplessInSeattle" },
        { text: "Have you tried 4-7-8 breathing?", username: "CalmBadger" },
    ]
];

const getRandomMessages = () => {
    const index = Math.floor(Math.random() * MESSAGES_POOL.length);
    return MESSAGES_POOL[index];
};

export const seedGroupMessages = async () => {
    try {
        for (const groupId of GROUP_IDS) {
            const messagesRef = collection(db, "groups", groupId, "messages");

            // Select a random set of messages or use a specific set per group if desired. 
            // For simplicity/variety, we rotate or pick random.
            // Let's ensure at least 3-4 messages as requested.
            const messages = getRandomMessages();

            for (const msg of messages) {
                await addDoc(messagesRef, {
                    text: msg.text,
                    username: msg.username,
                    anonymous: false,
                    createdAt: serverTimestamp(),
                });
            }
            console.log(`Seeded messages for group: ${groupId}`);
        }
    } catch (error) {
        console.error("Error seeding messages:", error);
        throw error;
    }
};
