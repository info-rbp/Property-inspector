"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeStore = void 0;
const types_2 = require("../types");
const mockData_1 = require("./mockData");
// Simulating Firestore Collection
class KnowledgeStore {
    data = [];
    constructor() {
        this.loadData();
    }
    loadData() {
        const stored = localStorage.getItem('knowledge_graph_data');
        if (stored) {
            this.data = JSON.parse(stored);
        }
        else {
            this.data = [...mockData_1.INITIAL_DATA];
            this.saveData();
        }
    }
    saveData() {
        localStorage.setItem('knowledge_graph_data', JSON.stringify(this.data));
    }
    // --- Retrieval (Read) ---
    getAll(type) {
        let result = this.data;
        if (type) {
            result = result.filter(item => item.type === type);
        }
        // Sort by updated recently
        return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    getActive(type, tenantId = 'global') {
        // Basic logic: Get active global, or active tenant specific override
        // For this demo, we just get all active for the type
        return this.data.filter(item => item.type === type &&
            item.status === types_2.StandardStatus.ACTIVE);
    }
    // --- Mutation (Write with Versioning) ---
    /**
     * Creates a new standard or updates an existing one by creating a new version
     * and deprecating the old one.
     */
    upsert(item, user) {
        const now = new Date().toISOString();
        // 1. If it's an edit of an existing active item
        if (item.id) {
            const existingIndex = this.data.findIndex(i => i.id === item.id);
            if (existingIndex > -1) {
                const existingItem = this.data[existingIndex];
                // Strict Rule: Never mutate history.
                // Mark old version as Deprecated
                this.data[existingIndex] = {
                    ...existingItem,
                    status: types_2.StandardStatus.DEPRECATED,
                    updatedAt: now
                };
                // Create new version
                const newItem = {
                    ...existingItem, // Copy props
                    ...item, // Overwrite changes
                    id: Math.random().toString(36).substring(2, 15), // New ID for the new document
                    version: existingItem.version + 1,
                    status: types_2.StandardStatus.ACTIVE,
                    createdAt: now, // Technically created now as a new record
                    updatedAt: now,
                    author: user
                };
                this.data.push(newItem);
                this.saveData();
                return newItem;
            }
        }
        // 2. New Item
        const newItem = {
            ...item,
            id: Math.random().toString(36).substring(2, 15),
            version: 1,
            status: types_2.StandardStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            author: user,
            tenantId: item.tenantId || 'global'
        };
        this.data.push(newItem);
        this.saveData();
        return newItem;
    }
    resetToDefaults() {
        this.data = [...mockData_1.INITIAL_DATA];
        this.saveData();
        window.location.reload();
    }
}
exports.knowledgeStore = new KnowledgeStore();
