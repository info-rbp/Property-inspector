import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { generateApiKey } from '../utils/jwt';
import { z } from 'zod';
import { logAudit } from '../services/audit.service';

export const createApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const schema = z.object({
    name: z.string().min(2),
    scopes: z.array(z.string()).default([])
  });

  try {
    const { name, scopes } = schema.parse(req.body);
    const tenantId = req.user!.tenantId; // Derived from auth token

    const { key, prefix, hash } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        tenantId,
        name,
        keyPrefix: prefix,
        keyHash: hash,
        scopes
      }
    });

    await logAudit({
      tenantId,
      actorUserId: req.user!.sub,
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
  } catch (error) {
    next(error);
  }
};

export const listApiKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const keys = await prisma.apiKey.findMany({
      where: { tenantId, revokedAt: null },
      select: { id: true, name: true, keyPrefix: true, scopes: true, lastUsedAt: true, createdAt: true }
    });
    res.json(keys);
  } catch (error) {
    next(error);
  }
};

export const revokeApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    // Ensure key belongs to tenant
    const apiKey = await prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!apiKey) throw new Error('API Key not found');

    await prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() }
    });

    await logAudit({
      tenantId,
      actorUserId: req.user!.sub,
      action: 'REVOKE_API_KEY',
      targetType: 'API_KEY',
      targetId: id
    });

    res.json({ message: 'API Key revoked' });
  } catch (error) {
    next(error);
  }
};