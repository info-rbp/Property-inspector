"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaService = void 0;
const base_1 = require("./base");
const env_1 = require("../config/env");
class MediaService extends base_1.BaseClient {
    constructor() {
        super('Media', env_1.env.MEDIA_SERVICE_URL);
    }
    async initiateUpload(tenantId, payload) {
        try {
            const { data } = await this.client.post('/v1/uploads/initiate', payload, {
                headers: { 'X-Tenant-ID': tenantId }
            });
            return data;
        }
        catch (e) {
            this.handleError(e, 'initiateUpload');
        }
    }
    async completeUpload(tenantId, mediaId) {
        try {
            const { data } = await this.client.post(`/v1/uploads/${mediaId}/complete`, {}, {
                headers: { 'X-Tenant-ID': tenantId }
            });
            return data;
        }
        catch (e) {
            this.handleError(e, 'completeUpload');
        }
    }
}
exports.mediaService = new MediaService();
