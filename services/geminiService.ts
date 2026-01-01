
import { GoogleGenAI, Type } from "@google/genai";
import { PanchangData } from "../types";

export async function fetchPanchangData(date: string, location: string): Promise<PanchangData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Role: Supreme Authority on Telugu Panchangam & Vedic Jyotish.
    Stakeholder: Balu (EPAM PM, Gita Practitioner).
    Context: Deliver production-ready precision for ${date} at ${location}.
    
    CRITICAL VEDIC FORMULAS:
    1. Sunrise/Sunset: Accurate to the second for ${location}.
    2. Sandhya Timings: 
       - Pratah Sandhya (Sunrise +/- 24 mins)
       - Madhyahna Sandhya (Noon +/- 24 mins)
       - Sayam Sandhya (Sunset +/- 24 mins)
    3. Divisions: Rahu Kalam, Yamagandam, Gulika based on weekday 8-part divisions.
    4. Muhurtas: Abhijit (8th Muhurta), Brahma Muhurta (Starts 96 mins before sunrise).
    5. Amrita Kalam/Varjyam: Calculate based on Nakshatra duration.
    
    OUTPUT REQUIREMENTS:
    - Bilingual Telugu/English.
    - One 'Balu's Gita Verse' relevant to the day's planetary alignment.
    - Lucky color and one-line professional/spiritual guidance.
    
    JSON SCHEMA ENFORCEMENT:
    Return strictly JSON. Ensure "time" field is strictly "HH:MM AM/PM - HH:MM AM/PM".
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
            date: { type: Type.STRING },
            location: { type: Type.STRING },
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
                samvat: { type: Type.STRING }
              }
            },
            inauspiciousTimings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nameEn: { type: Type.STRING },
                  nameTe: { type: Type.STRING },
                  time: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['inauspicious'] }
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
                  status: { type: Type.STRING, enum: ['auspicious'] }
                }
              }
            },
            horoscope: { type: Type.STRING },
            luckyColor: { type: Type.STRING }
          },
          required: ["basicDetails", "inauspiciousTimings", "auspiciousTimings", "horoscope", "luckyColor"]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      uri: chunk.web?.uri || '',
      title: chunk.web?.title || 'Vedic Authority Source'
    })).filter((s: any) => s.uri !== '');

    return { ...parsed, sources };
  } catch (error) {
    console.error("Gemini Panchang Error:", error);
    throw new Error("Failed to compute Vedic timings. Celestial alignment unreachable.");
  }
}

export async function fetchMonthHighlights(year: number, month: number, location: string): Promise<Record<string, 'auspicious' | 'inauspicious' | 'neutral'>> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long' });
  
  const prompt = `
    Analyze the Vedic Panchang for the entire month of ${monthName} ${year} in ${location}.
    For each day of the month, determine if the day is generally 'auspicious' (e.g., has powerful Subha Muhurtas, favorable Tithi/Nakshatra for work), 'inauspicious' (e.g., Amavasya, heavy Rahu influence, bad Yoga), or 'neutral'.
    
    Return a JSON object where keys are the date in "YYYY-MM-DD" format and values are one of: "auspicious", "inauspicious", "neutral".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Month fetch error:", error);
    return {};
  }
}
