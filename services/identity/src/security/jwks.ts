import crypto, { KeyObject } from 'crypto';
import { config } from '../config/env';
import { logger } from '../utils/logger';

interface JWK {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  n: string;
  e: string;
}

interface JwksResponse {
  keys: JWK[];
}

interface JwksCache {
  data: JwksResponse;
  generatedAt: number;
}

let jwksCache: JwksCache | null = null;
let signingKid: string | null = null;

/**
 * Normalizes PEM string (handles escaped newlines)
 */
const normalizePem = (pem: string): string => {
  return pem.replace(/\\n/g, '\n').trim();
};

/**
 * Generates a deterministic Key ID (kid) based on the SHA-256 of the SPKI DER representation.
 * This ensures the kid remains stable across restarts and identical for the same key.
 */
const generateKid = (key: KeyObject): string => {
  const der = key.export({ format: 'der', type: 'spki' });
  const hash = crypto.createHash('sha256').update(der).digest('base64');
  // Make base64url safe
  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Converts a PEM public key to a JWK object
 */
const pemToJwk = (pem: string): JWK => {
  try {
    const key = crypto.createPublicKey(pem);
    const kid = generateKid(key);
    
    // Node's export({ format: 'jwk' }) returns n, e, kty
    const jwk = key.export({ format: 'jwk' }) as any;

    return {
      kid,
      kty: jwk.kty,
      alg: 'RS256',
      use: 'sig',
      n: jwk.n,
      e: jwk.e
    };
  } catch (error) {
    logger.error('Failed to convert PEM to JWK', error);
    throw new Error('Invalid Public Key Configuration');
  }
};

/**
 * Refreshes the cache logic
 */
const refreshCache = (): JwksResponse => {
  const keys: JWK[] = [];
  const processedKids = new Set<string>();

  // 1. Primary Public Key (Matching the current Private Key)
  const primaryPem = normalizePem(config.JWT_PUBLIC_KEY);
  const primaryJwk = pemToJwk(primaryPem);
  keys.push(primaryJwk);
  processedKids.add(primaryJwk.kid);
  
  // Store the primary kid for signing usage
  signingKid = primaryJwk.kid;

  // 2. Rotation Keys (Additional public keys valid for verification)
  if (config.JWT_PUBLIC_KEYS) {
    try {
      const extraKeys = JSON.parse(config.JWT_PUBLIC_KEYS);
      if (Array.isArray(extraKeys)) {
        for (const pem of extraKeys) {
          const jwk = pemToJwk(normalizePem(pem));
          if (!processedKids.has(jwk.kid)) {
            keys.push(jwk);
            processedKids.add(jwk.kid);
          }
        }
      }
    } catch (e) {
      logger.error('Failed to parse JWT_PUBLIC_KEYS', e);
    }
  }

  return { keys };
};

/**
 * Returns the JWK Set, using in-memory caching.
 */
export const getJwks = (): JwksResponse => {
  const now = Date.now();
  const ttlMs = config.JWKS_CACHE_TTL_SECONDS * 1000;

  if (jwksCache && (now - jwksCache.generatedAt < ttlMs)) {
    return jwksCache.data;
  }

  logger.info('Refreshed JWKS Cache');
  const data = refreshCache();
  jwksCache = {
    data,
    generatedAt: now
  };
  
  return data;
};

/**
 * Returns the Key ID for the current signing key.
 * Used by JWT signing utility to populate the 'kid' header.
 */
export const getSigningKeyId = (): string => {
  if (!signingKid) {
    // Force cache refresh if kid is missing (e.g. startup)
    getJwks();
  }
  if (!signingKid) {
    throw new Error('Signing Key ID could not be determined');
  }
  return signingKid;
};