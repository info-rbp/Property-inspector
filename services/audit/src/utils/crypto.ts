
import crypto from 'crypto';

/**
 * Generates a SHA256 hash of a JSON payload.
 * Canonicalizes the JSON (sorts keys) to ensure deterministic hashing.
 */
export const hashPayload = (payload: any): string => {
  // Simple canonicalization: JSON.stringify usually preserves order, 
  // but for strict crypto guarantees, we should sort keys.
  const canonicalString = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(canonicalString).digest('hex');
};
