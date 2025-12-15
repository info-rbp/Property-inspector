"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const logAudit = async (params) => {
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                tenantId: params.tenantId,
                actorUserId: params.actorUserId,
                action: params.action,
                targetType: params.targetType,
                targetId: params.targetId,
                metadata: params.metadata || {},
            },
        });
    }
    catch (error) {
        // Non-blocking: just log the error if audit fails
        logger_1.logger.error('Failed to write audit log', error);
    }
};
exports.logAudit = logAudit;
