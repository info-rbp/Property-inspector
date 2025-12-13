import { BrandingConfig, InspectionData } from '../types';

// In a real implementation, these would perform HTTP requests to other microservices.
// We are mocking them for the standalone deliverable.

export class IntegrationService {
  async getBranding(tenantId: string): Promise<BrandingConfig> {
    // Simulate fetch logic
    return {
      primaryColor: '#0f172a', // Slate 900
      secondaryColor: '#64748b', // Slate 500
      logoUrl: 'https://via.placeholder.com/150x50?text=TenantLogo',
      fontFamily: 'Helvetica',
      footerText: `Generated for Tenant ${tenantId} - Confidential`,
      showWatermark: false,
      brandingVersion: 1,
    };
  }

  async getInspectionData(tenantId: string, inspectionId: string): Promise<InspectionData> {
    // This mocks the Inspection Service returning structured data
    return {
      tenantId,
      inspectionId,
      inspectionType: 'exit',
      property: {
        address: '123 Fake Street, Springfield',
        clientName: 'Homer Simpson',
        inspectionDate: '2023-10-27',
      },
      rooms: [
        {
          name: 'Kitchen',
          components: [
            {
              name: 'Oven',
              condition: { isClean: false, isUndamaged: true },
              overviewComment: 'Requires professional cleaning.',
              issues: [
                { type: 'Dirt', severity: 'minor', notes: 'Grease build-up on glass' }
              ],
              photos: []
            }
          ]
        }
      ]
    };
  }
}

export const integrationService = new IntegrationService();