"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateById = exports.getTemplates = exports.updateBrandingDoc = exports.getBrandingDoc = void 0;
const firestore_1 = require("@google-cloud/firestore");
const config_js_1 = require("../config.js");
const firestore = new firestore_1.Firestore({
    projectId: config_js_1.config.GCP_PROJECT_ID,
    databaseId: config_js_1.config.FIRESTORE_DATABASE_ID,
});
const COLLECTION = 'tenants';
const SUB_COLLECTION = 'branding';
const DOC_ID = 'settings'; // Single doc approach: tenants/{id}/branding/settings
// Default Defaults
const DEFAULT_THEME = {
    primaryColor: '#000000',
    secondaryColor: '#333333',
    accentColor: '#007BFF',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F5F5F5',
    textColor: '#1A1A1A',
    mutedTextColor: '#666666',
    borderRadius: 8,
    fontFamily: 'system',
    logoPlacement: 'left',
    showPoweredBy: true,
};
const DEFAULT_REPORT_BRANDING = {
    templateId: 'default_v1',
    headerStyle: 'logoLeft',
    includeAgentDetails: true,
    coverPageEnabled: true,
    watermarkEnabled: false,
    signatureBlockEnabled: true,
    dateFormat: 'DD/MM/YYYY',
    pageNumbering: true,
};
const DEFAULT_EMAIL_BRANDING = {
    fromName: 'Property Inspector',
    replyTo: 'noreply@platform.com',
    brandColor: '#000000',
};
const getBrandingDoc = async (tenantId) => {
    const docRef = firestore.collection(COLLECTION).doc(tenantId).collection(SUB_COLLECTION).doc(DOC_ID);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
        // Return defaults structure, don't persist until write
        return {
            tenantId,
            brandingVersion: 0,
            updatedAt: Date.now(),
            updatedByUserId: 'system',
            status: 'active',
            theme: DEFAULT_THEME,
            assets: {},
            reportBranding: DEFAULT_REPORT_BRANDING,
            emailBranding: DEFAULT_EMAIL_BRANDING
        };
    }
    return snapshot.data();
};
exports.getBrandingDoc = getBrandingDoc;
const updateBrandingDoc = async (tenantId, userId, updates) => {
    const docRef = firestore.collection(COLLECTION).doc(tenantId).collection(SUB_COLLECTION).doc(DOC_ID);
    return await firestore.runTransaction(async (t) => {
        const doc = await t.get(docRef);
        let currentData;
        if (!doc.exists) {
            currentData = {
                tenantId,
                brandingVersion: 0,
                updatedAt: Date.now(),
                updatedByUserId: userId,
                status: 'active',
                theme: DEFAULT_THEME,
                assets: {},
                reportBranding: DEFAULT_REPORT_BRANDING,
                emailBranding: DEFAULT_EMAIL_BRANDING
            };
        }
        else {
            currentData = doc.data();
        }
        const newData = {
            ...currentData,
            ...updates,
            // Deep merge specific objects if needed, but for now we assume top-level object replacement for nested structs
            // or caller handles partial logic. Here we just overlay.
            theme: { ...currentData.theme, ...updates.theme },
            reportBranding: { ...currentData.reportBranding, ...updates.reportBranding },
            emailBranding: { ...currentData.emailBranding, ...updates.emailBranding },
            assets: { ...currentData.assets, ...updates.assets }, // Be careful with assets, usually we want to merge
            brandingVersion: currentData.brandingVersion + 1,
            updatedAt: Date.now(),
            updatedByUserId: userId,
        };
        t.set(docRef, newData);
        return newData;
    });
};
exports.updateBrandingDoc = updateBrandingDoc;
const getTemplates = async () => {
    const snapshot = await firestore.collection('templates').get();
    return snapshot.docs.map(d => d.data());
};
exports.getTemplates = getTemplates;
const getTemplateById = async (id) => {
    const doc = await firestore.collection('templates').doc(id).get();
    return doc.exists ? doc.data() : null;
};
exports.getTemplateById = getTemplateById;
