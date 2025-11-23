import { GoogleGenAI } from "@google/genai";
import { AmenityStatus, Address } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface DescriptionParams {
  address: Address;
  price: number;
  amenities: {
    wifi: AmenityStatus;
    electricity: AmenityStatus;
    water: AmenityStatus;
  };
  title: string;
}

export const generateRoomDescription = async (params: DescriptionParams): Promise<string> => {
  try {
    const prompt = `
      Write a short, catchy, and professional rental listing description for a room in a South African township context (e.g. BackRoom).
      
      Details:
      - Name: ${params.title}
      - Location: ${params.address.suburb}, ${params.address.city}
      - Rent: R${params.price}
      - Wifi: ${params.amenities.wifi}
      - Electricity: ${params.amenities.electricity}
      - Water: ${params.amenities.water}

      Keep it under 60 words. Emphasize safety and convenience. Use a welcoming tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Spacious and secure room available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Great room available. Contact landlord for details.";
  }
};
