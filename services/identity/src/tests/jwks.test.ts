import { getJwks } from '../security/jwks';
import crypto from 'crypto';

// Fix TS errors for node globals in test script when types are missing
declare var require: any;
declare var module: any;

// Minimal mock environment for testing purposes if running standalone
if (!process.env.JWT_PUBLIC_KEY) {
  // Generate a temp keypair for testing
  const { publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  process.env.JWT_PUBLIC_KEY = publicKey;
}

const runTests = () => {
  console.log('🧪 Running JWKS Tests...');

  try {
    const jwks = getJwks();

    // 1. Structure Check
    if (!jwks.keys || !Array.isArray(jwks.keys)) {
      throw new Error('JWKS missing keys array');
    }
    
    const key = jwks.keys[0];

    // 2. Field Check
    const requiredFields = ['kty', 'alg', 'use', 'kid', 'n', 'e'];
    requiredFields.forEach(field => {
      if (!(field in key)) throw new Error(`Missing field: ${field}`);
    });

    // 3. Value Check
    if (key.kty !== 'RSA') throw new Error('Invalid kty');
    if (key.alg !== 'RS256') throw new Error('Invalid alg');
    if (key.use !== 'sig') throw new Error('Invalid use');

    // 4. Deterministic KID Check
    // We export to JWK which returns Base64Url encoded n/e.
    // The KID generation relies on SPKI DER hash.
    // This simply ensures the function doesn't crash and returns a string.
    if (!key.kid || key.kid.length < 10) throw new Error('Invalid kid generation');

    console.log('✅ JWKS Structure Valid');
    console.log(`✅ Generated KID: ${key.kid}`);
    console.log('✅ All Tests Passed');

  } catch (error) {
    console.error('❌ Tests Failed:', error);
    (process as any).exit(1);
  }
};

// Only run if executed directly
if (require.main === module) {
  runTests();
}