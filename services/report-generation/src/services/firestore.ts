import { Firestore } from '@google-cloud/firestore';
import { config } from '../config';
import { ReportMetadata } from '../types';

const firestore = new Firestore({ projectId: config.projectId });
const REPORTS_COL = 'reports';

export class DatabaseService {
  async getReport(reportId: string): Promise<ReportMetadata | null> {
    const doc = await firestore.collection(REPORTS_COL).doc(reportId).get();
    if (!doc.exists) return null;
    return doc.data() as ReportMetadata;
  }

  async saveReport(data: ReportMetadata): Promise<void> {
    await firestore.collection(REPORTS_COL).doc(data.reportId).set(data);
  }

  async getReportsByInspection(tenantId: string, inspectionId: string): Promise<ReportMetadata[]> {
    const snapshot = await firestore.collection(REPORTS_COL)
      .where('tenantId', '==', tenantId)
      .where('inspectionId', '==', inspectionId)
      .orderBy('generatedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as ReportMetadata);
  }

  /**
   * Checks if a finalized report already exists for this inspection
   */
  async getFinalizedReport(tenantId: string, inspectionId: string): Promise<ReportMetadata | null> {
    const snapshot = await firestore.collection(REPORTS_COL)
      .where('tenantId', '==', tenantId)
      .where('inspectionId', '==', inspectionId)
      .where('status', '==', 'finalized')
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as ReportMetadata;
  }

  async updateReportStatus(reportId: string, updates: Partial<ReportMetadata>): Promise<void> {
    await firestore.collection(REPORTS_COL).doc(reportId).update(updates);
  }
}

export const dbService = new DatabaseService();