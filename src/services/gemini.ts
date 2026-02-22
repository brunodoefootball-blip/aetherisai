import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function* generateWebsiteStructureStream(prompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const result = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: `Você é um arquiteto de software e designer web de elite da Aetheris AI.
    Sua tarefa é gerar um projeto de website completo, profissional e extremamente detalhado baseado no prompt: "${prompt}".

    DIRETRIZES DE QUALIDADE:
    - Nível de Detalhe: Produza desde sites simples e limpos até experiências medianas e ultra-complexas com design 3D (Three.js), animações avançadas e realismo extremo.
    - Estrutura: Organize o código em múltiplos arquivos (HTML, CSS, JS, Markdown).
    - Design: Use Tailwind CSS para a base, mas adicione CSS personalizado para efeitos de vidro (glassmorphism), neon, profundidade e interatividade 3D.
    - Funcionalidade: Inclua lógica JavaScript real para interações, não apenas placeholders.

    DIRETRIZES DE SEGURANÇA E ÉTICA (ESTRITO):
    - NÃO aceite ou gere conteúdo relacionado a hacking, invasão de sistemas, furtos, roubos ou atividades ilegais.
    - NÃO gere conteúdo pornográfico (infantil ou adulto).
    - NÃO gere conteúdo ofensivo, discriminatório ou de ódio contra organizações ou indivíduos.
    - Foque exclusivamente em ajudar as pessoas e criar valor positivo.

    O output deve ser um objeto JSON válido com:
    1. "name": Nome criativo.
    2. "description": Resumo do projeto.
    3. "features": Array de funcionalidades.
    4. "files": Array de objetos {"path": string, "content": string}.
       Obrigatório: index.html, styles.css, main.js, README.md.`,
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

  for await (const chunk of result) {
    yield chunk.text;
  }
}

export async function generateWebsiteStructure(prompt: string) {
  const stream = generateWebsiteStructureStream(prompt);
  let fullText = "";
  for await (const chunk of stream) {
    fullText += chunk;
  }
  
  try {
    return JSON.parse(fullText);
  } catch (e) {
    console.error("Failed to parse AI response:", fullText);
    throw new Error("Falha ao processar resposta da IA. Tentando novamente...");
  }
}
