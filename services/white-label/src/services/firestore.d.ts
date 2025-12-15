import { BrandingDocument } from '../types/index.js';
export declare const getBrandingDoc: (tenantId: string) => Promise<BrandingDocument>;
export declare const updateBrandingDoc: (tenantId: string, userId: string, updates: Partial<BrandingDocument>) => Promise<BrandingDocument>;
export declare const getTemplates: () => Promise<FirebaseFirestore.DocumentData[]>;
export declare const getTemplateById: (id: string) => Promise<FirebaseFirestore.DocumentData | null | undefined>;
