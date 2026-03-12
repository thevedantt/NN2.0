"use server";

import { AnalysisMetrics } from "./analysis";

export async function analyzeFluencyWithAI(
    transcript: string | null,
    metrics: AnalysisMetrics,
    scenarioTitle: string,
    emotionTimelineString?: string
) {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is missing from environment variables!");
    }

    const prompt = `
    Role: You are a supportive speech coach.
    Task: Analyze this short speech transcript and metrics for a user practicing: "${scenarioTitle}".

    Data:
    - Transcript: "${transcript}"
    - Words Per Minute: ${metrics.wpm}
    - Filler Words: ${metrics.fillersCount}
    - Pauses: ${metrics.pauseCount}
    - Emotion Timeline: ${emotionTimelineString || "N/A"}

    Instructions:
    1. Be brief and encouraging.
    2. Identify one specific strength.
    3. Identify one specific, actionable area to improve.
    4. Provide ONE short actionable tip.
    5. Provide an improved, more articulate version of the user's answer.
    6. Return JSON ONLY matching this format.

    Format:
    {
      "feedback": "...",
      "strengths": "...",
      "improvement": "...",
      "actionableTip": "...",
      "improvedAnswer": "..."
    }
  `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemma-3-12b-it",
                messages: [{ role: "user", content: prompt }],
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenRouter API Error:", errorData);
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (error: any) {
        console.error("AI Analysis Failed", error);
        throw new Error(`AI Analysis Failed: ${error.message}`);
    }
};
