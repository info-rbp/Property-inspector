"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAiAnalysis = mergeAiAnalysis;
const client_1 = require("@prisma/client");
const client_2 = require("../db/client");
/**
 * Merges AI results into System of Record respecting Human Edits
 */
async function mergeAiAnalysis(ctx, results) {
    // 1. Load Scope
    const inspection = await client_2.prisma.inspection.findUnique({
        where: { id: ctx.inspectionId, tenantId: ctx.tenantId },
        include: { rooms: { include: { components: true } } }
    });
    if (!inspection)
        throw new Error("Inspection not found");
    await client_2.prisma.$transaction(async (tx) => {
        for (const res of results) {
            // Find matching component
            const room = inspection.rooms.find(r => r.id === res.roomId);
            if (!room)
                continue;
            const component = room.components.find(c => c.name === res.componentName);
            if (!component)
                continue;
            // 2. Component Level Merge (Condition Flags)
            if (!component.conditionFlagsEditedByHuman) {
                await tx.component.update({
                    where: { id: component.id },
                    data: {
                        isClean: res.condition.isClean,
                        isUndamaged: res.condition.isUndamaged,
                        isWorking: res.condition.isWorking
                    }
                });
            }
            // 3. Component Level Merge (Overview Comment)
            if (!component.overviewCommentEditedByHuman) {
                await tx.component.update({
                    where: { id: component.id },
                    data: { overviewComment: res.overviewComment }
                });
            }
            // 4. Issue Merge Strategy
            // Rule: Remove PREVIOUS AI issues for this component from the same or older analysis runs
            // But preserve HUMAN issues.
            await tx.issue.deleteMany({
                where: {
                    componentId: component.id,
                    source: client_1.IssueSource.AI,
                    // Optimization: could add analysisRunId check to only clean up specific runs if multi-model
                }
            });
            // Insert New AI Issues
            for (const issue of res.issues) {
                await tx.issue.create({
                    data: {
                        tenantId: ctx.tenantId,
                        componentId: component.id,
                        source: client_1.IssueSource.AI,
                        type: issue.type,
                        severity: issue.severity,
                        confidence: issue.confidence,
                        notes: issue.notes,
                        needsConfirmation: issue.confidence < 0.85,
                        analysisRunId: ctx.analysisRunId
                    }
                });
            }
        }
    });
}
