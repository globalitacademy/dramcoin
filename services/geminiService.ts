
import { GoogleGenAI } from "@google/genai";

/**
 * Provides market analysis using the Gemini AI model with Google Search grounding.
 */
export const getMarketAnalysis = async (query: string, marketContext: string): Promise<{text: string, sources?: any[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  try {
    // Using gemini-3-flash-preview for fast and real-time grounded responses.
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are a professional crypto analyst for DramCoin. 
    Use the provided search tools to find REAL-TIME information about cryptocurrency prices, news, and trends.
    Current context: ${marketContext}.
    Always provide factual, up-to-date information. 
    Speak Armenian (primary) and English. 
    If you mention a price or news, mention that you've searched for it.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }] // Enabling Google Search for real data
      }
    });

    const text = response.text || "Ներեցեք, ես չկարողացա վերլուծել տվյալները:";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Տեղի ունեցավ սխալ AI ծառայության հետ կապ հաստատելիս:" };
  }
};
