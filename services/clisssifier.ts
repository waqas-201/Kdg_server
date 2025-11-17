import { AppResult } from "@/app/api/check/route";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
   
});


export async function classifiedApps(appNames: { appName: string; packageName: string; }[]) {
    console.log("Classifying apps via Gemini:", appNames.length);
    
    try {
        const prompt = `
You are an app safety classifier.

Your job:
- For each app in "apps" array, classify if it is safe for kids
- Respond ONLY with clean JSON array matching this TypeScript interface:

interface App {
  packageName: string;
  appName: string;
  isKidSafe: boolean;
  minAge: number | null;
}

Rules:
- If the app is unsafe, set isKidSafe = false and minAge = null
- If safe, set isKidSafe = true and minAge to minimum recommended age
- Do NOT add or remove any fields
- minAge must be start from 1 not zero and end at 16
- Respond ONLY JSON. No text. No explanation.


Apps to classify:
${JSON.stringify(appNames, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        });

        let text = response.text;

        if (!text) return null;

        text = text
            .trim()
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();
          console.log("Gemini Raw Response:", text);
          
        return JSON.parse(text) as AppResult[];



    } catch (error) {
        console.error("Gemini ERROR:", error);
        return null;
    }
}
