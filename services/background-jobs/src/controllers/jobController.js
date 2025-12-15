"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelJob = exports.listJobs = exports.getJob = exports.createJob = void 0;
const jobService_1 = require("../services/jobService");
const types_2 = require("../types");
const createJob = async (req, res) => {
    try {
        // Validate Input
        const payload = types_2.CreateJobSchema.parse({
            ...req.body,
            tenantId: req.user.tenantId, // Force tenantId from Auth
            createdByUserId: req.user.userId,
        });
        const job = await jobService_1.jobService.createJob(payload);
        res.status(201).json(job);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Invalid request' });
    }
};
exports.createJob = createJob;
const getJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const tenantId = req.user.tenantId;
        const job = await jobService_1.jobService.getJob(jobId, tenantId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getJob = getJob;
const listJobs = async (req, res) => {
    try {
        const { inspectionId } = req.params;
        const { status } = req.query;
        const tenantId = req.user.tenantId;
        if (!inspectionId) {
            return res.status(400).json({ error: 'Inspection ID required' });
        }
        const jobs = await jobService_1.jobService.listJobs(tenantId, inspectionId, status ? status : undefined);
        res.json({ jobs });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.listJobs = listJobs;
const cancelJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const tenantId = req.user.tenantId;
        await jobService_1.jobService.cancelJob(jobId, tenantId);
        res.json({ message: 'Job cancellation requested' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.cancelJob = cancelJob;
