"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeApiKey = exports.listApiKeys = exports.createApiKey = void 0;
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
const audit_service_1 = require("../services/audit.service");
const createApiKey = async (req, res, next) => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(2),
        scopes: zod_1.z.array(zod_1.z.string()).default([])
    });
    try {
        const { name, scopes } = schema.parse(req.body);
        const tenantId = req.user.tenantId; // Derived from auth token
        const { key, prefix, hash } = (0, jwt_1.generateApiKey)();
        const apiKey = await prisma_1.prisma.apiKey.create({
            data: {
                tenantId,
                name,
                keyPrefix: prefix,
                keyHash: hash,
                scopes
            }
        });
        await (0, audit_service_1.logAudit)({
            tenantId,
            actorUserId: req.user.sub,
            action: 'CREATE_API_KEY',
            targetType: 'API_KEY',
            targetId: apiKey.id
        });
        // Return the full key ONLY ONCE
        res.status(201).json({
            id: apiKey.id,
            name: apiKey.name,
            key: key, // The secret
            scopes: apiKey.scopes
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createApiKey = createApiKey;
const listApiKeys = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        const keys = await prisma_1.prisma.apiKey.findMany({
            where: { tenantId, revokedAt: null },
            select: { id: true, name: true, keyPrefix: true, scopes: true, lastUsedAt: true, createdAt: true }
        });
        res.json(keys);
    }
    catch (error) {
        next(error);
    }
};
exports.listApiKeys = listApiKeys;
const revokeApiKey = async (req, res, next) => {
    try {
        const tenantId = req.user.tenantId;
        const { id } = req.params;
        // Ensure key belongs to tenant
        const apiKey = await prisma_1.prisma.apiKey.findFirst({ where: { id, tenantId } });
        if (!apiKey)
            throw new Error('API Key not found');
        await prisma_1.prisma.apiKey.update({
            where: { id },
            data: { revokedAt: new Date() }
        });
        await (0, audit_service_1.logAudit)({
            tenantId,
            actorUserId: req.user.sub,
            action: 'REVOKE_API_KEY',
            targetType: 'API_KEY',
            targetId: id
        });
        res.json({ message: 'API Key revoked' });
    }
    catch (error) {
        next(error);
    }
};
exports.revokeApiKey = revokeApiKey;
