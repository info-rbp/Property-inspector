"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getUsers = exports.inviteUser = exports.updateTenant = exports.getTenant = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const audit_service_1 = require("../services/audit.service");
const getTenant = async (req, res, next) => {
    try {
        const tenant = await prisma_1.prisma.tenant.findUnique({
            where: { id: req.params.tenantId }
        });
        if (!tenant)
            throw new errors_1.NotFoundError('Tenant not found');
        res.json(tenant);
    }
    catch (error) {
        next(error);
    }
};
exports.getTenant = getTenant;
const updateTenant = async (req, res, next) => {
    const schema = zod_1.z.object({ name: zod_1.z.string().min(2) });
    try {
        const { name } = schema.parse(req.body);
        const tenant = await prisma_1.prisma.tenant.update({
            where: { id: req.params.tenantId },
            data: { name }
        });
        await (0, audit_service_1.logAudit)({
            tenantId: tenant.id,
            actorUserId: req.user?.sub,
            action: 'UPDATE_TENANT',
            targetType: 'TENANT',
            targetId: tenant.id
        });
        res.json(tenant);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTenant = updateTenant;
const inviteUser = async (req, res, next) => {
    const schema = zod_1.z.object({
        email: zod_1.z.string().email(),
        role: zod_1.z.enum(['ADMIN', 'INSPECTOR', 'STAFF', 'VIEWER'])
    });
    try {
        const { email, role } = schema.parse(req.body);
        const tenantId = req.params.tenantId;
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        // Transaction to ensure idempotency
        await prisma_1.prisma.$transaction(async (tx) => {
            if (!user) {
                // Create user placeholder if not exists
                user = await tx.user.create({
                    data: {
                        email,
                        fullName: 'Invited User', // Placeholder
                        passwordHash: 'placeholder', // Cannot login until claimed
                        status: 'INVITED'
                    }
                });
            }
            const existingMembership = await tx.membership.findUnique({
                where: { tenantId_userId: { tenantId, userId: user.id } }
            });
            if (existingMembership) {
                throw new Error('User is already a member of this tenant');
            }
            await tx.membership.create({
                data: {
                    tenantId,
                    userId: user.id,
                    role
                }
            });
        });
        // In a real app, send email with invite link here.
        // Return a dummy invite token/status
        res.json({ message: 'User invited', userId: user.id, status: 'INVITED' });
        await (0, audit_service_1.logAudit)({
            tenantId,
            actorUserId: req.user?.sub,
            action: 'INVITE_USER',
            targetType: 'USER',
            targetId: user.id,
            metadata: { role }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.inviteUser = inviteUser;
const getUsers = async (req, res, next) => {
    try {
        const users = await prisma_1.prisma.membership.findMany({
            where: { tenantId: req.params.tenantId },
            include: { user: { select: { id: true, email: true, fullName: true, status: true, lastLoginAt: true } } }
        });
        res.json(users);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const updateUserRole = async (req, res, next) => {
    const schema = zod_1.z.object({ role: zod_1.z.enum(['ADMIN', 'INSPECTOR', 'STAFF', 'VIEWER']) });
    try {
        const { role } = schema.parse(req.body);
        const { tenantId, userId } = req.params;
        const membership = await prisma_1.prisma.membership.update({
            where: { tenantId_userId: { tenantId, userId } },
            data: { role }
        });
        res.json(membership);
        await (0, audit_service_1.logAudit)({
            tenantId,
            actorUserId: req.user?.sub,
            action: 'UPDATE_ROLE',
            targetType: 'USER',
            targetId: userId,
            metadata: { newRole: role }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
