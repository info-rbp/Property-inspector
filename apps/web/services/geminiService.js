"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePropertyDetails = void 0;
const genai_1 = require("@google/genai");
const apiKeys_1 = require("./apiKeys");
const parsePropertyDetails = async (rawText) => {
    const apiKey = (0, apiKeys_1.getGeminiApiKey)();
    if (!apiKey) {
        console.warn("No Gemini API key available.");
        return null;
    }
    const ai = new genai_1.GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a strict data extraction engine for a Property Management System.
Analyze the text to extract formal identifiers and standardized data.

CRITICAL: Perform a Google Search to find the actual property listing or details if the address is provided.
1. Normalize address to GNAF/Google Maps standards.
2. Extract legal identifiers (Lot/Plan/Zoning) if available in search results or text.
3. Find a public URL for an image of the property facade (thumbnailUrl).
4. EXTRACT GEOLOCATION: You MUST provide the latitude and longitude for the address.
5. Do not guess. If a value is missing, use null.
6. You must return VALID JSON only. Do not include markdown code blocks.

Output Structure (JSON):
{
  "identity": {
    "address": "string",
    "suburb": "string",
    "state": "string",
    "postcode": "string",
    "council": "string",
    "latitude": number,
    "longitude": number
  },
  "thumbnailUrl": "string (url)",
  "legal": {
    "lotNumber": "string",
    "planNumber": "string",
    "zoningCode": "string"
  },
  "attributes": {
    "type": "string (One of: House, Apartment, Townhouse, Commercial, Villa, Duplex)",
    "bedrooms": number,
    "bathrooms": number,
    "carSpaces": number,
    "yearBuilt": number,
    "floorArea": number
  },
  "marketContext": {
    "medianRentSuburb": number,
    "vacancyRate": number
  }
}

Text: "${rawText}"`,
            config: {
                tools: [{ googleSearch: {} }, { googleMaps: {} }],
                // responseMimeType: "application/json" cannot be used with tools
            }
        });
        let jsonText = response.text;
        if (!jsonText)
            return null;
        // Cleanup potential markdown formatting
        if (jsonText.includes("```json")) {
            jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "");
        }
        else if (jsonText.includes("```")) {
            jsonText = jsonText.replace(/```/g, "");
        }
        return JSON.parse(jsonText);
    }
    catch (error) {
        console.error("Gemini Parse Error:", error);
        throw error;
    }
};
exports.parsePropertyDetails = parsePropertyDetails;
