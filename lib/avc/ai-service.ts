import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeFluencyWithAI = async (
    transcript: string,
    metrics: { wpm: number; fillersCount: number; pauseCount: number },
    scenario: string
) => {
    if (!transcript || transcript.length < 10) {
        return {
            feedback: "Please speak a bit more next time so I can analyze your speech patterns.",
            improvement: "Try to expand on your thoughts.",
            strengths: "You started the session!",
        };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Role: You are a supportive speech coach.
    Task: Analyze this short speech transcript and metrics for a user practicing: "${scenario}".
    
    Data:
    - Transcript: "${transcript}"
    - Words Per Minute: ${metrics.wpm}
    - Killer Fillers: ${metrics.fillersCount}
    - Pauses: ${metrics.pauseCount}

    Instructions:
    1. Be brief and encouraging.
    2. Identify one specific strength.
    3. Identify one specific, actionable improvement.
    4. Provide a short general feedback summary.
    5. Return JSON ONLY.

    Format:
    {
      "feedback": "...",
      "strengths": "...",
      "improvement": "..."
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Analysis Failed", error);
        return {
            feedback: "Great job practicing! Keep working on clarity and pacing.",
            strengths: "Consistency in practice.",
            improvement: "Check your pacing and filler words.",
        };
    }
};
