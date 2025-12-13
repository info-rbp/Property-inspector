import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StandardType, KnowledgeItem, StandardStatus } from '../types';
import { knowledgeStore } from '../services/knowledgeStore';
import { JsonDisplay } from '../components/JsonDisplay';
import { Edit2, Plus, AlertCircle, CheckCircle2, History, Layers } from 'lucide-react';

interface StandardsManagerProps {
  type: StandardType;
  title: string;
  currentView: string;
  onChangeView: (view: string) => void;
}

export const StandardsManager: React.FC<StandardsManagerProps> = ({ type, title, currentView, onChangeView }) => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setItems(knowledgeStore.getAll(type));
  };

  useEffect(() => {
    refresh();
    setSelectedItem(null);
    setIsEditing(false);
  }, [type]);

  const handleCreate = () => {
    // Template based on type
    const template: any = {
      tenantId: 'global',
      // Add specific fields based on type for better UX, simplified here to empty obj
    };
    
    // Add required fields per type for the hint
    if (type === StandardType.DEFECT) {
        template.code = "new_defect";
        template.description = "";
        template.appliesTo = [];
        template.excludedConditions = [];
    } else if (type === StandardType.SEVERITY) {
        template.severityLevel = "moderate";
        template.definition = "";
        template.visualIndicators = [];
    }
    
    setFormData(JSON.stringify(template, null, 2));
    setSelectedItem(null);
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (item: KnowledgeItem) => {
    setSelectedItem(item);
    // Remove system fields for the edit form to avoid confusion
    const { id, version, status, createdAt, updatedAt, author, type: itemType, ...editable } = item as any;
    setFormData(JSON.stringify(editable, null, 2));
    setIsEditing(true);
    setError(null);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(formData);
      
      // Basic Validation
      if (Object.keys(parsed).length === 0) throw new Error("Cannot save empty object");
      
      const payload = {
        ...parsed,
        type: type,
        id: selectedItem?.id // If present, store treats as update/version-bump
      };

      knowledgeStore.upsert(payload, 'admin_user');
      
      setIsEditing(false);
      refresh();
      
      // If we just updated, find the new version (it will be at top of list)
      // For now just clear selection
      setSelectedItem(null);

    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <Layout 
      title={title} 
      currentView={currentView} 
      onChangeView={onChangeView}
      actions={
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Standard
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
        
        {/* List Column */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Library</h3>
            <span className="text-xs text-slate-400">{items.length} records</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {items.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-lg cursor-pointer border transition-all ${
                  selectedItem?.id === item.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-slate-100 hover:border-slate-300'
                } ${item.status === StandardStatus.DEPRECATED ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status === 'active' ? 'Active' : 'Deprecated'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">v{item.version}</span>
                </div>
                
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  {/* @ts-ignore */}
                  {item.code || item.severityLevel || item.roomType || item.context || item.ruleKey}
                </h4>
                
                {/* @ts-ignore */}
                <p className="text-xs text-slate-500 line-clamp-2">{item.description || item.definition || 'No description provided'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detail/Edit Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {isEditing ? (
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    {selectedItem ? <><History size={16} /> Creating v{selectedItem.version + 1}</> : <><Plus size={16}/> New Standard</>}
                  </h3>
                  {selectedItem && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">Changes will create a new version</span>}
                </div>
                
                <div className="flex-1 p-0 relative">
                  <textarea
                    className="w-full h-full p-4 font-mono text-sm bg-slate-900 text-blue-300 focus:outline-none resize-none"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    spellCheck={false}
                  />
                </div>

                {error && (
                  <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-t border-red-100 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    Save Version
                  </button>
                </div>
             </div>
          ) : (
            selectedItem ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                       {/* @ts-ignore */}
                      {selectedItem.code || selectedItem.severityLevel || selectedItem.roomType || selectedItem.context || selectedItem.ruleKey}
                      {selectedItem.status === 'active' && <CheckCircle2 size={18} className="text-green-500" />}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">ID: {selectedItem.id}</span>
                      <span>v{selectedItem.version}</span>
                      <span>Updated: {new Date(selectedItem.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {selectedItem.status === 'active' && (
                    <button 
                      onClick={() => handleEdit(selectedItem)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                      <Edit2 size={14} /> Edit / Version
                    </button>
                  )}
                </div>
                
                <div className="flex-1 p-0 overflow-hidden">
                  <JsonDisplay data={selectedItem} height="h-full" />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Layers size={48} className="mb-4 opacity-50" />
                <p>Select a standard to view details or edit</p>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};