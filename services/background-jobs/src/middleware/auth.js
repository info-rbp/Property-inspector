"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireServiceAuth = exports.requireAuth = void 0;
const config_1 = require("../config");
// Public API Auth (Placeholder for JWT/API Key validation)
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    // NOTE: In production, integrate with your real Auth Provider (Auth0, Firebase Auth, etc.)
    // This is a stub to extract tenantId from headers for the demo foundation.
    let tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        return res.status(401).json({ error: 'Unauthorized: Missing X-Tenant-ID header' });
    }
    req.user = {
        tenantId: tenantId,
        userId: req.headers['x-user-id'] || 'system',
    };
    next();
};
exports.requireAuth = requireAuth;
// Internal Service Auth (for Cloud Tasks -> Worker)
const requireServiceAuth = (req, res, next) => {
    // Cast req to any to safely access headers if types are missing
    const secret = req.headers['x-service-auth'];
    if (secret !== config_1.config.auth.serviceSecret) {
        console.warn(`[Auth] Invalid service secret from ip ${req.ip}`);
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};
exports.requireServiceAuth = requireServiceAuth;
