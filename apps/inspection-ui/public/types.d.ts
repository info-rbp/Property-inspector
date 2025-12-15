export interface Photo {
    id: string;
    file: File;
    previewUrl: string;
}
export interface InspectionItem {
    id: string;
    name: string;
    isClean: boolean;
    isUndamaged: boolean;
    isWorking: boolean;
    comment: string;
}
export interface Room {
    id: string;
    name: string;
    items: InspectionItem[];
    photos: Photo[];
    overallComment: string;
}
export type ReportType = 'Entry' | 'Exit' | 'Routine';
export interface ReportData {
    id: string;
    type: ReportType;
    propertyAddress: string;
    agentName: string;
    agentCompany: string;
    clientName: string;
    inspectionDate: string;
    tenantName: string;
    rooms: Room[];
}
export declare enum ReportViewMode {
    EDIT = "EDIT",
    PREVIEW = "PREVIEW"
}
