
import { GoogleGenAI, Type } from "@google/genai";
import { PanchangData, AppLanguage, PanchangRegion } from "../types";

export async function fetchPanchangData(
  date: string, 
  location: string, 
  language: AppLanguage,
  region: PanchangRegion,
  coords?: { lat: number; lng: number }
): Promise<PanchangData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Role: Supreme Authority on Vedic Panchangam & Jyotish (covering Telugu, Tamil, and North Indian traditions).
    Context: Deliver production-ready precision for ${date} at ${location}.
    Language requested: ${language}.
    Calendar Tradition: ${region === 'tamilnadu' ? 'Tamil Solar Calendar (Vakya/Thirukanitha)' : region === 'north' ? 'Purnimanta Vikram Samvat' : 'Amanta Shalivahana Saka (Telugu/Kannada)'}.
    
    CRITICAL VEDIC FORMULAS:
    1. Sunrise/Sunset: Accurate for ${location}.
    2. Sandhya Timings, Rahu Kalam, Yamagandam, Gulika.
    3. Muhurtas: Abhijit, Brahma Muhurta.
    4. Region-Specific Details:
       - If Tamil: Include Tamil Month (Chithirai, etc.), Year name (Vihari, etc.), and Tithi/Nakshatra in Tamil.
       - If North Indian: Include Hindi Month, Vikram Samvat, and Paksha details in Hindi.
       - If Telugu: Standard Amanta Maasam.
    
    OUTPUT REQUIREMENTS:
    - Primary field "nameTe" in the schema should be used for the regional language (${language}) name of the timing.
    - Basic details must include regional Month (maasam) and Era (samvat).
    - Provide a concise spiritual tone summary and a Gita-inspired guidance.
    
    JSON SCHEMA ENFORCEMENT:
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            basicDetails: {
              type: Type.OBJECT,
              properties: {
                sunrise: { type: Type.STRING },
                sunset: { type: Type.STRING },
                tithi: { type: Type.STRING },
                nakshatra: { type: Type.STRING },
                yoga: { type: Type.STRING },
                karana: { type: Type.STRING },
                rahu: { type: Type.STRING },
                samvat: { type: Type.STRING },
                maasam: { type: Type.STRING },
                varam: { type: Type.STRING }
              },
              required: ["sunrise", "sunset", "tithi", "maasam"]
            },
            inauspiciousTimings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nameEn: { type: Type.STRING },
                  nameTe: { type: Type.STRING },
                  time: { type: Type.STRING },
                  status: { type: Type.STRING }
                }
              }
            },
            auspiciousTimings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nameEn: { type: Type.STRING },
                  nameTe: { type: Type.STRING },
                  time: { type: Type.STRING },
                  status: { type: Type.STRING }
                }
              }
            },
            horoscope: { type: Type.STRING },
            spiritualSummary: { type: Type.STRING },
            luckyColor: { type: Type.STRING }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || 'Vedic Authority Source'
    })).filter((s: any) => s.uri !== '');

    return { ...parsed, date, location, sources };
  } catch (error) {
    console.error("Gemini Panchang Error:", error);
    throw new Error("Astral signal error. Could not align regional calendar.");
  }
}

export async function fetchMonthHighlights(year: number, month: number, location: string): Promise<Record<string, 'auspicious' | 'inauspicious' | 'neutral'>> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze Vedic Panchang for ${month}/${year} at ${location}. Return JSON format with "YYYY-MM-DD": "auspicious|inauspicious|neutral" mapping.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(response.text);
  } catch { return {}; }
}
