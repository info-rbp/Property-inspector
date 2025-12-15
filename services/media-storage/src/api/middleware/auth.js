"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireServiceAuth = exports.authMiddleware = void 0;
const jose_1 = require("jose");
const config_1 = require("../../config");
const buffer_1 = require("buffer");
let JWKS;
if (config_1.config.JWT_JWKS_URL) {
    JWKS = (0, jose_1.createRemoteJWKSet)(new URL(config_1.config.JWT_JWKS_URL));
}
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Missing bearer token" } });
    }
    const token = authHeader.split(' ')[1];
    try {
        // If JWKS is not configured (local dev fallback if needed, or strictly fail)
        if (!JWKS) {
            console.warn("JWT_JWKS_URL not set, skipping signature verification (DEV ONLY)");
            // In production, this should likely fail or use a different dev flow
            // For now, attempting to decode without verify if generic dev setup, 
            // but typically we want to fail. 
            // fallback for mock tokens in dev if variables missing:
            if (process.env.NODE_ENV !== 'production' && token.startsWith('ey')) {
                const decoded = JSON.parse(buffer_1.Buffer.from(token, 'base64').toString('utf-8'));
                req.user = { userId: decoded.userId, tenantId: decoded.tenantId, role: decoded.role };
                return next();
            }
            throw new Error("JWKS not configured");
        }
        const { payload } = await (0, jose_1.jwtVerify)(token, JWKS, {
            issuer: config_1.config.JWT_ISSUER,
            audience: config_1.config.JWT_AUDIENCE,
        });
        req.user = {
            userId: String(payload.sub),
            tenantId: String(payload.tenantId),
            role: payload.role ? String(payload.role) : undefined,
        };
        return next();
    }
    catch (error) {
        console.error("Auth failed:", error);
        return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Invalid token" } });
    }
};
exports.authMiddleware = authMiddleware;
const requireServiceAuth = (req, res, next) => {
    const secret = req.headers['x-service-auth'];
    if (!secret || secret !== config_1.config.SERVICE_AUTH_SECRET) {
        return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Invalid service auth" } });
    }
    return next();
};
exports.requireServiceAuth = requireServiceAuth;
