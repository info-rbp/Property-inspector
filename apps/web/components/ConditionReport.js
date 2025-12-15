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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_2 = __importStar(require("react"));
const types_2 = require("@/types");
const RoomForm_1 = __importDefault(require("./RoomForm"));
const PDFPreview_1 = __importDefault(require("./PDFPreview"));
const utils_1 = require("@/utils");
const lucide_react_1 = require("lucide-react");
const getInitialReport = (type) => ({
    property: {},
    rooms: [],
    reportType: type,
    inspector: 'Admin Team',
    inspectionDate: new Date().toISOString().split('T')[0],
});
const ConditionReport = ({ reportType }) => {
    const [report, setReport] = (0, react_2.useState)(getInitialReport(reportType));
    const [viewMode, setViewMode] = (0, react_2.useState)('edit');
    const [newRoomName, setNewRoomName] = (0, react_2.useState)('');
    // Handle document title for better "Save as PDF" filenames
    (0, react_2.useEffect)(() => {
        if (viewMode === 'preview') {
            document.title = report.property.address
                ? `${report.property.address} - ${report.reportType} Condition Report`
                : `${report.reportType} Condition Report`;
        }
        else {
            document.title = 'Remote Business Partner Property Reports';
        }
    }, [viewMode, report.property.address, report.reportType]);
    const updateReport = (updates) => {
        setReport(prev => ({ ...prev, ...updates }));
    };
    const handleAddRoom = (e) => {
        e.preventDefault();
        if (!newRoomName.trim())
            return;
        const itemNames = (0, utils_1.getInitialItemsForRoom)(newRoomName);
        const initialItems = itemNames.map(name => ({
            id: (0, utils_1.generateId)(),
            name,
            isClean: true,
            isUndamaged: true,
            isWorking: true,
            comment: '',
            category: '',
            rating: types_2.ConditionRating.NOT_INSPECTED,
            notes: '',
            photos: [],
        }));
        const newRoom = {
            id: (0, utils_1.generateId)(),
            name: newRoomName,
            items: initialItems,
            overallComment: ''
        };
        setReport(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
        setNewRoomName('');
    };
    const updateRoom = (updatedRoom) => {
        setReport(prev => ({
            ...prev,
            rooms: prev.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
        }));
    };
    const deleteRoom = (roomId) => {
        if (confirm('Are you sure you want to delete this room?')) {
            setReport(prev => ({
                ...prev,
                rooms: prev.rooms.filter(r => r.id !== roomId)
            }));
        }
    };
    if (viewMode === 'preview') {
        return (<div className="fixed inset-0 z-[100] overflow-auto min-h-screen bg-gray-600 py-8 print:bg-white print:p-0 print:m-0 print:h-auto print:w-full">
        <div className="fixed top-4 right-4 flex gap-4 no-print z-50">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium">
            <lucide_react_1.Printer size={20}/> Print / Save PDF
          </button>
          <button onClick={() => setViewMode('edit')} className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium">
            <lucide_react_1.Edit2 size={20}/> Back to Edit
          </button>
        </div>
        <PDFPreview_1.default data={report}/>
      </div>);
    }
    return (<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <lucide_react_1.FileText size={24}/>
                </div>
                <div>
                <h1 className="text-2xl font-bold text-gray-900">New {report.reportType} Report</h1>
                <p className="text-gray-500">Fill in the details below to generate the {report.reportType} Condition Report.</p>
                </div>
            </div>
            <button onClick={() => setViewMode('preview')} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2 shadow-sm">
                <lucide_react_1.Eye size={16}/> Preview Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
              <input type="text" value={report.property.address} onChange={(e) => updateReport({ property: { ...report.property, address: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., 7 Riley St, Tuart Hill, WA 6060"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client / Landlord</label>
              <input type="text" value={report.property.ownerName} onChange={(e) => updateReport({ property: { ...report.property, ownerName: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="On behalf of..."/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspecting Agent</label>
              <input type="text" value={report.inspector} onChange={(e) => updateReport({ inspector: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date</label>
              <input type="date" value={report.inspectionDate} onChange={(e) => updateReport({ inspectionDate: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name(s)</label>
              <input type="text" value={report.property.tenantName} onChange={(e) => updateReport({ property: { ...report.property, tenantName: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g., John Doe"/>
            </div>
          </div>
        </div>

        {/* Room Management */}
        <div className="mb-8">
           <h2 className="text-xl font-bold text-gray-900 mb-4">Rooms & Areas</h2>

           {report.rooms.length === 0 ? (<div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl mb-6">
                <p className="text-gray-500 mb-2">No rooms added yet.</p>
                <p className="text-sm text-gray-400">Add a room like "Kitchen" or "Entry" to start.</p>
             </div>) : (report.rooms.map(room => (<RoomForm_1.default key={room.id} room={room} onUpdate={updateRoom} onDelete={() => deleteRoom(room.id)}/>)))}

           {/* Add Room Form */}
           <form onSubmit={handleAddRoom} className="bg-gray-100 p-4 rounded-lg flex gap-4 items-center border border-gray-200">
             <input type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Room Name (e.g. Master Bedroom)" className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
             <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50" disabled={!newRoomName.trim()}>
               <lucide_react_1.Plus size={20}/> Add Room
             </button>
           </form>
        </div>
    </div>);
};
exports.default = ConditionReport;
