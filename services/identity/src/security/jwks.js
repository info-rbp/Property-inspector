"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSigningKeyId = exports.getJwks = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
let jwksCache = null;
let signingKid = null;
/**
 * Normalizes PEM string (handles escaped newlines)
 */
const normalizePem = (pem) => {
    return pem.replace(/\\n/g, '\n').trim();
};
/**
 * Generates a deterministic Key ID (kid) based on the SHA-256 of the SPKI DER representation.
 * This ensures the kid remains stable across restarts and identical for the same key.
 */
const generateKid = (key) => {
    const der = key.export({ format: 'der', type: 'spki' });
    const hash = crypto_1.default.createHash('sha256').update(der).digest('base64');
    // Make base64url safe
    return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
/**
 * Converts a PEM public key to a JWK object
 */
const pemToJwk = (pem) => {
    try {
        const key = crypto_1.default.createPublicKey(pem);
        const kid = generateKid(key);
        // Node's export({ format: 'jwk' }) returns n, e, kty
        const jwk = key.export({ format: 'jwk' });
        return {
            kid,
            kty: jwk.kty,
            alg: 'RS256',
            use: 'sig',
            n: jwk.n,
            e: jwk.e
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to convert PEM to JWK', error);
        throw new Error('Invalid Public Key Configuration');
    }
};
/**
 * Refreshes the cache logic
 */
const refreshCache = () => {
    const keys = [];
    const processedKids = new Set();
    // 1. Primary Public Key (Matching the current Private Key)
    const primaryPem = normalizePem(env_1.config.JWT_PUBLIC_KEY);
    const primaryJwk = pemToJwk(primaryPem);
    keys.push(primaryJwk);
    processedKids.add(primaryJwk.kid);
    // Store the primary kid for signing usage
    signingKid = primaryJwk.kid;
    // 2. Rotation Keys (Additional public keys valid for verification)
    if (env_1.config.JWT_PUBLIC_KEYS) {
        try {
            const extraKeys = JSON.parse(env_1.config.JWT_PUBLIC_KEYS);
            if (Array.isArray(extraKeys)) {
                for (const pem of extraKeys) {
                    const jwk = pemToJwk(normalizePem(pem));
                    if (!processedKids.has(jwk.kid)) {
                        keys.push(jwk);
                        processedKids.add(jwk.kid);
                    }
                }
            }
        }
        catch (e) {
            logger_1.logger.error('Failed to parse JWT_PUBLIC_KEYS', e);
        }
    }
    return { keys };
};
/**
 * Returns the JWK Set, using in-memory caching.
 */
const getJwks = () => {
    const now = Date.now();
    const ttlMs = env_1.config.JWKS_CACHE_TTL_SECONDS * 1000;
    if (jwksCache && (now - jwksCache.generatedAt < ttlMs)) {
        return jwksCache.data;
    }
    logger_1.logger.info('Refreshed JWKS Cache');
    const data = refreshCache();
    jwksCache = {
        data,
        generatedAt: now
    };
    return data;
};
exports.getJwks = getJwks;
/**
 * Returns the Key ID for the current signing key.
 * Used by JWT signing utility to populate the 'kid' header.
 */
const getSigningKeyId = () => {
    if (!signingKid) {
        // Force cache refresh if kid is missing (e.g. startup)
        (0, exports.getJwks)();
    }
    if (!signingKid) {
        throw new Error('Signing Key ID could not be determined');
    }
    return signingKid;
};
exports.getSigningKeyId = getSigningKeyId;
