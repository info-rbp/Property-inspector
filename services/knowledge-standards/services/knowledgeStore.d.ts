import { KnowledgeItem, StandardType } from '../types';
declare class KnowledgeStore {
    private data;
    constructor();
    private loadData;
    private saveData;
    getAll(type?: StandardType): KnowledgeItem[];
    getActive(type: StandardType, tenantId?: string): KnowledgeItem[];
    /**
     * Creates a new standard or updates an existing one by creating a new version
     * and deprecating the old one.
     */
    upsert(item: Partial<KnowledgeItem>, user: string): KnowledgeItem;
    resetToDefaults(): void;
}
export declare const knowledgeStore: KnowledgeStore;
export {};
