import { ReportData } from '../types';
export declare const saveReportToDB: (report: ReportData) => Promise<void>;
export declare const getAllSavedReports: () => Promise<ReportData[]>;
export declare const loadReportFromDB: (id: string) => Promise<ReportData | null>;
export declare const deleteReportFromDB: (id: string) => Promise<void>;
