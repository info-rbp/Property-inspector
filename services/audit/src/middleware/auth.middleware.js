"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceTenantScope = exports.requireTenantAuth = exports.requireServiceAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const client = (0, jwks_rsa_1.default)({
    jwksUri: process.env.JWT_JWKS_URL || 'https://example.com/.well-known/jwks.json'
});
function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (err || !key) {
            callback(err, null);
            return;
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}
// 1. Service-to-Service Auth (For Writes)
const requireServiceAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Expect format: "Bearer <SERVICE_SECRET>"
    // In production, use OIDC tokens from Cloud Run. Here we use a secret for simplicity.
    const token = authHeader?.split(' ')[1];
    if (!token || token !== process.env.SERVICE_AUTH_SECRET) {
        return res.status(403).json({ error: 'Forbidden: Invalid Service Credentials' });
    }
    next();
};
exports.requireServiceAuth = requireServiceAuth;
// 2. User/Tenant Auth (For Reads)
const requireTenantAuth = (req, res, next) => {
    // If we are in dev mode and don't have a real JWKS url, skip (MOCK)
    if (process.env.NODE_ENV === 'development' && !process.env.JWT_JWKS_URL) {
        // Mock user for local dev
        req.user = { sub: 'mock-user', tenantId: req.query.tenantId || 'tnt_dev' };
        return next();
    }
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    jsonwebtoken_1.default.verify(token, getKey, {}, (err, decoded) => {
        if (err)
            return res.status(401).json({ error: 'Invalid Token' });
        req.user = decoded;
        next();
    });
};
exports.requireTenantAuth = requireTenantAuth;
// 3. Tenant Scope Check
const enforceTenantScope = (req, res, next) => {
    const user = req.user;
    const requestedTenantId = req.params.tenantId || req.query.tenantId || req.body.tenantId;
    // Platform admin bypass (check role in JWT)
    if (user.roles && user.roles.includes('platform_admin')) {
        return next();
    }
    if (!user.tenantId || user.tenantId !== requestedTenantId) {
        return res.status(403).json({ error: 'Forbidden: Tenant Mismatch' });
    }
    next();
};
exports.enforceTenantScope = enforceTenantScope;
