
import { GoogleGenAI } from "@google/genai";

/**
 * Provides market analysis using the Gemini AI model.
 * Adheres to Google GenAI SDK guidelines for initialization and model selection.
 */
export const getMarketAnalysis = async (query: string, marketContext: string): Promise<string> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  // The API key is obtained exclusively from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  try {
    // Select gemini-3-flash-preview for basic text tasks (summarization/analysis) as recommended.
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `You are an expert cryptocurrency market analyst for a platform called DramCoin. 
    You speak Armenian (primary) and English. 
    Provide concise, professional technical analysis or answers about crypto trading. 
    The user is currently viewing: ${marketContext}.
    Keep answers short (under 100 words) unless asked for details.
    Use bolding for key figures.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // Access the generated text directly from the response.text property.
    return response.text || "Ներեցեք, ես չկարողացա վերլուծել տվյալները:";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Տեղի ունեցավ սխալ AI ծառայության հետ կապ հաստատելիս:";
  }
};
