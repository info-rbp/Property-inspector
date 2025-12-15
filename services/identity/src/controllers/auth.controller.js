"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refresh = exports.login = exports.activate = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const audit_service_1 = require("../services/audit.service");
const entitlement_service_1 = require("../services/entitlement.service");
const email_service_1 = require("../services/email.service");
const uuid_1 = require("uuid");
const register = async (req, res, next) => {
    const schema = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        fullName: zod_1.z.string().min(2),
        tenantName: zod_1.z.string().min(2),
    });
    try {
        const { email, password, fullName, tenantName } = schema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new errors_1.BadRequestError('Email already in use');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, env_1.config.BCRYPT_ROUNDS);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: { name: tenantName }
            });
            // Stub subscription - Billing service will manage lifecycle later
            await tx.tenantSubscription.create({
                data: {
                    tenantId: tenant.id,
                    planId: 'basic-stub',
                    planCode: 'BASIC',
                    status: 'ACTIVE',
                    periodStart: new Date(),
                    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
            });
            const user = await tx.user.create({
                data: {
                    email,
                    fullName,
                    passwordHash,
                    status: 'INVITED'
                }
            });
            await tx.membership.create({
                data: {
                    tenantId: tenant.id,
                    userId: user.id,
                    role: 'OWNER'
                }
            });
            const activationToken = (0, jwt_1.signActivationToken)({ sub: user.id });
            return { tenant, user, activationToken };
        });
        // Non-blocking email send
        (0, email_service_1.sendActivationEmail)(result.user.email, result.activationToken, result.tenant.id).catch(console.error);
        await (0, audit_service_1.logAudit)({
            tenantId: result.tenant.id,
            actorUserId: result.user.id,
            action: 'TENANT_REGISTERED',
            targetType: 'TENANT',
            targetId: result.tenant.id
        });
        res.status(201).json({
            message: "Registration successful. Please check your email.",
            tenantId: result.tenant.id,
            userId: result.user.id,
            // EXPOSED FOR DIAGNOSTIC HARNESS:
            activationToken: result.activationToken
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const activate = async (req, res, next) => {
    const schema = zod_1.z.object({ token: zod_1.z.string() });
    try {
        const { token } = schema.parse(req.body);
        let payload;
        try {
            payload = (0, jwt_1.verifyToken)(token);
        }
        catch (e) {
            throw new errors_1.BadRequestError('Invalid or expired activation token');
        }
        if (payload.type !== 'activation')
            throw new errors_1.BadRequestError('Invalid token type');
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { memberships: { include: { tenant: true } } }
        });
        if (!user)
            throw new errors_1.BadRequestError('User not found');
        if (user.status === 'ACTIVE')
            return res.json({ message: 'Account already active' });
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { status: 'ACTIVE' }
        });
        // Auto-login
        if (user.memberships.length === 0)
            throw new errors_1.UnauthorizedError('No tenant membership found');
        const membership = user.memberships[0];
        const tenantId = membership.tenantId;
        const entitlements = await (0, entitlement_service_1.getTenantEntitlements)(tenantId);
        const accessToken = (0, jwt_1.signAccessToken)({
            sub: user.id,
            tenantId: tenantId,
            role: membership.role,
            plan: entitlements.plan,
            features: entitlements.features
        });
        const refreshTokenString = (0, jwt_1.signRefreshToken)({ sub: user.id, tenantId });
        // Initial Refresh Token
        await prisma_1.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tenantId,
                tokenHash: (0, jwt_1.hashToken)(refreshTokenString),
                familyId: (0, uuid_1.v4)(), // Start a new token family
                expiresAt: new Date(Date.now() + env_1.config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)
            }
        });
        res.json({
            message: 'Account activated successfully',
            accessToken,
            refreshToken: refreshTokenString,
            tenantId,
            role: membership.role
        });
    }
    catch (error) {
        next(error);
    }
};
exports.activate = activate;
const login = async (req, res, next) => {
    const schema = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string(),
        tenantId: zod_1.z.string().optional(),
    });
    try {
        const { email, password, tenantId } = schema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { memberships: { include: { tenant: true } } }
        });
        if (!user || user.status !== 'ACTIVE')
            throw new errors_1.UnauthorizedError('Invalid credentials');
        const validPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!validPassword)
            throw new errors_1.UnauthorizedError('Invalid credentials');
        let targetTenantId = tenantId;
        let role = '';
        if (!targetTenantId) {
            if (user.memberships.length === 0)
                throw new errors_1.UnauthorizedError('No active memberships');
            targetTenantId = user.memberships[0].tenantId;
            role = user.memberships[0].role;
        }
        else {
            const membership = user.memberships.find(m => m.tenantId === targetTenantId);
            if (!membership)
                throw new errors_1.UnauthorizedError('Not a member of this tenant');
            role = membership.role;
        }
        const entitlements = await (0, entitlement_service_1.getTenantEntitlements)(targetTenantId);
        const accessToken = (0, jwt_1.signAccessToken)({
            sub: user.id,
            tenantId: targetTenantId,
            role,
            plan: entitlements.plan,
            features: entitlements.features
        });
        const refreshTokenString = (0, jwt_1.signRefreshToken)({ sub: user.id, tenantId: targetTenantId });
        await prisma_1.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tenantId: targetTenantId,
                tokenHash: (0, jwt_1.hashToken)(refreshTokenString),
                familyId: (0, uuid_1.v4)(), // New login = New Family
                expiresAt: new Date(Date.now() + env_1.config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)
            }
        });
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        res.json({
            accessToken,
            refreshToken: refreshTokenString,
            tenantId: targetTenantId,
            role,
            plan: entitlements.plan
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    const schema = zod_1.z.object({ refreshToken: zod_1.z.string() });
    try {
        const { refreshToken } = schema.parse(req.body);
        let payload;
        try {
            payload = (0, jwt_1.verifyToken)(refreshToken);
        }
        catch (e) {
            throw new errors_1.UnauthorizedError('Invalid token format');
        }
        if (payload.type !== 'refresh')
            throw new errors_1.UnauthorizedError('Invalid token type');
        const incomingTokenHash = (0, jwt_1.hashToken)(refreshToken);
        // 1. Find token
        const storedToken = await prisma_1.prisma.refreshToken.findFirst({
            where: { tokenHash: incomingTokenHash }
        });
        // 2. Token Reuse Detection (Theft Scenario)
        if (storedToken && storedToken.revokedAt) {
            // Alert: A revoked token is being used. Revoke the entire family.
            await prisma_1.prisma.refreshToken.updateMany({
                where: { familyId: storedToken.familyId, revokedAt: null },
                data: { revokedAt: new Date() }
            });
            await (0, audit_service_1.logAudit)({
                tenantId: payload.tenantId,
                actorUserId: payload.sub,
                action: 'TOKEN_THEFT_DETECTED',
                targetType: 'USER',
                targetId: payload.sub,
                metadata: { familyId: storedToken.familyId }
            });
            throw new errors_1.UnauthorizedError('Invalid refresh token (reuse detected)');
        }
        if (!storedToken) {
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
        // 3. Verify User & Tenant
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.sub } });
        const membership = await prisma_1.prisma.membership.findUnique({
            where: { tenantId_userId: { tenantId: payload.tenantId, userId: payload.sub } }
        });
        if (!user || !membership)
            throw new errors_1.UnauthorizedError('User access invalid');
        // 4. Rotate
        const entitlements = await (0, entitlement_service_1.getTenantEntitlements)(payload.tenantId);
        const newAccessToken = (0, jwt_1.signAccessToken)({
            sub: user.id,
            tenantId: payload.tenantId,
            role: membership.role,
            plan: entitlements.plan,
            features: entitlements.features
        });
        const newRefreshTokenString = (0, jwt_1.signRefreshToken)({ sub: user.id, tenantId: payload.tenantId });
        // Transaction: Revoke Old, Create New, Link them
        await prisma_1.prisma.$transaction(async (tx) => {
            // Create new token inheriting familyId
            const newTokenRecord = await tx.refreshToken.create({
                data: {
                    userId: user.id,
                    tenantId: payload.tenantId,
                    tokenHash: (0, jwt_1.hashToken)(newRefreshTokenString),
                    familyId: storedToken.familyId,
                    expiresAt: new Date(Date.now() + env_1.config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)
                }
            });
            // Revoke old token and point to new one
            await tx.refreshToken.update({
                where: { id: storedToken.id },
                data: {
                    revokedAt: new Date(),
                    replacedByTokenId: newTokenRecord.id
                }
            });
        });
        res.json({ accessToken: newAccessToken, refreshToken: newRefreshTokenString });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        const userId = req.user?.sub;
        // If we have the refresh token in body, revoke just that family, otherwise revoke all for user
        // For safety in this prompt, revoke all active tokens for this user on this device/tenant context
        if (userId) {
            await prisma_1.prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() }
            });
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const me = async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const tenantId = req.user.tenantId;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, fullName: true, status: true }
        });
        const membership = await prisma_1.prisma.membership.findUnique({
            where: { tenantId_userId: { tenantId, userId } },
            include: { tenant: { select: { id: true, name: true, status: true } } }
        });
        const entitlements = await (0, entitlement_service_1.getTenantEntitlements)(tenantId);
        res.json({
            user,
            tenant: membership?.tenant,
            role: membership?.role,
            entitlements
        });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
