"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyAuth = exports.requireTenantAuth = exports.requireServiceAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
// 1. Internal Service Authentication
// Used by Analysis App, Report App to record usage
const requireServiceAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const serviceSecret = req.headers['x-service-secret'];
    // Check if using Service Secret strategy
    if (serviceSecret === config_1.config.SERVICE_AUTH_SECRET) {
        req.isService = true;
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Service Secret' });
};
exports.requireServiceAuth = requireServiceAuth;
// 2. Tenant/User Authentication (JWT)
// Used for Entitlement Checks and Admin/Dashboard Views
const requireTenantAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
        // Assuming JWT contains tenantId. Adjust based on Identity Service.
        // Example: { sub: 'user_123', tenantId: 'tnt_123', role: 'admin' }
        if (!decoded.tenantId) {
            return res.status(403).json({ error: 'Token missing tenantId' });
        }
        req.user = {
            tenantId: decoded.tenantId,
            role: decoded.role || 'user'
        };
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.requireTenantAuth = requireTenantAuth;
// Hybrid: Allows either Service Key OR Valid Tenant JWT
const requireAnyAuth = (req, res, next) => {
    const serviceSecret = req.headers['x-service-secret'];
    if (serviceSecret === config_1.config.SERVICE_AUTH_SECRET) {
        req.isService = true;
        return next();
    }
    (0, exports.requireTenantAuth)(req, res, next);
};
exports.requireAnyAuth = requireAnyAuth;
