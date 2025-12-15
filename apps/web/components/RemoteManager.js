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
const react_2 = __importStar(require("react"));
const types_2 = require("@/types");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/utils");
const RemoteManager = ({ requests, properties, onCreateRequest }) => {
    const [isModalOpen, setIsModalOpen] = (0, react_2.useState)(false);
    const [selectedPropertyId, setSelectedPropertyId] = (0, react_2.useState)('');
    const [selectedReportType, setSelectedReportType] = (0, react_2.useState)('Routine');
    const [customTenantName, setCustomTenantName] = (0, react_2.useState)('');
    const [customTenantEmail, setCustomTenantEmail] = (0, react_2.useState)('');
    const handleCreate = (e) => {
        e.preventDefault();
        const selectedProperty = properties.find(p => p.id === selectedPropertyId);
        if (!selectedProperty)
            return;
        const tName = customTenantName || selectedProperty.tenantName || 'Tenant';
        const tEmail = customTenantEmail || selectedProperty.tenantEmail || '';
        const roomNames = selectedProperty.defaultRooms || ['Living Room', 'Kitchen', 'Master Bedroom'];
        const initialRooms = roomNames.map(name => ({
            id: (0, utils_1.generateId)(),
            name,
            items: [],
            photos: [],
            overallComment: ''
        }));
        const newRequest = {
            id: (0, utils_1.generateId)(),
            propertyId: selectedProperty.id,
            propertyAddress: selectedProperty.address,
            status: types_2.RemoteInspectionStatus.SENT,
            tenantName: tName,
            tenantEmail: tEmail,
            inspectionDate: new Date(),
            rooms: initialRooms,
            reportType: selectedReportType,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        onCreateRequest(newRequest);
        setIsModalOpen(false);
        resetForm();
    };
    const resetForm = () => {
        setSelectedPropertyId('');
        setSelectedReportType('Routine');
        setCustomTenantName('');
        setCustomTenantEmail('');
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case types_2.RemoteInspectionStatus.SENT:
                return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><lucide_react_1.Send size={12}/> Sent</span>;
            case types_2.RemoteInspectionStatus.IN_PROGRESS:
                return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><lucide_react_1.Clock size={12}/> In Progress</span>;
            case types_2.RemoteInspectionStatus.SUBMITTED:
            case types_2.RemoteInspectionStatus.REVIEWED: // Added REVIEWED here
                return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><lucide_react_1.CheckCircle size={12}/> Completed</span>;
            default:
                return null;
        }
    };
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Remote Inspections</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm">
          <lucide_react_1.Plus size={20}/> New Request
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="grid grid-cols-12 p-4 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase">
             <div className="col-span-5">Property / Tenant</div>
             <div className="col-span-2">Status</div>
             <div className="col-span-2">Date</div>
             <div className="col-span-3 text-right">Actions</div>
         </div>
         {requests.map(req => {
            const prop = properties.find(p => p.id === req.propertyId);
            return (<div key={req.id} className="grid grid-cols-12 p-4 border-b items-center">
                     <div className="col-span-5">
                         <div className="font-bold text-gray-900">{prop?.address}</div>
                         <div className="text-sm text-gray-500">{req.tenantName}</div>
                     </div>
                     <div className="col-span-2">{getStatusBadge(req.status)}</div>
                     <div className="col-span-2 text-sm text-gray-600">{req.inspectionDate.toLocaleDateString()}</div>
                     <div className="col-span-3 flex justify-end gap-2"></div>
                 </div>);
        })}
      </div>

      {isModalOpen && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
               <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-gray-900">Send Inspection Request</h2>
                   <button onClick={() => setIsModalOpen(false)}><lucide_react_1.X size={24} className="text-gray-400"/></button>
               </div>
               
               {properties.length === 0 ? (<div className="text-center py-8">
                     <lucide_react_1.Building className="mx-auto text-gray-300 mb-2" size={40}/>
                     <p>You have no properties managed.</p>
                  </div>) : (<form onSubmit={handleCreate} className="space-y-4">
                       <select required className="w-full border border-gray-300 rounded-lg p-2.5" value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}>
                           <option value="">-- Choose Property --</option>
                           {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                       </select>
                       <div className="pt-4 flex justify-end gap-3">
                           <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 rounded-lg">Cancel</button>
                           <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Send Request</button>
                       </div>
                   </form>)}
           </div>
        </div>)}
    </div>);
};
exports.default = RemoteManager;
