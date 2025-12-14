
// A simplified, unified set of types for the application.

export enum RemoteInspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  REVIEWED = 'reviewed',
  CANCELLED = 'cancelled',
  SENT = 'sent'
}

export type ReportType = 'Entry' | 'Exit' | 'Routine';

export interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  isClean: boolean;
  isUndamaged: boolean;
  isWorking: boolean;
  comment: string;
  photos: Photo[];
  category: string;
  rating: any;
  notes: string;
}

export interface Room {
  id:string;
  name: string;
  items: InspectionItem[];
  photos: Photo[];
  overallComment: string;
}

export interface Property {
  id: string;
  address: string;
  ownerName: string;
  tenantName: string;
  tenantEmail: string;
  defaultRooms: string[];
  thumbnailUrl?: string;
}

export interface RemoteInspectionRequest {
  id: string;
  propertyId: string;
  status: RemoteInspectionStatus;
  tenantName: string;
  tenantEmail: string;
  inspectionDate: Date;
  rooms: Room[];
  propertyAddress: string;
  reportType: ReportType;
  dueDate: string;
}

export interface Inspection {
  id: string;
  propertyId: string;
  date: string;
  inspectorName: string;
  status: 'draft' | 'completed' | 'final';
  rooms: Room[];
  summary: string;
}
