export type Scenario = {
    id: string;
    title: string;
    description: string;
    category: 'Social Anxiety' | 'Interview' | 'Public Speaking';
    difficulty: 'Reference' | 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    instructions: string[];
    bgGradient: string;
    icon: string;
};

export const SCENARIOS: Scenario[] = [
    {
        id: 'coffee-order',
        title: 'Ordering Coffee',
        description: 'Practice a simple, low-stakes interaction with a barista. Focus on eye contact and clear speech.',
        category: 'Social Anxiety',
        difficulty: 'Beginner',
        duration: '1-2 mins',
        instructions: [
            'Maintain gentle eye contact with the camera.',
            'Greet the barista (camera) with a smile.',
            'Clearly state your order (e.g., "Hi, can I get an oat milk latte?").',
            'Say "Thank you" at the end.'
        ],
        bgGradient: 'from-orange-100 to-amber-50',
        icon: 'Coffee'
    },
    {
        id: 'intro-interview',
        title: 'Tell Me About Yourself',
        description: 'The most common interview opener. Practice a concise 60-second professional summary.',
        category: 'Interview',
        difficulty: 'Intermediate',
        duration: '2-3 mins',
        instructions: [
            'Start with your current role or status.',
            'Briefly mention 1-2 key achievements.',
            'Explain why you are interested in this opportunity.',
            'Keep your posture upright and confident.'
        ],
        bgGradient: 'from-blue-100 to-indigo-50',
        icon: 'Briefcase'
    },
    {
        id: 'elevator-pitch',
        title: '30-Second Pitch',
        description: 'Deliver a high-energy pitch about an idea or project. Focus on pacing and removing filler words.',
        category: 'Public Speaking',
        difficulty: 'Advanced',
        duration: '1 min',
        instructions: [
            'Start with a strong hook.',
            'Clearly state the problem and your solution.',
            'End with a call to action.',
            'Minimize "um", "uh", and pauses.'
        ],
        bgGradient: 'from-purple-100 to-pink-50',
        icon: 'Mic'
    }
];
