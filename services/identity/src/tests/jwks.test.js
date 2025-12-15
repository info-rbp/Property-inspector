"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwks_1 = require("../security/jwks");
const crypto_1 = __importDefault(require("crypto"));
// Minimal mock environment for testing purposes if running standalone
if (!process.env.JWT_PUBLIC_KEY) {
    // Generate a temp keypair for testing
    const { publicKey } = crypto_1.default.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    process.env.JWT_PUBLIC_KEY = publicKey;
}
const runTests = () => {
    console.log('🧪 Running JWKS Tests...');
    try {
        const jwks = (0, jwks_1.getJwks)();
        // 1. Structure Check
        if (!jwks.keys || !Array.isArray(jwks.keys)) {
            throw new Error('JWKS missing keys array');
        }
        const key = jwks.keys[0];
        // 2. Field Check
        const requiredFields = ['kty', 'alg', 'use', 'kid', 'n', 'e'];
        requiredFields.forEach(field => {
            if (!(field in key))
                throw new Error(`Missing field: ${field}`);
        });
        // 3. Value Check
        if (key.kty !== 'RSA')
            throw new Error('Invalid kty');
        if (key.alg !== 'RS256')
            throw new Error('Invalid alg');
        if (key.use !== 'sig')
            throw new Error('Invalid use');
        // 4. Deterministic KID Check
        // We export to JWK which returns Base64Url encoded n/e.
        // The KID generation relies on SPKI DER hash.
        // This simply ensures the function doesn't crash and returns a string.
        if (!key.kid || key.kid.length < 10)
            throw new Error('Invalid kid generation');
        console.log('✅ JWKS Structure Valid');
        console.log(`✅ Generated KID: ${key.kid}`);
        console.log('✅ All Tests Passed');
    }
    catch (error) {
        console.error('❌ Tests Failed:', error);
        process.exit(1);
    }
};
// Only run if executed directly
if (require.main === module) {
    runTests();
}
