
export interface Doctor {
    id: string;
    name: string;
    image: string; // "thp1" | "thp2" | "thp3"
    specialization: string;
    experience: number; // years
    languages: string[];
    description: string;
    availability: string[]; // e.g. ["Mon", "Tue", "Thu"]
    price: number;
    rating: number;
}

export const DOCTORS: Doctor[] = [
    {
        id: "d1",
        name: "Dr. Sarah Mitchell",
        image: "/thp1.jpg",
        specialization: "Anxiety & Depression",
        experience: 8,
        languages: ["English", "Spanish"],
        description: "Specializing in CBT and mindfulness-based therapies for anxiety and depression management.",
        availability: ["Mon", "Wed", "Fri"],
        price: 120,
        rating: 4.9
    },
    {
        id: "d2",
        name: "Dr. James Wilson",
        image: "/thp2.jpg",
        specialization: "Career Stress & Burnout",
        experience: 12,
        languages: ["English"],
        description: "Helping professionals navigate workplace stress, burnout, and career transitions.",
        availability: ["Tue", "Thu"],
        price: 150,
        rating: 4.8
    },
    {
        id: "d3",
        name: "Dr. Emily Chen",
        image: "/thp3.jpg",
        specialization: "Trauma & PTSD",
        experience: 10,
        languages: ["English", "Mandarin"],
        description: "Expert in trauma-informed care and EMDR therapy for healing and recovery.",
        availability: ["Mon", "Thu", "Sat"],
        price: 135,
        rating: 4.9
    }
];
