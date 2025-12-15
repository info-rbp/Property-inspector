import { RetrievalRequest, RetrievalResponse } from '../types';
/**
 * DETERMINISTIC RETRIEVAL ENGINE
 *
 * This logic mimics the Cloud Run /retrieve endpoint.
 * It filters the massive knowledge graph down to a precise, prompt-ready JSON.
 */
export declare const retrieveContext: (request: RetrievalRequest) => RetrievalResponse;
