import { BaseClient } from './base';
import { env } from '../config/env';
import { JobType } from '@prisma/client';

class JobsService extends BaseClient {
  constructor() {
    super('Jobs', env.JOBS_SERVICE_URL);
  }

  async createJob(tenantId: string, type: JobType, payload: any, correlationId: string) {
    try {
      const { data } = await this.client.post('/v1/jobs', {
        type,
        payload,
        callbackUrl: `${env.SERVICE_AUTH_SECRET ? 'https://gateway-internal' : 'http://localhost:8080'}/internal/webhooks/jobs/completed`
      }, {
        headers: { 'X-Tenant-ID': tenantId, 'X-Correlation-ID': correlationId }
      });
      return data as { jobId: string; status: string };
    } catch (e) {
      this.handleError(e, 'createJob');
    }
  }
}

export const jobsService = new JobsService();