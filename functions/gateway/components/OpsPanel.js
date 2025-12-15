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
exports.OpsPanel = void 0;
const react_2 = __importStar(require("react"));
const diagnosticsApi_1 = require("../services/diagnosticsApi");
const lucide_react_1 = require("lucide-react");
const OpsPanel = () => {
    const [jobId, setJobId] = (0, react_2.useState)('');
    const [tenantSearch, setTenantSearch] = (0, react_2.useState)('');
    const [tenants, setTenants] = (0, react_2.useState)([]);
    const [loading, setLoading] = (0, react_2.useState)(false);
    const handleReprocess = async () => {
        if (!jobId)
            return;
        setLoading(true);
        await diagnosticsApi_1.diagnosticsApi.performOp('reprocess', { jobId });
        setLoading(false);
        alert(`Job ${jobId} queued for reprocessing.`);
    };
    const handleSearch = async () => {
        const res = await diagnosticsApi_1.diagnosticsApi.searchTenants(tenantSearch);
        setTenants(res);
    };
    return (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
       {/* Tenant Lookup */}
       <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <lucide_react_1.Search size={20}/> Tenant Lookup
          </h3>
          <div className="flex gap-2 mb-4">
             <input className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 text-sm focus:border-blue-500 outline-none" placeholder="Search by name..." value={tenantSearch} onChange={e => setTenantSearch(e.target.value)}/>
             <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Search</button>
          </div>

          <div className="space-y-2">
             {tenants.map(t => (<div key={t.tenantId} className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                  <div>
                     <div className="font-bold text-slate-200">{t.name}</div>
                     <div className="text-xs text-slate-500 font-mono">{t.tenantId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className={`text-[10px] px-2 py-0.5 rounded border ${t.status === 'active' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                        {t.status.toUpperCase()}
                     </span>
                     <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{t.plan}</span>
                  </div>
               </div>))}
          </div>
       </div>

       {/* Ops Actions */}
       <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="text-lg font-bold text-white mb-4">Job Operations</h3>
             <div className="space-y-4">
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">Job ID / Trace ID</label>
                   <div className="flex gap-2">
                      <input className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono" placeholder="job-..." value={jobId} onChange={e => setJobId(e.target.value)}/>
                      <button onClick={handleReprocess} disabled={loading} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                         <lucide_react_1.RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Reprocess
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="text-lg font-bold text-white mb-4">System Maintenance</h3>
             <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-red-500/50 hover:bg-slate-800/80 transition-all">
                   <div className="flex items-center gap-2 text-red-400 mb-1 font-bold text-sm"><lucide_react_1.Trash2 size={16}/> Flush Cache</div>
                   <div className="text-xs text-slate-500">Invalidate Branding & JWKS</div>
                </button>
                <button className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-blue-500/50 hover:bg-slate-800/80 transition-all">
                   <div className="flex items-center gap-2 text-blue-400 mb-1 font-bold text-sm"><lucide_react_1.Download size={16}/> Audit Dump</div>
                   <div className="text-xs text-slate-500">Download raw logs JSON</div>
                </button>
             </div>
          </div>
       </div>
    </div>);
};
exports.OpsPanel = OpsPanel;
