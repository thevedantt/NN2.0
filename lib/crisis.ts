
import crisisData from "@/data/crisis_keywords.json";

type RiskLevel = "low" | "moderate" | "high";

interface CrisisDetectionResult {
    riskLevel: RiskLevel;
    detectedKeywords: string[];
    actionRequired: boolean;
}

export function detectCrisis(message: string, language: string = 'en'): CrisisDetectionResult {
    // Combine keywords from ALL languages for maximum safety
    const allLanguages = Object.values(crisisData.languages);
    const normalizedMessage = message.toLowerCase();

    let detected: string[] = [];
    let highMatches = 0;
    let moderateMatches = 0;

    allLanguages.forEach((langKeywords: any) => {
        // Check High Risk
        langKeywords.high_risk.forEach((phrase: string) => {
            if (normalizedMessage.includes(phrase.toLowerCase())) {
                detected.push(phrase);
                highMatches++;
            }
        });

        // Check Moderate Risk
        langKeywords.moderate_risk.forEach((phrase: string) => {
            if (normalizedMessage.includes(phrase.toLowerCase())) {
                detected.push(phrase);
                moderateMatches++;
            }
        });
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
