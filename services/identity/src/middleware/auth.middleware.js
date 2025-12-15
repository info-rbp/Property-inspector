"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireTenantAccess = exports.requireServiceAuth = exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const prisma_1 = require("../utils/prisma");
const crypto_1 = __importDefault(require("crypto"));
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new errors_1.UnauthorizedError('Missing or invalid token'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        if (payload.type !== 'access') {
            throw new Error('Invalid token type');
        }
        // TypeScript narrowing confirms payload is AccessTokenPayload here
        req.user = payload;
        next();
    }
    catch (error) {
        next(new errors_1.UnauthorizedError('Invalid or expired token'));
    }
};
exports.requireAuth = requireAuth;
const requireServiceAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return next(new errors_1.UnauthorizedError('API Key required'));
    }
    // Determine hash
    const keyHash = crypto_1.default.createHash('sha256').update(apiKey).digest('hex');
    const keyRecord = await prisma_1.prisma.apiKey.findFirst({
        where: { keyHash, revokedAt: null }
    });
    if (!keyRecord) {
        return next(new errors_1.UnauthorizedError('Invalid API Key'));
    }
    // Update last used (fire and forget)
    prisma_1.prisma.apiKey.update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } }).catch(() => { });
    // For service auth, we might attach a dummy user or a specific service identity
    // For now, we allow pass-through. Specific scope checks would happen here.
    next();
};
exports.requireServiceAuth = requireServiceAuth;
const requireTenantAccess = (targetTenantParam = 'tenantId') => {
    return (req, res, next) => {
        const user = req.user;
        const requestedTenantId = req.params[targetTenantParam] || req.body[targetTenantParam];
        if (!user) {
            return next(new errors_1.UnauthorizedError());
        }
        if (user.tenantId !== requestedTenantId) {
            // In a strict multi-tenant system, accessing another tenant's data is 404 or 403.
            // 404 is safer to avoid enumeration.
            return next(new errors_1.ForbiddenError('Access to this tenant is denied'));
        }
        next();
    };
};
exports.requireTenantAccess = requireTenantAccess;
const ROLE_HIERARCHY = {
    VIEWER: 1,
    STAFF: 2,
    INSPECTOR: 3,
    ADMIN: 4,
    OWNER: 5,
};
const requireRole = (minRole) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return next(new errors_1.UnauthorizedError());
        const userLevel = ROLE_HIERARCHY[user.role] || 0;
        const requiredLevel = ROLE_HIERARCHY[minRole] || 99;
        if (userLevel < requiredLevel) {
            return next(new errors_1.ForbiddenError(`Insufficient permissions. Required: ${minRole}`));
        }
        next();
    };
};
exports.requireRole = requireRole;
