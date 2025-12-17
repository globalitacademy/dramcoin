import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists to avoid immediate errors, handle gracefully in calls
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getMarketAnalysis = async (query: string, marketContext: string): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please configure process.env.API_KEY.";
  }

  try {
    const model = 'gemini-2.5-flash';
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

    return response.text || "Ներեցեք, ես չկարողացա վերլուծել տվյալները:";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Տեղի ունեցավ սխալ AI ծառայության հետ կապ հաստատելիս:";
  }
};