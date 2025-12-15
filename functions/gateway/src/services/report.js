"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const base_1 = require("./base");
const env_1 = require("../config/env");
class ReportService extends base_1.BaseClient {
    constructor() {
        super('Report', env_1.env.REPORT_SERVICE_URL);
    }
    async finalizeReport(tenantId, reportId) {
        try {
            const { data } = await this.client.post(`/v1/reports/${reportId}/finalize`, {}, {
                headers: { 'X-Tenant-ID': tenantId }
            });
            return data;
        }
        catch (e) {
            this.handleError(e, 'finalizeReport');
        }
    }
}
exports.reportService = new ReportService();
