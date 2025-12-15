"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbService = exports.DatabaseService = void 0;
const firestore_1 = require("@google-cloud/firestore");
const config_1 = require("../config");
const firestore = new firestore_1.Firestore({ projectId: config_1.config.projectId });
const REPORTS_COL = 'reports';
class DatabaseService {
    async getReport(reportId) {
        const doc = await firestore.collection(REPORTS_COL).doc(reportId).get();
        if (!doc.exists)
            return null;
        return doc.data();
    }
    async saveReport(data) {
        await firestore.collection(REPORTS_COL).doc(data.reportId).set(data);
    }
    async getReportsByInspection(tenantId, inspectionId) {
        const snapshot = await firestore.collection(REPORTS_COL)
            .where('tenantId', '==', tenantId)
            .where('inspectionId', '==', inspectionId)
            .orderBy('generatedAt', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Checks if a finalized report already exists for this inspection
     */
    async getFinalizedReport(tenantId, inspectionId) {
        const snapshot = await firestore.collection(REPORTS_COL)
            .where('tenantId', '==', tenantId)
            .where('inspectionId', '==', inspectionId)
            .where('status', '==', 'finalized')
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        return snapshot.docs[0].data();
    }
    async updateReportStatus(reportId, updates) {
        await firestore.collection(REPORTS_COL).doc(reportId).update(updates);
    }
}
exports.DatabaseService = DatabaseService;
exports.dbService = new DatabaseService();
