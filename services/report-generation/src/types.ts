export type InspectionType = 'entry' | 'routine' | 'exit';
export type ReportStatus = 'draft' | 'finalized';

// --- Input Data Structure ---

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  fontFamily: string;
  footerText: string;
  showWatermark: boolean;
  brandingVersion: number;
}

export interface Photo {
  mediaId: string;
  caption?: string;
  url?: string; // Resolved URL
}

export interface Issue {
  type: string;
  severity: 'minor' | 'major' | 'critical';
  notes: string;
  confidence?: number;
}

export interface Component {
  name: string;
  condition: {
    isClean: boolean;
    isUndamaged: boolean;
    isWorking?: boolean;
  };
  overviewComment?: string;
  issues: Issue[];
  photos: Photo[];
}

export interface Room {
  name: string;
  components: Component[];
}

export interface PropertyData {
  address: string;
  clientName: string;
  inspectionDate: string;
}

export interface InspectionData {
  tenantId: string;
  inspectionId: string;
  inspectionType: InspectionType;
  property: PropertyData;
  rooms: Room[];
}

// --- Report Metadata (Storage) ---

export interface ReportMetadata {
  reportId: string;
  tenantId: string;
  inspectionId: string;
  inspectionType: InspectionType;
  status: ReportStatus;
  templateId: string;
  templateVersion: string;
  brandingVersion: number;
  generatedAt: string; // ISO String
  generatedByJobId?: string;
  generatedByUserId?: string;
  pdfStoragePath: string;
  pageCount: number;
  checksum: string; // SHA256
  lockedAt?: string | null;
  metadata: {
    roomCount: number;
    photoCount: number;
    issueCount: number;
    majorIssueCount: number;
  };
}

export interface ServiceError {
  code: string;
  message: string;
  statusCode: number;
}
