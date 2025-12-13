import { KnowledgeItem, StandardStatus, StandardType } from '../types';
import { INITIAL_DATA } from './mockData';

// Simulating Firestore Collection
class KnowledgeStore {
  private data: KnowledgeItem[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    const stored = localStorage.getItem('knowledge_graph_data');
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      this.data = [...INITIAL_DATA];
      this.saveData();
    }
  }

  private saveData() {
    localStorage.setItem('knowledge_graph_data', JSON.stringify(this.data));
  }

  // --- Retrieval (Read) ---

  getAll(type?: StandardType): KnowledgeItem[] {
    let result = this.data;
    if (type) {
      result = result.filter(item => item.type === type);
    }
    // Sort by updated recently
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getActive(type: StandardType, tenantId: string = 'global'): KnowledgeItem[] {
    // Basic logic: Get active global, or active tenant specific override
    // For this demo, we just get all active for the type
    return this.data.filter(item => 
      item.type === type && 
      item.status === StandardStatus.ACTIVE
    );
  }

  // --- Mutation (Write with Versioning) ---

  /**
   * Creates a new standard or updates an existing one by creating a new version
   * and deprecating the old one.
   */
  upsert(item: Partial<KnowledgeItem>, user: string): KnowledgeItem {
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
          status: StandardStatus.DEPRECATED,
          updatedAt: now
        };

        // Create new version
        const newItem: KnowledgeItem = {
          ...existingItem, // Copy props
          ...item, // Overwrite changes
          id: Math.random().toString(36).substring(2, 15), // New ID for the new document
          version: existingItem.version + 1,
          status: StandardStatus.ACTIVE,
          createdAt: now, // Technically created now as a new record
          updatedAt: now,
          author: user
        } as KnowledgeItem;

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
      status: StandardStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      author: user,
      tenantId: item.tenantId || 'global'
    } as KnowledgeItem;

    this.data.push(newItem);
    this.saveData();
    return newItem;
  }
  
  resetToDefaults() {
    this.data = [...INITIAL_DATA];
    this.saveData();
    window.location.reload();
  }
}

export const knowledgeStore = new KnowledgeStore();
