import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { jobService } from '../services/jobService';
import { CreateJobSchema, JobStatus } from '../types';

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    // Validate Input
    const payload = CreateJobSchema.parse({
      ...req.body,
      tenantId: req.user!.tenantId, // Force tenantId from Auth
      createdByUserId: req.user!.userId,
    });

    const job = await jobService.createJob(payload);
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid request' });
  }
};

export const getJob = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const tenantId = req.user!.tenantId;

    const job = await jobService.getJob(jobId, tenantId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { inspectionId } = req.params;
    const { status } = req.query;
    const tenantId = req.user!.tenantId;

    if (!inspectionId) {
      return res.status(400).json({ error: 'Inspection ID required' });
    }

    const jobs = await jobService.listJobs(
        tenantId, 
        inspectionId, 
        status ? status as JobStatus : undefined
    );
    
    res.json({ jobs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelJob = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const tenantId = req.user!.tenantId;

    await jobService.cancelJob(jobId, tenantId);
    res.json({ message: 'Job cancellation requested' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
