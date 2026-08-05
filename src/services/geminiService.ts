
/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-04-19T09:03:10-07:00
 * IP PROTECTION ENABLED
 */

import { GoogleGenAI, Type } from "@google/genai";
import { RealEstateDocument, Listing } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function gatherPropertyInfo(address: string) {
    const prompt = `Act as a real estate data aggregator. For the given address, return as much public information as possible about the property. 
    Focus on: year built, square footage, lot size, zoning, school district, tax assessment, last sale price, bedrooms, bathrooms, and high-level architectural style.
    Do not use generic placeholders. If you cannot find real data, provide realistic local estimates based on address location trends.
    Address: ${address}`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    yearBuilt: { type: Type.STRING },
                    sqft: { type: Type.NUMBER },
                    lotSize: { type: Type.STRING },
                    zoning: { type: Type.STRING },
                    schoolDistrict: { type: Type.STRING },
                    taxAssessment: { type: Type.STRING },
                    lastSalePrice: { type: Type.STRING },
                    beds: { type: Type.NUMBER },
                    baths: { type: Type.NUMBER },
                    style: { type: Type.STRING },
                    neighborhoodInfo: { type: Type.STRING }
                }
            }
        }
    });

    return JSON.parse(response.text || '{}');
}

export async function generateSmartDocument(situation: string, listing: Listing, targetType: string): Promise<Partial<RealEstateDocument>> {
    const prompt = `Act as a senior real estate law paralegal at Radest Publishing Co. 
    Analyze the following situation and create a professional real estate document of type: ${targetType}.
    Property Address: ${listing.address}
    Listing Price: ${listing.price}
    Situation: ${situation}
    
    The document should be auto-filled with all relevant data from the listing.
    The content MUST be professional and legally formatted.
    Include place holders for signatures where appropriate.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    content: { type: Type.STRING, description: "The full text content of the generated document" },
                    summary: { type: Type.STRING }
                },
                required: ["name", "content"]
            }
        }
    });

    const result = JSON.parse(response.text || '{}');
    return {
        id: `SMART-${Date.now()}`,
        name: result.name,
        content: result.content,
        type: targetType as any,
        uploadedAt: new Date().toISOString(),
        status: 'Draft'
    };
}

export async function translateDocumentContent(content: string, targetLanguage: string) {
    const prompt = `Translate the following real estate document content into ${targetLanguage}. 
    Ensure all legal and real estate terminology (verbage) is preserved with its proper technical equivalent in the target language.
    Content to translate: ${content}`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    });

    return response.text;
}
