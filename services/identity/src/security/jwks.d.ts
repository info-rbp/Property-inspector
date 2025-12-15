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
/**
 * Returns the JWK Set, using in-memory caching.
 */
export declare const getJwks: () => JwksResponse;
/**
 * Returns the Key ID for the current signing key.
 * Used by JWT signing utility to populate the 'kid' header.
 */
export declare const getSigningKeyId: () => string;
export {};
