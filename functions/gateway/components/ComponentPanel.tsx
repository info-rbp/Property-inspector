import React, { useState, useEffect, useRef } from 'react';
import { Component, Issue, MediaReference, JobStatus, IssueSource, InspectionStatus } from '../types';
import { gatewayService } from '../services/gatewayService';
import { IssueManager } from './IssueManager';
import { CheckCircle2, AlertTriangle, Loader2, Camera, Info } from 'lucide-react';

interface ComponentPanelProps {
  component: Component;
  jobStatus: JobStatus;
  isLocked: boolean;
}

export const ComponentPanel: React.FC<ComponentPanelProps> = ({ component, jobStatus, isLocked }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [media, setMedia] = useState<MediaReference[]>([]);
  const [localCondition, setLocalCondition] = useState(component.condition);
  const [localComment, setLocalComment] = useState(component.overview_comment || '');
  const [isUploading, setIsUploading] = useState(false);
  
  // Track optimistic state for "Edited by Human" visual feedback
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadComponentData();
    setLocalCondition(component.condition);
    setLocalComment(component.overview_comment || '');
  }, [component, jobStatus]);

  const loadComponentData = async () => {
    const [i, m] = await Promise.all([
      gatewayService.getComponentIssues(component.component_id),
      gatewayService.getComponentMedia(component.component_id)
    ]);
    setIssues(i);
    setMedia(m);
  };

  const handleConditionToggle = async (key: keyof typeof localCondition) => {
    if (isLocked) return;
    const newVal = !localCondition[key];
    setLocalCondition(prev => ({ ...prev, [key]: newVal }));
    
    try {
       await gatewayService.updateComponentCondition(component.component_id, { [key]: newVal } as any);
    } catch (e) {
       // Rollback
       setLocalCondition(prev => ({ ...prev, [key]: !newVal }));
       alert("Update failed");
    }
  };

  const handleCommentBlur = async () => {
    if (isLocked || localComment === component.overview_comment) return;
    try {
      await gatewayService.updateComponentComment(component.component_id, localComment);
      setIsDirty(true); // Persisted
    } catch (e) { alert("Failed to save comment"); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      try {
        const { media_id } = await gatewayService.initiateUpload(component.component_id, file);
        await gatewayService.completeUpload(component.component_id, media_id);
        await loadComponentData();
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Header & Condition Flags */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-medium text-gray-900">{component.name}</h4>
            {component.human_edited_metadata.condition_flags_edited && (
              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Human Edited</span>
            )}
          </div>
          <div className="flex gap-2">
             <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleFileUpload}
               accept="image/*"
             />
             <button 
               onClick={() => !isLocked && fileInputRef.current?.click()}
               disabled={isUploading || isLocked}
               className={`text-sm border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
             >
               {isUploading ? <Loader2 className="animate-spin" size={14}/> : <Camera size={14} />}
               Add Photo
             </button>
          </div>
        </div>

        {/* Interactive Condition Toggles */}
        <div className="flex gap-3">
           <ConditionToggle 
             label="Clean" 
             value={localCondition.is_clean} 
             onClick={() => handleConditionToggle('is_clean')} 
             disabled={isLocked} 
           />
           <ConditionToggle 
             label="Undamaged" 
             value={localCondition.is_undamaged} 
             onClick={() => handleConditionToggle('is_undamaged')} 
             disabled={isLocked}
           />
           <ConditionToggle 
             label="Working" 
             value={localCondition.is_working} 
             onClick={() => handleConditionToggle('is_working')} 
             disabled={isLocked}
           />
        </div>
      </div>

      {/* Media Gallery */}
      {media.length > 0 && (
        <div className="p-4 bg-gray-50 flex gap-3 overflow-x-auto border-b border-gray-100">
          {media.map(m => (
            <div key={m.media_ref_id} className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 group">
              <img src={m.url} alt="Evidence" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Overview Comment */}
      <div className="p-4 border-b border-gray-100">
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block flex justify-between">
          Overview Comment
          {component.human_edited_metadata.overview_comment_edited && <span className="text-blue-600 lowercase font-normal text-[10px]">(human edited)</span>}
        </label>
        <textarea 
          className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
          rows={2}
          value={localComment}
          onChange={e => setLocalComment(e.target.value)}
          onBlur={handleCommentBlur}
          disabled={isLocked}
          placeholder="General observations..."
        />
      </div>

      {/* Issue Manager */}
      <div className="p-4 bg-slate-50/50">
        <IssueManager 
          issues={issues} 
          componentId={component.component_id} 
          isLocked={isLocked}
          onRefresh={loadComponentData}
        />
      </div>
    </div>
  );
};

const ConditionToggle: React.FC<{ label: string, value: boolean | null, onClick: () => void, disabled: boolean }> = ({ label, value, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
      value === true 
      ? 'bg-green-50 border-green-200 text-green-700' 
      : value === false 
        ? 'bg-red-50 border-red-200 text-red-700' 
        : 'bg-gray-50 border-gray-200 text-gray-500'
    } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
  >
    {value === true ? <CheckCircle2 size={12} /> : value === false ? <AlertTriangle size={12} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
    {label}
  </button>
);
