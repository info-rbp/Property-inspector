"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth = __importStar(require("../controllers/auth.controller"));
const Tenant = __importStar(require("../controllers/tenant.controller"));
const ApiKey = __importStar(require("../controllers/api-key.controller"));
const wellKnown_routes_1 = __importDefault(require("./wellKnown.routes"));
const diagnostics_routes_1 = __importDefault(require("./diagnostics.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// --- Diagnostics & Discovery ---
router.use('/.well-known', wellKnown_routes_1.default);
router.use('/', diagnostics_routes_1.default); // Mounts /health and /ready
// --- AI Routes ---
router.use('/ai', ai_routes_1.default);
// --- Auth Routes ---
router.post('/auth/register', Auth.register);
router.post('/auth/activate', Auth.activate);
router.post('/auth/login', Auth.login);
router.post('/auth/refresh', Auth.refresh);
router.post('/auth/logout', auth_middleware_1.requireAuth, Auth.logout);
router.get('/auth/me', auth_middleware_1.requireAuth, Auth.me);
// --- Tenant Routes ---
router.use('/tenants/:tenantId', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireTenantAccess)('tenantId'));
router.get('/tenants/:tenantId', Tenant.getTenant);
router.patch('/tenants/:tenantId', (0, auth_middleware_1.requireRole)('ADMIN'), Tenant.updateTenant);
router.get('/tenants/:tenantId/users', (0, auth_middleware_1.requireRole)('ADMIN'), Tenant.getUsers);
router.post('/tenants/:tenantId/users/invite', (0, auth_middleware_1.requireRole)('ADMIN'), Tenant.inviteUser);
router.patch('/tenants/:tenantId/users/:userId/role', (0, auth_middleware_1.requireRole)('OWNER'), Tenant.updateUserRole);
// --- API Key Routes ---
router.post('/api-keys', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('ADMIN'), ApiKey.createApiKey);
router.get('/api-keys', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('ADMIN'), ApiKey.listApiKeys);
router.post('/api-keys/:id/revoke', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)('ADMIN'), ApiKey.revokeApiKey);
exports.default = router;
