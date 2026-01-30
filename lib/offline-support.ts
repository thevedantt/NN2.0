import { offlineSupportMap, DEFAULT_OFFLINE_RESPONSES } from "@/data/offline-dataset";

interface OfflineResponse {
    content: string;
    isOffline: boolean;
}

export function getOfflineResponse(input: string, language: string): OfflineResponse {
    const normalizedInput = input.toLowerCase();
    const words = normalizedInput.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);

    let matchKey: string | null = null;

    // Simple keyword matching
    for (const word of words) {
        if (offlineSupportMap[word]) {
            matchKey = word;
            break;
        }
    }


    // Normalize language code (e.g., "hi-IN" -> "hi") to match dataset keys
    const langCode = language.split('-')[0].toLowerCase();

    let responseText = "";

    if (matchKey) {
        const variants = offlineSupportMap[matchKey];
        // Try exact match, then normalized match, then English fallback
        responseText = variants[language] || variants[langCode] || variants['en'];
    } else {
        // Default
        responseText = DEFAULT_OFFLINE_RESPONSES[language] || DEFAULT_OFFLINE_RESPONSES[langCode] || DEFAULT_OFFLINE_RESPONSES['en'];
    }

    return {
        content: responseText,
        isOffline: true
    };
}
