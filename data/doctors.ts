
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
        name: "Dr. Ananya Sharma",
        image: "/thp1.jpg",
        specialization: "Anxiety & Depression",
        experience: 8,
        languages: ["English", "Hindi"],
        description: "Specializing in CBT and mindfulness-based therapies for anxiety and depression management.",
        availability: ["Mon", "Wed", "Fri"],
        price: 499,
        rating: 4.9
    },
    {
        id: "d2",
        name: "Dr. Sneha Gupta",
        image: "/thp3.jpg",
        specialization: "Career Stress & Burnout",
        experience: 12,
        languages: ["English", "Hindi", "Gujarati"],
        description: "Helping professionals navigate workplace stress, burnout, and career transitions.",
        availability: ["Tue", "Thu"],
        price: 699,
        rating: 4.8
    },
    {
        id: "d3",
        name: "Dr. Rahul Mehta",
        image: "/thp2.jpg",
        specialization: "Trauma & PTSD",
        experience: 10,
        languages: ["English", "Hindi", "Punjabi"],
        description: "Expert in trauma-informed care and EMDR therapy for healing and recovery.",
        availability: ["Mon", "Thu", "Sat"],
        price: 599,
        rating: 4.9
    },
    {
        id: "d4",
        name: "Dr. Arjun Verma",
        image: "/thp4.jpg",
        specialization: "Relationship & Family Therapy",
        experience: 15,
        languages: ["English", "Hindi", "Marathi"],
        description: "Specialized in couples counseling, family dynamics, and conflict resolution.",
        availability: ["Wed", "Sat", "Sun"],
        price: 799,
        rating: 4.9
    }
];
