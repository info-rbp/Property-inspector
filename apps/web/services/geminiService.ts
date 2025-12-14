
import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from "../utils";
import { Photo } from "../types";

const GEMINI_MODEL = "gemini-3-pro-preview";

// --- GLOBAL RULES & GUIDANCE ---
const GLOBAL_RULES = `
1. GLOBAL RULES FOR ALL ITEMS:
   - Object Presence & Visibility: Never default to "not visible" if ANY part is present. Partial view (corner of window, edge of floor) = VISIBLE. Confirm presence and comment on the visible portion.
   - Contextual Reasoning: Infer context. If a shower head is visible, a shower area exists. If a toilet is visible, flooring exists beneath it.
   - Condition Language:
     * Good/Satisfactory: intact, secure, functional, minor marks only.
     * Fair/Minor wear: light scuffs, small chips, aged but functional.
     * Poor/Defective: broken, loose, stained, corroded, unsafe.
   - Evidence Types: Look for surface condition (cracks, peeling), Geometry (sagging, gaps), Moisture (bubbling, mould), and Function (handles, switches).

2. "NOT APPLICABLE" LOGIC:
   - Only use "Not Applicable" if the item is GENUINELY not in the room (e.g., no bath in a powder room).
   - Do NOT use it for "not visible". If likely present but hidden, say: "Not fully visible in provided images; condition cannot be confirmed."
`;

// --- ITEM SPECIFIC KNOWLEDGE BASE ---
const ITEM_GUIDELINES: Record<string, string> = {
  // Entrances
  "front door": "Check surface (dents, cracks, peeling), edges (gaps), hardware (locks, hinges aligned), threshold/seals. Good = solid, aligned. Defect = warping, security issues.",
  "screen door/security door": "Check mesh (tears, sagging), frame (corrosion, dents), locks/hinges. Good = aligned, mesh intact.",
  "doors/doorway frames": "Check timber/metal framing, architraves. Look for cracks at joints, gaps to wall, swelling, paint condition. Minor hairline cracks = cosmetic. Swelling = moisture.",
  
  // General Room
  "walls": "Check vertical planes. Look for cracks (hairline vs structural), impact damage (holes), stains (moisture/mould), peeling paint. Hairline = cosmetic. Wide/diagonal cracks = structural.",
  "picture hooks": "Check for loose hooks or excessive damage from previous ones. Confirm secure.",
  "ceiling": "Check overhead plane. Look for sagging, cracks at joints/cornices, moisture stains, mould. Sagging/Stains = high severity.",
  "skirting boards": "Check horizontal trim at base. Look for gaps, impact damage, swelling (especially in wet areas). Swelling = moisture issue.",
  "light fittings": "Check broken covers, heat discoloration, exposed wiring. Exposed wires = safety concern.",
  "light switches": "Check toggle/rocker mechanism alignment, plate cracks, cleanliness (finger marks), loose mounting to wall. Operation inferred from position.",
  "power points": "Check plate cracks, heat discoloration (browning), loose fit to wall. Heat damage = safety issue.",
  "floor coverings": "CRITICAL: Look at bottom 10-40% of image. Treat ANY horizontal surface supporting furniture as floor. Differentiate Carpet (soft/texture), Tiles (grout lines), Timber (planks), Vinyl (sheet). Check stains, tears, fraying, cracked tiles, warped boards.",
  "floorcoverings": "CRITICAL: Look at bottom 10-40% of image. Treat ANY horizontal surface supporting furniture as floor. Differentiate Carpet (soft/texture), Tiles (grout lines), Timber (planks), Vinyl (sheet). Check stains, tears, fraying, cracked tiles, warped boards.",
  
  // Windows
  "windows/screens": "Check glass (cracks, fogging), frames (rot, corrosion), seals. Check flyscreens for mesh tears or frame damage. Fogging = failed seal.",
  "blinds/curtains": "Check slats/fabric (tears, missing), mechanism alignment, mould. Mould on curtains = poor ventilation.",
  
  // Fixtures Specifics
  "taps": "Identify type (mixer, pillar, wall-set). Check for: dripping/leaks (staining at base/spout), corrosion/pitting on chrome, loose handles/spout, missing buttons (H/C), stiffness.",
  "mixer tap": "Check lever operation (alignment), cartridge movement (if visible), chrome condition, leaks at base.",
  "shower head": "Identify type (fixed rose, rail shower, handheld). Check for: limescale build-up on nozzles, corrosion on arm/hose, leaks at connection, slide rail condition.",
  
  // Bathroom / Laundry
  "tiles": "Check wall/floor tiles. Look for cracks, drummy tiles, missing/discolored grout. Cracks in shower = leak risk.",
  "bath": "Check surface (chips, cracks), staining, sealant to wall, waste fitting.",
  "shower/screen": "Check base (cracks, staining), fall to drain, mould in corners. Check screen glass (chips), loose framing, seals/silicone. Check shower head for limescale. Cracks/Loose screen = leak risk.",
  "wash basin/taps": "Check bowl (cracks, chips), waste. Check Taps for corrosion, leaks (staining), loose bodies. Ceramic cracks = note even if small.",
  "mirror/cabinet/vanity": "Check mirror edge deterioration (blackening). Check cabinet for swelling (moisture), door alignment, water damage.",
  "toilet": "Check pan cracks, staining at base (leaks), cistern condition. Movement/staining at base = leak.",
  "exhaust fan": "Check dust build-up, moisture discoloration. Excessive dust = poor maintenance.",
  "towel rails": "Check for loose fixings, corrosion, bent rails.",
  "washing tub": "Check for cracks, rust, staining. Check cabinet below for swelling.",
  
  // Kitchen
  "cupboards/drawers": "Check door/front alignment, hinges/runners, swelling, delamination. Swelling = moisture.",
  "bench tops/tiling": "Check chips, cracks, burns, edge peeling, staining. Check splashback tiles for grout condition.",
  "sink/taps": "Check sink for cracks/rust. Check taps for corrosion, leaks, loose handles, calcification.",
  "stove top/hot plates": "Check glass cracks, missing knobs, burn marks, grease residue.",
  "oven/griller": "Check door glass, sealing, control knobs, internal grease/rust.",
  "exhaust fan/range hood": "Check filters (cleanliness), grease build-up, lights.",
  
  // Exterior
  "lawn/edges": "Check bare patches, overgrowth, erosion.",
  "garden": "Check maintenance (overgrown vs tidy), trip hazards, tree proximity.",
  "paving/driveways": "Check uneven pavers (trip risk), cracking, subsidence, oil stains.",
  "gutters/downpipes": "Check sagging, rust, holes, overflow staining, separation at joints.",
  "hot water system": "Check tank rust, leaks at base, relief valve discharge.",
  "garage/carport": "Check floor stains, wall condition, door operation (tracks/alignment).",
  "clothesline": "Check leaning posts, sagging lines, rust.",
  "fencing/gates": "Check stability, rot, damage.",
  "letterbox": "Check security, damage, rust.",
  
  // Safety
  "smoke alarms": "Confirm presence and intact covers. Note: Function not tested via photo.",
  "electrical safety switch": "Confirm presence in switchboard if visible.",
};

// Helper to determine mime type if file.type is empty or generic
const getMimeType = (file: File) => {
  if (file.type && file.type !== 'application/octet-stream') return file.type;
  
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg'; // Default assumption for photos if unknown
};

const prepareImageParts = async (photos: Photo[]) => {
  // Process all photos sequentially
  const parts: any[] = [];

  for (const photo of photos) {
    const base64Data = await fileToBase64(photo.file);
    const mimeType = getMimeType(photo.file);
    
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data
      }
    });
  }
  return parts;
};

// Helper to match item name to guidelines fuzzy-wise
const getSpecificGuidance = (itemName: string): string => {
  const lower = itemName.toLowerCase();
  
  // Direct match
  if (ITEM_GUIDELINES[lower]) return ITEM_GUIDELINES[lower];
  
  // Partial match (e.g. "Kitchen Cupboards" matches "cupboards")
  const keys = Object.keys(ITEM_GUIDELINES);
  for (const key of keys) {
    if (lower.includes(key) || key.includes(lower)) {
      return ITEM_GUIDELINES[key];
    }
  }
  
  // Split items (e.g. "Windows/Screens")
  if (lower.includes('/')) {
    const parts = lower.split('/');
    for (const part of parts) {
       for (const key of keys) {
         if (key.includes(part)) return ITEM_GUIDELINES[key];
       }
    }
  }

  return "General inspection: Check for cleanliness, damage, and operation. Note surface condition and any defects.";
};

export const generateItemComment = async (
  itemName: string,
  roomName: string,
  photos: Photo[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  
  if (photos.length === 0) {
    throw new Error("No photos available to analyze.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts = await prepareImageParts(photos);

  const specificGuidance = getSpecificGuidance(itemName);

  // Add text prompt part
  const prompt = `
    You are a professional property manager conducting an entry condition report.
    
    ${GLOBAL_RULES}
    
    --- CURRENT TASK ---
    Room: ${roomName}
    Item to Inspect: "${itemName}"
    
    INSPECTION GUIDANCE FOR THIS ITEM:
    ${specificGuidance}
    
    INSTRUCTIONS:
    1. Scan ALL provided photos of the ${roomName}.
    2. Locate the ${itemName}. Remember: Partial view = Visible.
    3. If the item is visually present (even partially), verify its condition based on the guidance above.
    4. Write a concise, professional comment (under 2 sentences).
    5. Do not use markdown.
  `;
  
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts },
    });
    
    return response.text?.trim() || "Condition verified.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate comment. Please try again.");
  }
};

export const generateOverallComment = async (
  roomName: string,
  photos: Photo[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  
  if (photos.length === 0) {
    throw new Error("No photos available to analyze.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts = await prepareImageParts(photos);

  const prompt = `
    You are a professional property manager conducting an entry condition report.
    
    ${GLOBAL_RULES}
    
    --- CURRENT TASK ---
    Room: ${roomName}
    
    INSTRUCTIONS:
    1. Analyze ALL provided photos to create a comprehensive overview of this room.
    2. Infer the room type based on fixtures if not obvious from the name.
    3. Describe the general cleanliness and state of repair (e.g. "Clean, well-lit and well-maintained").
    4. Mention the condition of major surfaces (walls, floor, ceiling) collectively.
    5. Keep it professional and concise (under 3 sentences).
    6. Do not use markdown.
  `;
  
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts },
    });
    
    return response.text?.trim() || "Room in good condition.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate overview. Please try again.");
  }
};

// NEW: Inspector Mode for Remote Tenant Inspections
export const analyzeTenantPhotos = async (
    itemName: string,
    tenantComment: string,
    photos: Photo[]
): Promise<{ text: string; isFlagged: boolean }> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing.");
    }

    if (photos.length === 0) {
        return { text: "No photos provided by tenant to verify.", isFlagged: true };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts = await prepareImageParts(photos);

    const prompt = `
        You are a strict Property Inspector auditing a remote inspection submitted by a tenant.
        
        ITEM: ${itemName}
        TENANT'S COMMENT: "${tenantComment || 'No comment provided'}"
        
        INSTRUCTIONS:
        1. Analyze the photo(s) specifically for defects, damage, or cleanliness issues.
        2. Compare the visual evidence against the tenant's comment.
           - If the tenant says "Clean/Undamaged" but you see stains, cracks, or damage -> FLAG IT.
           - If the tenant admits damage, verify if it matches the photo.
        3. Output a short, blunt assessment for the Property Manager.
        4. START with "FLAGGED:" if there is a discrepancy or issue. Otherwise start with "VERIFIED:".
        
        Example Outputs:
        "FLAGGED: Tenant claims clean, but significant grease buildup visible on rangehood filters."
        "VERIFIED: Item appears consistent with tenant's description. No visible defects."
    `;

    parts.push({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: { parts },
        });

        const text = response.text?.trim() || "Analysis failed.";
        const isFlagged = text.toUpperCase().startsWith("FLAGGED");

        return { text, isFlagged };
    } catch (error) {
        console.error("Gemini Inspector Error:", error);
        return { text: "AI Analysis unavailable.", isFlagged: false };
    }
};
