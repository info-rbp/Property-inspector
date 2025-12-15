"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveContext = void 0;
const types_2 = require("../types");
const knowledgeStore_1 = require("./knowledgeStore");
/**
 * DETERMINISTIC RETRIEVAL ENGINE
 *
 * This logic mimics the Cloud Run /retrieve endpoint.
 * It filters the massive knowledge graph down to a precise, prompt-ready JSON.
 */
const retrieveContext = (request) => {
    const { tenantId, roomType, components } = request;
    // 1. Fetch Candidates (In a real DB, this would be optimized queries)
    // We fetch ALL active standards first.
    const allDefects = knowledgeStore_1.knowledgeStore.getActive(types_2.StandardType.DEFECT, tenantId);
    const allSeverities = knowledgeStore_1.knowledgeStore.getActive(types_2.StandardType.SEVERITY, tenantId);
    const allRooms = knowledgeStore_1.knowledgeStore.getActive(types_2.StandardType.ROOM, tenantId);
    const allPhrasing = knowledgeStore_1.knowledgeStore.getActive(types_2.StandardType.PHRASING, tenantId);
    const allGuardrails = knowledgeStore_1.knowledgeStore.getActive(types_2.StandardType.GUARDRAIL, tenantId);
    // 2. Filter: Room Standards
    const matchedRoom = allRooms.find(r => r.roomType.toLowerCase() === roomType.toLowerCase()) || null;
    // 3. Filter: Defects
    // Rule: Include defect if it applies to ANY of the requested components
    // OR if it applies to the room generally (if we had that field, simpler here is just components)
    const relevantDefects = allDefects.filter(defect => {
        // Check intersection between defect.appliesTo and request.components
        const hasIntersection = defect.appliesTo.some(c => components.includes(c));
        return hasIntersection;
    });
    // 4. Filter: Guardrails
    const relevantGuardrails = allGuardrails.filter(g => {
        // @ts-ignore
        const applies = g.appliesTo;
        return applies.includes('all') || applies.some((c) => components.includes(c));
    });
    // 5. Construct Response
    const response = {
        metadata: {
            retrievalId: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString(),
            engineVersion: 'v1.0.0',
            tenantScope: tenantId
        },
        context: {
            defects: relevantDefects,
            // For severity and phrasing, we usually send the whole relevant set for the domain 
            // unless specific filtering is needed. Sending all 'active' for now.
            severity: allSeverities,
            room: matchedRoom,
            phrasing: allPhrasing,
            guardrails: relevantGuardrails
        }
    };
    return response;
};
exports.retrieveContext = retrieveContext;
