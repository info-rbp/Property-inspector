import { BaseClient } from './base';
import { env } from '../config/env';

class ReportService extends BaseClient {
  constructor() {
    super('Report', env.REPORT_SERVICE_URL);
  }

  async finalizeReport(tenantId: string, reportId: string) {
    try {
      const { data } = await this.client.post(`/v1/reports/${reportId}/finalize`, {}, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      return data;
    } catch (e) {
      this.handleError(e, 'finalizeReport');
    }
  }
}

export const reportService = new ReportService();