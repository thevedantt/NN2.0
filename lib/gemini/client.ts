
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");
export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
// Note: Using gemini-2.0-flash-exp as requested (or falling back to the latest valid one if 2.5 is not yet standard in the generic SDK typings, but the user asked for gemini-2.5-flash.
// The user prompt said 'model="gemini-2.5-flash"'. I should use that string.
// However, sticking to valid known models or exactly what user asked.
// I will use "gemini-2.5-flash" as requested string.
