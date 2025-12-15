/**
 * Generates a SHA256 hash of a JSON payload.
 * Canonicalizes the JSON (sorts keys) to ensure deterministic hashing.
 */
export declare const hashPayload: (payload: any) => string;
