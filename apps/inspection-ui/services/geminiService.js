"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItemComment = exports.generateOverallComment = exports.generateImageTags = void 0;
const GEMINI_MODEL = "gemini-2.0-flash-exp";
const MAX_PHOTOS_PER_BATCH = 5;
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

3. LANGUAGE & TONE:
   - Strictly use Australian English spelling and terminology (e.g., "mould" not "mold", "colour" not "color", "aluminium", "programme").
   - Tone: Professional, objective, factual, and concise suitable for a legal property condition report.
`;
const ITEM_GUIDELINES = {
    "front door": "Check surface (dents, cracks, peeling), edges (gaps), hardware (locks, hinges aligned), threshold/seals. Good = solid, aligned. Defect = warping, security issues.",
    "screen door": "Check mesh (tears, sagging), frame (corrosion, dents), locks/hinges. Good = aligned, mesh intact.",
    "walls": "Check vertical planes. Look for cracks (hairline vs structural), impact damage (holes), stains (moisture/mould), peeling paint. Hairline = cosmetic. Swelling = moisture.",
    "flooring": "Check tiles (cracks, loose grout), carpet (stains, pile wear, fraying), timber (scratches, cupping).",
    "ceiling": "Check for sagging, water stains (yellow/brown rings), mould spots, cornice cracking.",
    "windows": "Check glass (cracks), frames (corrosion, rot), seals (perished), mechanisms (winders/locks). Flyscreens present/intact?",
    "blinds/curtains": "Check operation (cords, wands), slats (bent, missing), fabric (stains, tears, sun damage).",
    "light fittings": "Check covers (cracked/missing), bugs/dust inside, bulbs present. Loose fittings?",
    "power points": "Check covers (cracks, paint splashes), secure mounting. Visibly undamaged?",
    "kitchen benchtop": "Check edges (chipping, lifting laminate), surface (cuts, burns, swelling at joins). Swelling = water damage.",
    "sink/taps": "Check stainless steel (scratches, dents), silicone seal (mould/lifting), tap operation (drips if visible).",
    "oven/stove": "Check glass (clean/intact), elements/burners (corrosion), seals, cleanliness (grease).",
    "rangehood": "Check filters (grease build-up), lights working, fan buttons intact.",
    "dishwasher": "Check seal cleanliness, door spring, control panel legibility.",
    "cupboards/drawers": "Check hinges (sagging), runners (smooth), laminate condition (peeling/swelling especially near water).",
    "shower": "Check screen (cracks, water stains), silicone (mould, gaps), grout (missing/discoloured), drain (clear).",
    "vanity": "Check cabinet swelling (water damage at base), basin cracks, mirror desilvering.",
    "toilet": "Check bowl (cleanliness), seat (loose/stained), cistern (cracked), base seal.",
    "tubs": "Check for rust spots, cabinet swelling, tap condition.",
    "garage door": "Check panels (dents), guides (straight), motor unit present.",
    "driveway": "Check concrete/paving (oil stains, cracking, subsidence, weeds).",
    "fences": "Check vertical alignment (leaning), palings (missing/rot), asbestos (if older).",
    "gardens": "Check weeds, plant health, mulch levels, edging condition.",
    "lawns": "Check coverage (bare patches), weeds, length (overgrown).",
    "smoke alarms": "Check presence, secure mounting, green light (if visible).",
    "rcd/safety switch": "Check switchboard presence.",
    "pool": "Check water clarity, gate latch compliance (self-closing), equipment condition."
};
const getGuidelinesForItem = (itemName) => {
    const lowerItem = itemName.toLowerCase();
    for (const [key, guide] of Object.entries(ITEM_GUIDELINES)) {
        if (lowerItem.includes(key) || key.includes(lowerItem))
            return guide;
    }
    return "Assess cleanliness, damage, and working order based on visual evidence.";
};
// Helper to convert photos to base64 data for API
const convertPhotosToBase64 = async (photos) => {
    return Promise.all(photos.map(async (p) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const b64 = reader.result.split(',')[1];
                resolve({
                    data: b64,
                    mimeType: p.file.type || 'image/jpeg'
                });
            };
            reader.readAsDataURL(p.file);
        });
    }));
};
// Call backend API for Gemini analysis
const callGeminiAPI = async (prompt, photos) => {
    try {
        const images = await convertPhotosToBase64(photos);
        const response = await fetch('/api/gemini/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                images,
                model: GEMINI_MODEL
            })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to analyze images');
        }
        const result = await response.json();
        return result.text;
    }
    catch (error) {
        console.error('Gemini API call failed:', error);
        throw error;
    }
};
// --- EXPORTED FUNCTIONS ---
const generateImageTags = async (photo) => {
    const prompt = `
    Analyze this real estate photo. Return a JSON array of up to 4 short tags describing the room type (e.g., 'Kitchen', 'Bedroom') and key features or defects (e.g., 'Crack', 'Stained Carpet', 'Modern').
    Example: ["Kitchen", "Oven", "Tiled Floor"]
    Only return the JSON array.
  `;
    try {
        const text = await callGeminiAPI(prompt, [photo]);
        const cleanText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    }
    catch (e) {
        console.warn("Tagging failed", e);
        return [];
    }
};
exports.generateImageTags = generateImageTags;
const generateOverallComment = async (roomName, photos, currentComment) => {
    const prompt = `
    You are an expert Property Manager in Western Australia writing a "Room General Overview" for a Form 1 Condition Report.
    Room: "${roomName}".
    
    ${GLOBAL_RULES}

    Existing Comment (to refine/append to): "${currentComment}"

    Task:
    1. Analyze the provided photos of this room.
    2. Write or refine a 5-sentence summary paragraph:
       - S1: Overall condition (Excellent/Good/Fair/Poor).
       - S2: Key positive elements (Cleanliness, intact features).
       - S3: Key defects/issues (Scuffs, stains, damage). If none, state "No significant damage observed to visible areas."
       - S4: Functional notes (Lights, windows).
       - S5: Presentation (Tidy/Untidy).
    3. If an existing comment is provided, MERGE the new findings into it. Do not repeat facts. Ensure the final text flows as one cohesive paragraph.
    
    Output: Return ONLY the paragraph text. No JSON.
  `;
    return await callGeminiAPI(prompt, photos);
};
exports.generateOverallComment = generateOverallComment;
const generateItemComment = async (itemName, roomName, photos, currentComment) => {
    const guidelines = getGuidelinesForItem(itemName);
    const prompt = `
    You are an expert Property Manager writing a specific item comment for a Form 1 Condition Report.
    Room: "${roomName}"
    Item: "${itemName}"
    
    Specific Inspection Guidelines for this item:
    "${guidelines}"

    ${GLOBAL_RULES}

    Existing Comment: "${currentComment}"

    Task:
    1. Analyze the photos specifically looking for the item "${itemName}". 
       - If the item is NOT visible in these photos, return the existing comment unchanged (or empty string if none).
    2. Determine the status of three flags based on VISIBLE EVIDENCE:
       - Clean: Free from dirt, dust, mould, grime? (True/False)
       - Undamaged: Free from cracks, chips, swelling, rust? (True/False)
       - Working: visibly functional? (True/False - default to True unless visibly broken or untested mechanical).
    3. Write/Refine a concise comment:
       - Format: "[Item] in [condition] with [defects] located [location]."
       - If existing comment exists, MERGE new details. e.g. "Previous note: scuff on left. New note: also scuff on right" -> "Scuff marks visible on LHS and RHS."
    
    Output strictly valid JSON:
    {
      "comment": "The text commentary...",
      "isClean": boolean,
      "isUndamaged": boolean,
      "isWorking": boolean
    }
  `;
    try {
        const text = await callGeminiAPI(prompt, photos);
        // Clean markdown if present
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    }
    catch (e) {
        console.error("Item generation error", e);
        // Fallback to preserving current state if AI fails
        return {
            comment: currentComment || "Error analyzing image.",
            isClean: true,
            isUndamaged: true,
            isWorking: true
        };
    }
};
exports.generateItemComment = generateItemComment;
