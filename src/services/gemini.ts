import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateWebsiteStructure(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a complete, professional, multi-file website project based on this prompt: "${prompt}". 
    The output must be a valid JSON object with:
    1. "name": A creative name for the project.
    2. "description": A brief summary of the project.
    3. "features": An array of key features implemented.
    4. "files": An array of objects, each with "path" (filename) and "content" (code). 
       Include at least: index.html, styles.css, main.js, and README.md.
       Use Tailwind CSS classes in the HTML, but also provide a custom styles.css for advanced effects.
    
    Make it look premium, modern, and responsive.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          features: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["path", "content"]
            }
          }
        },
        required: ["name", "description", "features", "files"]
      }
    }
  });

  return JSON.parse(response.text);
}
