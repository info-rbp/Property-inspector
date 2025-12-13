import { 
  RetrievalRequest, 
  RetrievalResponse, 
  StandardType, 
  StandardStatus, 
  DefectStandard,
  RoomStandard,
  KnowledgeItem
} from '../types';
import { knowledgeStore } from './knowledgeStore';

/**
 * DETERMINISTIC RETRIEVAL ENGINE
 * 
 * This logic mimics the Cloud Run /retrieve endpoint.
 * It filters the massive knowledge graph down to a precise, prompt-ready JSON.
 */
export const retrieveContext = (request: RetrievalRequest): RetrievalResponse => {
  const { tenantId, roomType, components } = request;

  // 1. Fetch Candidates (In a real DB, this would be optimized queries)
  // We fetch ALL active standards first.
  const allDefects = knowledgeStore.getActive(StandardType.DEFECT, tenantId) as DefectStandard[];
  const allSeverities = knowledgeStore.getActive(StandardType.SEVERITY, tenantId);
  const allRooms = knowledgeStore.getActive(StandardType.ROOM, tenantId) as RoomStandard[];
  const allPhrasing = knowledgeStore.getActive(StandardType.PHRASING, tenantId);
  const allGuardrails = knowledgeStore.getActive(StandardType.GUARDRAIL, tenantId);

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
    return applies.includes('all') || applies.some((c: string) => components.includes(c));
  });

  // 5. Construct Response
  const response: RetrievalResponse = {
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
      severity: allSeverities as any, 
      room: matchedRoom,
      phrasing: allPhrasing as any,
      guardrails: relevantGuardrails as any
    }
  };

  return response;
};
