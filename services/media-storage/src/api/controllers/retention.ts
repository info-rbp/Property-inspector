import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RetentionPolicy } from '../../types';
import { createRetentionPolicy, getRetentionPolicy, listRetentionPolicies, updateMediaRetention, getMediaRecord } from '../../storage/firestore';

export const createPolicy = async (req: Request, res: Response) => {
  const { tenantId, userId } = req.user;
  const { name, durationDays, description } = req.body;

  if (!name || !durationDays) return res.status(400).json({ error: "Missing required fields: name, durationDays" });

  const policyId = uuidv4();
  const policy: RetentionPolicy = {
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
    await createRetentionPolicy(policy);
    res.status(201).json(policy);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const listPolicies = async (req: Request, res: Response) => {
  const { tenantId } = req.user;
  try {
    const policies = await listRetentionPolicies(tenantId);
    res.json({ data: policies });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const applyPolicy = async (req: Request, res: Response) => {
  const { mediaId } = req.params;
  const { policyId } = req.body;
  const { tenantId } = req.user;

  if (!policyId) return res.status(400).json({ error: "Missing policyId" });

  try {
    const policy = await getRetentionPolicy(policyId, tenantId);
    if (!policy) return res.status(404).json({ error: "Policy not found" });

    const media = await getMediaRecord(mediaId, tenantId);
    if (!media) return res.status(404).json({ error: "Media not found" });

    // Calculate retention based on upload date
    const uploadDate = new Date(media.uploadedAt);
    const retentionDate = new Date(uploadDate.getTime() + policy.durationDays * 24 * 60 * 60 * 1000);

    await updateMediaRetention(mediaId, tenantId, policyId, retentionDate.toISOString());

    res.json({ 
        mediaId, 
        appliedPolicyId: policyId, 
        retentionUntil: retentionDate.toISOString() 
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};