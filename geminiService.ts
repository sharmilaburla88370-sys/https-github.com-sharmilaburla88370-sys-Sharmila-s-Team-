
import { GoogleGenAI, Type } from "@google/genai";
import { ScamAnalysisResult } from "./types";

export const analyzeTextScam = async (text: string): Promise<ScamAnalysisResult> => {
  // Initialize a new instance inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this message for potential scam indicators: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: "Scam risk score from 0 to 100" },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          summary: { type: Type.STRING },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          isScam: { type: Type.BOOLEAN },
          confidence: { type: Type.NUMBER }
        },
        required: ["score", "riskLevel", "summary", "redFlags", "recommendedActions", "isScam", "confidence"]
      },
      systemInstruction: "You are an elite cybersecurity expert specializing in digital fraud, social engineering, and phishing. Your goal is to analyze inputs and provide a detailed risk assessment in JSON format. Be cautious and prioritize user safety."
    }
  });

  const textOutput = response.text;
  if (!textOutput) {
    throw new Error("The AI returned an empty response.");
  }

  try {
    return JSON.parse(textOutput) as ScamAnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI JSON response:", textOutput);
    throw new Error("Invalid response format from AI.");
  }
};

export const analyzeImageScam = async (base64Image: string, mimeType: string): Promise<ScamAnalysisResult> => {
  // Initialize a new instance inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", // Changed from image-only generation model to general multimodal model for analysis
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Analyze this screenshot for potential scam indicators (fake websites, phishing emails, suspicious QR codes, etc.). Focus on social engineering tactics and urgent language." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          summary: { type: Type.STRING },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          isScam: { type: Type.BOOLEAN },
          confidence: { type: Type.NUMBER }
        },
        required: ["score", "riskLevel", "summary", "redFlags", "recommendedActions", "isScam", "confidence"]
      },
      systemInstruction: "You are an elite cybersecurity expert. Analyze the provided image for scam indicators and return a detailed JSON risk assessment."
    }
  });

  const textOutput = response.text;
  if (!textOutput) {
    throw new Error("The AI returned an empty response.");
  }

  try {
    return JSON.parse(textOutput) as ScamAnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI JSON response:", textOutput);
    throw new Error("Invalid response format from AI.");
  }
};
