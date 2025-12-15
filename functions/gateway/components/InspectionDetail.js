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
exports.InspectionDetail = void 0;
const react_2 = __importStar(require("react"));
const types_2 = require("../types");
const gatewayService_1 = require("../services/gatewayService");
const ComponentPanel_1 = require("./ComponentPanel");
const lucide_react_1 = require("lucide-react");
const InspectionDetail = ({ inspectionId, onBack }) => {
    const [inspection, setInspection] = (0, react_2.useState)(null);
    const [rooms, setRooms] = (0, react_2.useState)([]);
    const [selectedRoom, setSelectedRoom] = (0, react_2.useState)(null);
    const [components, setComponents] = (0, react_2.useState)([]);
    const [loading, setLoading] = (0, react_2.useState)(true);
    const [activeJob, setActiveJob] = (0, react_2.useState)(null);
    // Locking State
    const isLocked = inspection?.status === types_2.InspectionStatus.FINALIZED;
    (0, react_2.useEffect)(() => {
        loadData();
        const interval = setInterval(checkJobStatus, 3000);
        return () => clearInterval(interval);
    }, [inspectionId]);
    (0, react_2.useEffect)(() => {
        if (selectedRoom) {
            gatewayService_1.gatewayService.getRoomComponents(selectedRoom.room_id).then(setComponents);
        }
    }, [selectedRoom]);
    const loadData = async () => {
        try {
            const [insp, roomsData] = await Promise.all([
                gatewayService_1.gatewayService.getInspection(inspectionId),
                gatewayService_1.gatewayService.getInspectionRooms(inspectionId)
            ]);
            setInspection(insp);
            setRooms(roomsData);
            if (roomsData.length > 0 && !selectedRoom)
                setSelectedRoom(roomsData[0]);
            checkJobStatus();
        }
        finally {
            setLoading(false);
        }
    };
    const checkJobStatus = async () => {
        const job = await gatewayService_1.gatewayService.getJobStatus(inspectionId);
        setActiveJob(job);
        if (job?.status === types_2.JobStatus.COMPLETED) {
            // Refresh inspection to check for status changes (e.g., report generated)
            gatewayService_1.gatewayService.getInspection(inspectionId).then(setInspection);
        }
    };
    const handleStartAnalysis = async (type) => {
        if (isLocked)
            return;
        if (!confirm("Start analysis? Existing human edits will be preserved."))
            return;
        try {
            const job = type === types_2.JobType.DEEP_ANALYSIS
                ? await gatewayService_1.gatewayService.startDeepAnalysis(inspectionId)
                : await gatewayService_1.gatewayService.startAnalysis(inspectionId);
            setActiveJob(job);
        }
        catch (e) {
            alert(e.message);
        }
    };
    const handleFinalize = async () => {
        if (!confirm("WARNING: Finalizing will permanently lock this inspection. No further edits allowed."))
            return;
        try {
            const updated = await gatewayService_1.gatewayService.finalizeInspection(inspectionId);
            setInspection(updated);
        }
        catch (e) {
            alert(e.message);
        }
    };
    if (loading || !inspection)
        return <div className="p-10 text-center text-gray-500">Loading...</div>;
    return (<div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* FINALIZED BANNER */}
      {isLocked && (<div className="bg-slate-800 text-white px-4 py-2 text-sm flex items-center justify-center gap-2 font-medium">
          <lucide_react_1.Lock size={14}/>
          Inspection Finalized - Read Only Mode
        </div>)}

      {/* Detail Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600">
            <lucide_react_1.ChevronLeft size={20}/>
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Inspection #{inspectionId.slice(-4)}
              <span className={`text-xs px-2 py-0.5 rounded-full border uppercase ${inspection.status === types_2.InspectionStatus.FINALIZED ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-green-100 text-green-700 border-green-200'}`}>{inspection.status.replace('_', ' ')}</span>
            </h2>
            <div className="text-xs text-gray-500">
              {inspection.property_address.street_1}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Analysis Controls */}
          <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden shadow-sm">
             <button onClick={() => handleStartAnalysis(types_2.JobType.ANALYZE_INSPECTION)} disabled={isLocked || activeJob?.status === types_2.JobStatus.RUNNING} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-300 flex items-center gap-2 disabled:opacity-50">
                {activeJob?.status === types_2.JobStatus.RUNNING ? <lucide_react_1.Loader2 size={16} className="animate-spin"/> : <lucide_react_1.Bot size={16}/>} 
                Analyze
             </button>
             <button onClick={() => handleStartAnalysis(types_2.JobType.DEEP_ANALYSIS)} disabled={isLocked || activeJob?.status === types_2.JobStatus.RUNNING} className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 flex items-center gap-2 disabled:opacity-50">
                <lucide_react_1.Sparkles size={16}/> Deep
             </button>
          </div>

          {!isLocked ? (<button onClick={handleFinalize} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium ml-2 shadow-sm">
              <lucide_react_1.Lock size={16}/> Finalize
            </button>) : (<button className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium ml-2 cursor-not-allowed border border-gray-200" disabled>
               Report Ready
            </button>)}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Room List (Sidebar) */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto scroller">
          <div className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rooms</div>
          <div className="space-y-1 px-2">
            {rooms.map(room => (<button key={room.room_id} onClick={() => setSelectedRoom(room)} className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${selectedRoom?.room_id === room.room_id
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}>
                {room.name}
              </button>))}
          </div>
        </div>

        {/* Component List with Logic */}
        <div className="flex-1 overflow-y-auto scroller p-6 bg-slate-50/50">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-xl font-bold text-gray-900">{selectedRoom?.name} Components</h3>
            
            {components.map(comp => (<ComponentPanel_1.ComponentPanel key={comp.component_id} component={comp} jobStatus={activeJob?.status || types_2.JobStatus.PENDING} isLocked={isLocked}/>))}
          </div>
        </div>
      </div>
    </div>);
};
exports.InspectionDetail = InspectionDetail;
