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
exports.Simulator = void 0;
const react_2 = __importStar(require("react"));
const Layout_1 = require("../components/Layout");
const JsonDisplay_1 = require("../components/JsonDisplay");
const retrievalEngine_1 = require("../services/retrievalEngine");
const lucide_react_1 = require("lucide-react");
const Simulator = ({ onChangeView }) => {
    const [request, setRequest] = (0, react_2.useState)({
        tenantId: 'global',
        roomType: 'bathroom',
        components: ['walls', 'tiles', 'shower area'],
        analysisMode: 'DEEP'
    });
    const [response, setResponse] = (0, react_2.useState)(null);
    const [loading, setLoading] = (0, react_2.useState)(false);
    const handleSimulate = () => {
        setLoading(true);
        // Simulate network delay for realism
        setTimeout(() => {
            const result = (0, retrievalEngine_1.retrieveContext)(request);
            setResponse(result);
            setLoading(false);
        }, 400);
    };
    const handleComponentChange = (e) => {
        const val = e.target.value;
        setRequest(prev => ({ ...prev, components: val.split(',').map(s => s.trim()) }));
    };
    return (<Layout_1.Layout title="Context Retrieval Simulator" currentView="simulator" onChangeView={onChangeView}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
        
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <lucide_react_1.Zap size={16} className="text-amber-500"/> Analysis Request Parameters
            </h3>
            <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Simulated Payload</span>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            
            {/* Tenant ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tenant ID</label>
              <select value={request.tenantId} onChange={(e) => setRequest({ ...request, tenantId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="global">Global (Default)</option>
                <option value="tnt_123">Tenant 123 (Override Test)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Retrieval is scoped to this tenant.</p>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
              <select value={request.roomType} onChange={(e) => setRequest({ ...request, roomType: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="bathroom">Bathroom</option>
                <option value="kitchen">Kitchen</option>
                <option value="bedroom">Bedroom</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>

            {/* Components */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Visible Components</label>
              <input type="text" value={request.components.join(', ')} onChange={handleComponentChange} placeholder="e.g. walls, ceiling, toilet" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
              <p className="text-xs text-slate-500 mt-1">Comma separated. Filters relevant defects.</p>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Analysis Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="mode" checked={request.analysisMode === 'FAST'} onChange={() => setRequest({ ...request, analysisMode: 'FAST' })} className="text-blue-600 focus:ring-blue-500"/>
                  Fast Scan
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="mode" checked={request.analysisMode === 'DEEP'} onChange={() => setRequest({ ...request, analysisMode: 'DEEP' })} className="text-blue-600 focus:ring-blue-500"/>
                  Deep Analysis
                </label>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-slate-100">
              <button onClick={handleSimulate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                {loading ? (<span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>) : (<lucide_react_1.Play size={18}/>)}
                Retrieve AI Context
              </button>
            </div>

          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
             <h3 className="font-semibold text-slate-300 flex items-center gap-2">
              Retrieval Response Payload
            </h3>
            {response && (<div className="flex items-center gap-2 text-xs">
                 <span className="text-green-400">Status: 200 OK</span>
                 <span className="text-slate-500">|</span>
                 <span className="text-slate-400">{response.metadata.timestamp}</span>
               </div>)}
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {response ? (<JsonDisplay_1.JsonDisplay data={response} height="h-full"/>) : (<div className="h-full flex flex-col items-center justify-center text-slate-600">
                <div className="w-16 h-16 rounded-full border-2 border-slate-700 border-dashed flex items-center justify-center mb-4">
                  <lucide_react_1.RotateCcw size={24}/>
                </div>
                <p>Waiting for simulation run...</p>
              </div>)}
          </div>
        </div>

      </div>
    </Layout_1.Layout>);
};
exports.Simulator = Simulator;
