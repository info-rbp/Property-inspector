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
exports.Dashboard = void 0;
const react_2 = __importStar(require("react"));
const types_2 = require("../types");
const gatewayService_1 = require("../services/gatewayService");
const lucide_react_1 = require("lucide-react");
const Dashboard = ({ onSelectInspection }) => {
    const [inspections, setInspections] = (0, react_2.useState)([]);
    const [loading, setLoading] = (0, react_2.useState)(true);
    (0, react_2.useEffect)(() => {
        gatewayService_1.gatewayService.getInspections().then(data => {
            setInspections(data);
            setLoading(false);
        });
    }, []);
    const getStatusColor = (status) => {
        switch (status) {
            case types_2.InspectionStatus.FINALIZED: return 'bg-slate-800 text-white border-slate-900';
            case types_2.InspectionStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
            case types_2.InspectionStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-700 border-amber-200';
            case types_2.InspectionStatus.DRAFT: return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };
    const formatAddress = (addr) => {
        return `${addr.street_1}${addr.street_2 ? ', ' + addr.street_2 : ''}, ${addr.city}`;
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-full">
        <lucide_react_1.Loader2 className="animate-spin text-blue-500" size={32}/>
      </div>);
    }
    return (<div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Overview of recent activity</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm">
          <lucide_react_1.Plus size={18}/>
          New Inspection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Pending Review</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Completed Today</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Issues Found</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">23</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Inspections</h3>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {inspections.map((insp) => (<div key={insp.inspection_id} onClick={() => onSelectInspection(insp.inspection_id)} className="p-5 hover:bg-gray-50 cursor-pointer transition-colors group">
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${insp.inspection_type === 'entry' ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'}`}>
                    {insp.inspection_type === 'entry' ? 'E' : 'R'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-semibold text-gray-900">{formatAddress(insp.property_address)}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(insp.status)} capitalize`}>
                        {insp.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <lucide_react_1.Calendar size={14}/>
                        {/* Fallback for date as it's not in the strict model but useful for UI */}
                        {insp.inspection_date || insp.created_at.split('T')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <lucide_react_1.MapPin size={14}/>
                        {insp.property_address.state}, {insp.property_address.country}
                      </span>
                    </div>
                  </div>
                </div>
                <lucide_react_1.ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors"/>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
};
exports.Dashboard = Dashboard;
