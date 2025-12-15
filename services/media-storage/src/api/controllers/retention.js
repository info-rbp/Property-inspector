"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPolicy = exports.listPolicies = exports.createPolicy = void 0;
const uuid_1 = require("uuid");
const firestore_1 = require("../../storage/firestore");
const createPolicy = async (req, res) => {
    const { tenantId, userId } = req.user;
    const { name, durationDays, description } = req.body;
    if (!name || !durationDays)
        return res.status(400).json({ error: "Missing required fields: name, durationDays" });
    const policyId = (0, uuid_1.v4)();
    const policy = {
        policyId,
        tenantId,
        name,
        description: description || '',
        durationDays: Number(durationDays),
        createdAt: new Date().toISOString(),
        createdBy: userId,
        isActive: true
    };
    try {
        await (0, firestore_1.createRetentionPolicy)(policy);
        return res.status(201).json(policy);
    }
    catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
exports.createPolicy = createPolicy;
const listPolicies = async (req, res) => {
    const { tenantId } = req.user;
    try {
        const policies = await (0, firestore_1.listRetentionPolicies)(tenantId);
        return res.json({ data: policies });
    }
    catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
exports.listPolicies = listPolicies;
const applyPolicy = async (req, res) => {
    const { mediaId } = req.params;
    const { policyId } = req.body;
    const { tenantId } = req.user;
    if (!policyId)
        return res.status(400).json({ error: "Missing policyId" });
    try {
        const policy = await (0, firestore_1.getRetentionPolicy)(policyId, tenantId);
        if (!policy)
            return res.status(404).json({ error: "Policy not found" });
        const media = await (0, firestore_1.getMediaRecord)(mediaId, tenantId);
        if (!media)
            return res.status(404).json({ error: "Media not found" });
        // Calculate retention based on upload date
        const uploadDate = new Date(media.uploadedAt);
        const retentionDate = new Date(uploadDate.getTime() + policy.durationDays * 24 * 60 * 60 * 1000);
        await (0, firestore_1.updateMediaRetention)(mediaId, tenantId, policyId, retentionDate.toISOString());
        return res.json({
            mediaId,
            appliedPolicyId: policyId,
            retentionUntil: retentionDate.toISOString()
        });
    }
    catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
exports.applyPolicy = applyPolicy;
