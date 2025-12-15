"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiKey = exports.hashToken = exports.verifyToken = exports.signActivationToken = exports.signRefreshToken = exports.signAccessToken = exports.PUBLIC_KEY = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const jwks_1 = require("../security/jwks");
// Normalize keys (handle escaped newlines from env vars)
const PRIVATE_KEY = env_1.config.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
exports.PUBLIC_KEY = env_1.config.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
const signAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: `${env_1.config.JWT_ACCESS_TTL_MIN}m`,
        issuer: env_1.config.JWT_ISSUER,
        audience: env_1.config.JWT_AUDIENCE,
        keyid: (0, jwks_1.getSigningKeyId)(), // Critical for JWKS verification
    });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => {
    // Refresh tokens contain minimal claims
    return jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: `${env_1.config.JWT_REFRESH_TTL_DAYS}d`,
        issuer: env_1.config.JWT_ISSUER,
        audience: env_1.config.JWT_AUDIENCE,
        keyid: (0, jwks_1.getSigningKeyId)(),
    });
};
exports.signRefreshToken = signRefreshToken;
const signActivationToken = (payload) => {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'activation' }, PRIVATE_KEY, {
        algorithm: 'RS256',
        expiresIn: '24h',
        issuer: env_1.config.JWT_ISSUER,
        audience: env_1.config.JWT_AUDIENCE,
        keyid: (0, jwks_1.getSigningKeyId)(),
    });
};
exports.signActivationToken = signActivationToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, exports.PUBLIC_KEY, {
            algorithms: ['RS256'],
            issuer: env_1.config.JWT_ISSUER,
            audience: env_1.config.JWT_AUDIENCE,
        });
    }
    catch (err) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
const generateApiKey = () => {
    const prefix = 'sk_live_';
    const secret = crypto_1.default.randomBytes(32).toString('hex');
    const key = `${prefix}${secret}`;
    return { key, prefix, hash: (0, exports.hashToken)(key) };
};
exports.generateApiKey = generateApiKey;
