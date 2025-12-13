
import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

export interface BrandSettings {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  websiteUrl: string;
  version: string;
}

export class BrandingService {
  async getBranding(tenantId: string): Promise<BrandSettings> {
    // In production, this calls the external Branding Service
    if (config.services.brandingBaseUrl) {
        try {
            // Mock call structure: GET /brands/{tenantId}
            // const res = await axios.get(`${config.services.brandingBaseUrl}/brands/${tenantId}`);
            // return res.data;
        } catch (e) {
            logger.warn("Branding service unreachable, using defaults", { tenantId });
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
