"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureTenantAccess = exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_js_1 = require("../utils/errors.js");
const config_js_1 = require("../config.js");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new errors_js_1.AppError(401, 'UNAUTHORIZED', 'Missing or invalid token'));
    }
    const token = authHeader.split(' ')[1];
    try {
        // In a real scenario, use JWT_JWKS_URL and a library like jwks-rsa to verify signature from Auth0/Firebase/Cognito
        // Here we simulate simple verification or use a shared secret for simplicity
        let decoded;
        if (config_js_1.config.JWT_PUBLIC_KEY) {
            decoded = jsonwebtoken_1.default.verify(token, config_js_1.config.JWT_PUBLIC_KEY);
        }
        else {
            // WARNING: For development only if no key provided. 
            // In production, this block should fail.
            decoded = jsonwebtoken_1.default.decode(token);
        }
        if (!decoded || typeof decoded !== 'object') {
            throw new Error('Invalid token structure');
        }
        // Map claims to our internal user structure
        // Adjust these claim keys based on your Identity Provider
        const user = {
            userId: decoded.sub || decoded.uid,
            tenantId: decoded.tenantId || decoded.org_id,
            role: decoded.role || 'viewer'
        };
        if (!user.tenantId && user.role !== 'platform_admin') {
            return next(new errors_js_1.AppError(403, 'FORBIDDEN', 'Token missing tenant context'));
        }
        req.user = user;
        next();
    }
    catch (err) {
        return next(new errors_js_1.AppError(401, 'UNAUTHORIZED', 'Invalid token'));
    }
};
exports.authenticate = authenticate;
const requireRole = (allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return next(new errors_js_1.AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
};
exports.requireRole = requireRole;
const ensureTenantAccess = (req, res, next) => {
    const { tenantId } = req.params;
    // Platform admin can access any tenant
    if (req.user?.role === 'platform_admin') {
        return next();
    }
    // Tenant users can only access their own tenant
    if (req.user?.tenantId === tenantId) {
        return next();
    }
    return next(new errors_js_1.AppError(403, 'FORBIDDEN', 'Access to this tenant is denied'));
};
exports.ensureTenantAccess = ensureTenantAccess;
