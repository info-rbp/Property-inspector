import { Firestore, Timestamp } from '@google-cloud/firestore';
import { config } from '../config.js';
import { BrandingDocument, BrandingTheme, ReportBranding, EmailBranding, BrandingAssets } from '../types/index.js';

const firestore = new Firestore({
    projectId: config.GCP_PROJECT_ID,
    databaseId: config.FIRESTORE_DATABASE_ID,
});

const COLLECTION = 'tenants';
const SUB_COLLECTION = 'branding';
const DOC_ID = 'settings'; // Single doc approach: tenants/{id}/branding/settings

// Default Defaults
const DEFAULT_THEME: BrandingTheme = {
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

const DEFAULT_REPORT_BRANDING: ReportBranding = {
    templateId: 'default_v1',
    headerStyle: 'logoLeft',
    includeAgentDetails: true,
    coverPageEnabled: true,
    watermarkEnabled: false,
    signatureBlockEnabled: true,
    dateFormat: 'DD/MM/YYYY',
    pageNumbering: true,
};

const DEFAULT_EMAIL_BRANDING: EmailBranding = {
    fromName: 'Property Inspector',
    replyTo: 'noreply@platform.com',
    brandColor: '#000000',
};

export const getBrandingDoc = async (tenantId: string): Promise<BrandingDocument> => {
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

    return snapshot.data() as BrandingDocument;
};

export const updateBrandingDoc = async (
    tenantId: string, 
    userId: string,
    updates: Partial<BrandingDocument>
): Promise<BrandingDocument> => {
    const docRef = firestore.collection(COLLECTION).doc(tenantId).collection(SUB_COLLECTION).doc(DOC_ID);

    return await firestore.runTransaction(async (t) => {
        const doc = await t.get(docRef);
        let currentData: BrandingDocument;

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
        } else {
            currentData = doc.data() as BrandingDocument;
        }

        const newData: BrandingDocument = {
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

export const getTemplates = async () => {
    const snapshot = await firestore.collection('templates').get();
    return snapshot.docs.map(d => d.data());
};

export const getTemplateById = async (id: string) => {
    const doc = await firestore.collection('templates').doc(id).get();
    return doc.exists ? doc.data() : null;
};
