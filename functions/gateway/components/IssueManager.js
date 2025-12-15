"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueManager = void 0;
const react_2 = __importStar(require("react"));
const types_2 = require("../types");
const lucide_react_1 = require("lucide-react");
const gatewayService_1 = require("../services/gatewayService");
const IssueManager = ({ issues, componentId, isLocked, onRefresh }) => {
    // 1. Separation Logic
    const humanIssues = issues.filter(i => i.source === types_2.IssueSource.HUMAN);
    const aiIssues = issues.filter(i => i.source === types_2.IssueSource.AI && (!i.ai_resolution || i.ai_resolution === types_2.AiIssueResolution.PENDING));
    const rejectedAiIssues = issues.filter(i => i.ai_resolution === types_2.AiIssueResolution.REJECTED);
    const [isEditing, setIsEditing] = (0, react_2.useState)(null); // 'new' or issueId
    const [editForm, setEditForm] = (0, react_2.useState)({});
    const [showRejected, setShowRejected] = (0, react_2.useState)(false);
    const handleCreateHumanIssue = async () => {
        try {
            await gatewayService_1.gatewayService.createHumanIssue(componentId, {
                type: editForm.type || 'observation',
                severity: editForm.severity || types_2.IssueSeverity.MINOR,
                notes: editForm.notes
            });
            setIsEditing(null);
            setEditForm({});
            onRefresh();
        }
        catch (e) {
            alert("Failed to add issue");
        }
    };
    const handleAcceptAi = async (aiIssue) => {
        try {
            await gatewayService_1.gatewayService.resolveAiIssue(aiIssue.issue_id, 'accept');
            onRefresh();
        }
        catch (e) {
            alert("Failed to accept");
        }
    };
    const handleRejectAi = async (aiIssue) => {
        if (!confirm("Reject this suggestion? It will be hidden from reports."))
            return;
        try {
            await gatewayService_1.gatewayService.resolveAiIssue(aiIssue.issue_id, 'reject');
            onRefresh();
        }
        catch (e) {
            alert("Failed to reject");
        }
    };
    const handleOverrideAi = async (aiIssue) => {
        // Pre-fill form with AI data
        setEditForm({ type: aiIssue.type, severity: aiIssue.severity, notes: aiIssue.notes });
        setIsEditing(aiIssue.issue_id); // Using AI ID as key to know we are overriding
    };
    const submitOverride = async (aiIssueId) => {
        try {
            await gatewayService_1.gatewayService.resolveAiIssue(aiIssueId, 'accept', editForm);
            setIsEditing(null);
            setEditForm({});
            onRefresh();
        }
        catch (e) {
            alert("Failed to override");
        }
    };
    if (isEditing === 'new') {
        return (<IssueEditor initialData={{}} onSave={handleCreateHumanIssue} onCancel={() => setIsEditing(null)}/>);
    }
    return (<div className="space-y-6">
      {/* HUMAN ISSUES (Source of Truth) */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <lucide_react_1.User size={16} className="text-blue-600"/> Human Findings
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{humanIssues.length}</span>
          </h4>
          {!isLocked && (<button onClick={() => setIsEditing('new')} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 font-medium">
              + Add Issue
            </button>)}
        </div>
        
        {humanIssues.length === 0 && <p className="text-sm text-gray-400 italic">No issues recorded manually.</p>}
        
        <div className="space-y-3">
          {humanIssues.map(issue => (<div key={issue.issue_id} className="bg-white border border-l-4 border-l-blue-500 border-gray-200 p-3 rounded shadow-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">{issue.type}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wide ${issue.severity === types_2.IssueSeverity.CRITICAL ? 'bg-red-100 text-red-700' :
                issue.severity === types_2.IssueSeverity.MAJOR ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'}`}>{issue.severity}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{issue.notes}</p>
              {issue.provenance?.derived_from_issue_id && (<div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                  <lucide_react_1.Bot size={10}/> Copied from AI suggestion
                </div>)}
            </div>))}
        </div>
      </div>

      {/* AI SUGGESTIONS */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-bold text-purple-800 flex items-center gap-2 mb-3">
          <lucide_react_1.Bot size={16} className="text-purple-600"/> AI Suggestions
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">{aiIssues.length}</span>
        </h4>

        {aiIssues.length === 0 && <p className="text-sm text-gray-400 italic">No active suggestions.</p>}

        <div className="space-y-3">
          {aiIssues.map(issue => (isEditing === issue.issue_id ? (<div key={issue.issue_id} className="border border-purple-200 rounded p-2 bg-purple-50">
                 <p className="text-xs text-purple-700 mb-2 font-medium">Overriding AI Suggestion:</p>
                 <IssueEditor initialData={{ type: issue.type, severity: issue.severity, notes: issue.notes }} onSave={() => submitOverride(issue.issue_id)} onCancel={() => setIsEditing(null)}/>
              </div>) : (<div key={issue.issue_id} className="bg-purple-50 border border-purple-100 p-3 rounded hover:border-purple-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="font-semibold text-purple-900">{issue.type}</span>
                       <span className="text-xs bg-white text-purple-600 px-1.5 rounded border border-purple-200">
                         {Math.round(issue.confidence * 100)}%
                       </span>
                    </div>
                    <p className="text-sm text-purple-800 mt-1">{issue.notes}</p>
                  </div>
                  
                  {!isLocked && (<div className="flex gap-1">
                      <button onClick={() => handleAcceptAi(issue)} title="Accept" className="p-1.5 bg-white border border-green-200 text-green-600 rounded hover:bg-green-50">
                        <lucide_react_1.Check size={16}/>
                      </button>
                      <button onClick={() => handleOverrideAi(issue)} title="Edit & Accept" className="p-1.5 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-50">
                        <lucide_react_1.Edit2 size={16}/>
                      </button>
                      <button onClick={() => handleRejectAi(issue)} title="Reject" className="p-1.5 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50">
                        <lucide_react_1.X size={16}/>
                      </button>
                    </div>)}
                </div>
              </div>)))}
        </div>
      </div>

      {/* REJECTED HISTORY */}
      {rejectedAiIssues.length > 0 && (<div className="border-t border-gray-200 pt-2">
           <button onClick={() => setShowRejected(!showRejected)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
             {showRejected ? 'Hide' : 'Show'} {rejectedAiIssues.length} rejected suggestions
           </button>
           {showRejected && (<div className="mt-2 space-y-2 opacity-60">
                {rejectedAiIssues.map(i => (<div key={i.issue_id} className="text-xs text-gray-500 pl-2 border-l-2 border-gray-300">
                    <span className="line-through">{i.type}</span> - {i.notes}
                  </div>))}
              </div>)}
        </div>)}
    </div>);
};
exports.IssueManager = IssueManager;
const IssueEditor = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = (0, react_2.useState)(initialData);
    return (<div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-3">
       <div>
         <label className="block text-xs font-medium text-gray-700">Type</label>
         <input className="w-full text-sm p-1.5 rounded border" value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })}/>
       </div>
       <div>
         <label className="block text-xs font-medium text-gray-700">Severity</label>
         <select className="w-full text-sm p-1.5 rounded border" value={formData.severity || types_2.IssueSeverity.MINOR} onChange={e => setFormData({ ...formData, severity: e.target.value })}>
           {Object.values(types_2.IssueSeverity).map(s => <option key={s} value={s}>{s}</option>)}
         </select>
       </div>
       <div>
         <label className="block text-xs font-medium text-gray-700">Notes</label>
         <textarea className="w-full text-sm p-1.5 rounded border" rows={2} value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })}/>
       </div>
       <div className="flex justify-end gap-2">
         <button onClick={onCancel} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
         <button onClick={() => onSave(formData)} className="px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded">Save Issue</button>
       </div>
    </div>);
};
