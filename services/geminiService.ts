import { GoogleGenAI } from "@google/genai";

/**
 * Gera o conteúdo textual para os cards do Instagram.
 */
export const generateCardContent = async (topic: string, count: number = 30): Promise<string> => {
  try {
    // Initializing with the environment variable directly as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Você é um estrategista de conteúdo sênior para Instagram. 
      Crie EXATAMENTE ${count} posts para uma sequência sobre: "${topic}".
      
      ESTRUTURA OBRIGATÓRIA PARA CADA CARD:
      # TÍTULO DE IMPACTO (Máx 5 palavras)
      Texto do corpo explicativo e direto. Use **negrito** para destacar palavras-chave importantes.

      REGRAS CRÍTICAS:
      1. Separe CADA post com uma linha contendo APENAS "---".
      2. O título DEVE começar com #.
      3. Cada post deve ser curto (máx 30 palavras no corpo).
      4. Gere exatamente ${count} blocos de texto separados por ---.
      5. Responda apenas com os blocos, sem introdução ou conclusão.
    `;

    // Always specify model name directly
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Erro na geração de conteúdo:", error);
    throw error;
  }
};

/**
 * Gera uma imagem automática para um card específico usando o modelo de imagem.
 */
export const generateImageForCard = async (description: string): Promise<string | null> => {
  try {
    // Fresh instance before API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imagePrompt = `A professional, high-quality social media background image or illustration related to: ${description}. Aesthetic, clean, minimal, suitable for Instagram background. NO TEXT.`;

    // Using gemini-2.5-flash-image for general image generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ text: imagePrompt }] 
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem com IA:", error);
    return null;
  }
};
