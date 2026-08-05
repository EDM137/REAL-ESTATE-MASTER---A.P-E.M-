
/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-04-19T09:03:10-07:00
 * IP PROTECTION ENABLED
 */

import { GoogleGenAI, Type } from "@google/genai";
import { RealEstateDocument, Listing } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function gatherPropertyInfo(address: string) {
    const prompt = `Act as an official real estate data aggregator for Radest Publishing Co. and Eric Daniel Malley. 
    Use real online public records, real estate listings, tax records, and web data for the exact address provided: "${address}".
    
    Gather and return JSON containing real property details:
    - yearBuilt (string e.g. "1964")
    - sqft (number e.g. 2450)
    - lotSize (string e.g. "0.25 Acres" or "10,890 sqft")
    - zoning (string e.g. "R1 Single Family")
    - schoolDistrict (string e.g. "Palo Alto Unified")
    - taxAssessment (string e.g. "$1,250,000")
    - lastSalePrice (string e.g. "$1,850,000")
    - beds (number)
    - baths (number)
    - style (string e.g. "Mid-Century Modern")
    - neighborhoodInfo (string detailing location, walk score, nearby amenities)
    - estimatedPrice (number e.g. 1850000)
    - description (a detailed, professional listing description based on real property characteristics)

    Do NOT return mock or simulated placeholder data. Use real public record data. Return pure valid JSON only.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
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
                        neighborhoodInfo: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER },
                        description: { type: Type.STRING }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
    } catch (e) {
        console.warn("Search grounded extraction fallback:", e);
        // Fallback without tools if googleSearch config schema requires direct prompt
        const fallbackResponse = await ai.models.generateContent({
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
                        neighborhoodInfo: { type: Type.STRING },
                        estimatedPrice: { type: Type.NUMBER },
                        description: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(fallbackResponse.text || '{}');
    }
    return {};
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
