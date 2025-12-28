
import crisisData from "@/data/crisis_keywords.json";

type RiskLevel = "low" | "moderate" | "high";

interface CrisisDetectionResult {
    riskLevel: RiskLevel;
    detectedKeywords: string[];
    actionRequired: boolean;
}

export function detectCrisis(message: string, language: string = 'en'): CrisisDetectionResult {
    const langCode = language === 'hi' ? 'hi' : 'en';
    const keywords = crisisData.languages[langCode];
    const normalizedMessage = message.toLowerCase();

    let detected: string[] = [];
    let highMatches = 0;
    let moderateMatches = 0;

    // Check High Risk
    keywords.high_risk.forEach((phrase) => {
        if (normalizedMessage.includes(phrase.toLowerCase())) {
            detected.push(phrase);
            highMatches++;
        }
    });

    // Check Moderate Risk
    keywords.moderate_risk.forEach((phrase) => {
        if (normalizedMessage.includes(phrase.toLowerCase())) {
            detected.push(phrase);
            moderateMatches++;
        }
    });

    // Determine Risk Level based on rules
    const rules = crisisData.rules.high_risk_trigger;

    if (highMatches >= rules.min_strong_matches) {
        return { riskLevel: "high", detectedKeywords: detected, actionRequired: true };
    }

    if (moderateMatches >= rules.or_multiple_moderate) {
        return { riskLevel: "high", detectedKeywords: detected, actionRequired: true }; // Treat multiple moderate as high for safety
    }

    if (moderateMatches > 0) {
        return { riskLevel: "moderate", detectedKeywords: detected, actionRequired: false };
    }

    return { riskLevel: "low", detectedKeywords: [], actionRequired: false };
}
