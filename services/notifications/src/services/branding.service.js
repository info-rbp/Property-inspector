"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandingService = void 0;
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
class BrandingService {
    async getBranding(tenantId) {
        // In production, this calls the external Branding Service
        if (config_1.config.services.brandingBaseUrl) {
            try {
                // Mock call structure: GET /brands/{tenantId}
                // const res = await axios.get(`${config.services.brandingBaseUrl}/brands/${tenantId}`);
                // return res.data;
            }
            catch (e) {
                logger_1.default.warn("Branding service unreachable, using defaults", { tenantId });
            }
        }
        // Fallback / Default for foundation
        return {
            name: `Tenant ${tenantId}`,
            logoUrl: "https://via.placeholder.com/150x50?text=Your+Logo",
            primaryColor: "#007BFF",
            secondaryColor: "#6C757D",
            supportEmail: `support@${tenantId}.com`,
            websiteUrl: `https://${tenantId}.platform.com`,
            version: "v1.0"
        };
    }
}
exports.BrandingService = BrandingService;
