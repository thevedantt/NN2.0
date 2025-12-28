import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const GROUPS = [
    {
        id: "anxiety-warriors",
        name: "Anxiety Warriors",
        category: "Anxiety",
        description: "A safe space to share strategies for managing daily anxiety and panic attacks.",
        membersCount: 1205,
        safeSpace: true
    },
    {
        id: "mindful-living",
        name: "Mindful Living",
        category: "Wellness",
        description: "Practicing mindfulness, meditation, and staying present in the moment.",
        membersCount: 890,
        safeSpace: true
    },
    {
        id: "depression-support",
        name: "Depression Support",
        category: "Depression",
        description: "You are not alone. Deeply supportive community for those navigating depression.",
        membersCount: 2300,
        safeSpace: true
    },
    {
        id: "social-confidence",
        name: "Social Confidence",
        category: "Social Anxiety",
        description: "Building confidence in social situations step by step.",
        membersCount: 450,
        safeSpace: true
    },
    {
        id: "sleep-insomnia",
        name: "Sleep & Insomnia",
        category: "Sleep",
        description: "Tips and support for better rest and sleep hygiene.",
        membersCount: 670,
        safeSpace: true
    },
    {
        id: "work-stress",
        name: "Work Stress",
        category: "Career",
        description: "Navigating burnout and workplace stress together.",
        membersCount: 1500,
        safeSpace: true
    }
];

export async function seedGroups() {
    try {
        console.log("Starting seed process...");
        for (const group of GROUPS) {
            const { id, ...data } = group;
            await setDoc(doc(db, "groups", id), {
                ...data,
                createdAt: serverTimestamp()
            });
            console.log(`✅ Group created: ${group.name}`);
        }
        console.log("Seed process completed successfully.");
    } catch (error) {
        console.error("Error creating groups:", error);
        throw error;
    }
}
