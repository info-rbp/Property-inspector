"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsService = void 0;
const base_1 = require("./base");
const env_1 = require("../config/env");
class JobsService extends base_1.BaseClient {
    constructor() {
        super('Jobs', env_1.env.JOBS_SERVICE_URL);
    }
    async createJob(tenantId, type, payload, correlationId) {
        try {
            const { data } = await this.client.post('/v1/jobs', {
                type,
                payload,
                callbackUrl: `${env_1.env.SERVICE_AUTH_SECRET ? 'https://gateway-internal' : 'http://localhost:8080'}/internal/webhooks/jobs/completed`
            }, {
                headers: { 'X-Tenant-ID': tenantId, 'X-Correlation-ID': correlationId }
            });
            return data;
        }
        catch (e) {
            this.handleError(e, 'createJob');
        }
    }
}
exports.jobsService = new JobsService();
