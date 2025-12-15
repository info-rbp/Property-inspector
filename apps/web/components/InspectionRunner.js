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
exports.InspectionRunner = void 0;
const react_2 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../utils");
const InspectionRunner = ({ property, onClose, onSave }) => {
    const [step, setStep] = (0, react_2.useState)('inspect');
    const [currentRoomIndex, setCurrentRoomIndex] = (0, react_2.useState)(0);
    const [rooms, setRooms] = (0, react_2.useState)((property.defaultRooms || ['Living Room', 'Kitchen']).map(roomName => ({
        id: (0, utils_1.generateId)(),
        name: roomName,
        items: [], // Items will be added per room
        photos: [],
        overallComment: ''
    })));
    const handleSave = (status) => {
        const inspection = {
            id: (0, utils_1.generateId)(),
            propertyId: property.id,
            date: new Date().toISOString(),
            inspectorName: 'Current User',
            status,
            rooms,
            summary: '' // Summary can be generated on review
        };
        onSave(inspection);
    };
    const updateRoom = (roomId, updates) => {
        setRooms(prev => prev.map(room => room.id === roomId ? { ...room, ...updates } : room));
    };
    const handlePhotoUpload = (e, roomId) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                const newPhoto = { id: (0, utils_1.generateId)(), url: base64String, caption: '' };
                const currentRoom = rooms.find(r => r.id === roomId);
                if (currentRoom) {
                    updateRoom(roomId, { photos: [...currentRoom.photos, newPhoto] });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const currentRoom = rooms[currentRoomIndex];
    const progress = Math.round(((currentRoomIndex + 1) / rooms.length) * 100);
    const handleNextRoom = () => {
        if (currentRoomIndex < rooms.length - 1) {
            setCurrentRoomIndex(prev => prev + 1);
        }
        else {
            setStep('review');
        }
    };
    if (step === 'inspect') {
        return (<div className="max-w-3xl mx-auto p-4 md:p-6 h-screen flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <button onClick={onClose} className="text-gray-500 hover:text-gray-800 flex items-center">
             <lucide_react_1.ArrowLeft size={16} className="mr-1"/> Back
           </button>
           <div className="flex items-center space-x-4">
              <button onClick={() => handleSave('draft')} className="text-gray-500 hover:text-blue-600 font-medium text-sm flex items-center">
                  <lucide_react_1.Save size={14} className="mr-1"/> Save Draft
              </button>
              <div className="text-sm font-medium text-gray-500 border-l pl-4 border-gray-300">
                Progress: {progress}%
              </div>
           </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
           <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">{currentRoom.name}</h2>
             <span className="text-xs font-mono text-gray-400">Room {currentRoomIndex + 1} of {rooms.length}</span>
           </div>

           <div className="p-6 flex-1 overflow-y-auto">
             <div className="mb-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">General Comments</label>
               <textarea value={currentRoom.overallComment} onChange={(e) => updateRoom(currentRoom.id, { overallComment: e.target.value })} placeholder={`Describe condition of ${currentRoom.name.toLowerCase()}...`} className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"/>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <div className="flex items-center space-x-4 flex-wrap gap-y-4">
                  <label className="cursor-pointer flex items-center justify-center w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, currentRoom.id)}/>
                    <lucide_react_1.Camera className="text-gray-400"/>
                  </label>
                  {currentRoom.photos.map((photo) => (<img key={photo.id} src={photo.url} alt={photo.caption || 'Room photo'} className="w-24 h-24 object-cover rounded-lg border border-gray-200"/>))}
                </div>
             </div>
           </div>

           <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
             <button onClick={() => setCurrentRoomIndex(Math.max(0, currentRoomIndex - 1))} disabled={currentRoomIndex === 0} className="px-4 py-2 rounded text-gray-600 disabled:opacity-50">
               Previous
             </button>
             <button onClick={handleNextRoom} className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
               {currentRoomIndex === rooms.length - 1 ? 'Finish & Review' : 'Next Room'}
               <lucide_react_1.ChevronRight size={16} className="ml-2"/>
             </button>
           </div>
        </div>
      </div>);
    }
    return (<div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200 mt-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-4">
          <lucide_react_1.CheckCircle size={32}/>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Inspection Complete</h2>
        <p className="text-gray-500">Review the details and save the final report.</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-60 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Inspection Summary</h3>
        {rooms.map(room => (<div key={room.id} className="flex items-start mb-2 last:mb-0">
               <lucide_react_1.ChevronRight size={14} className="text-gray-500 mt-1 mr-2 flex-shrink-0"/>
               <div>
                 <span className="text-sm font-semibold text-gray-800">{room.name}</span>
                 <p className="text-xs text-gray-600">{room.overallComment || 'No comments.'} ({room.photos.length} photos)</p>
               </div>
            </div>))}
      </div>

      <button onClick={() => handleSave('completed')} className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 flex justify-center items-center shadow-md transition-all">
        <lucide_react_1.Save className="mr-2"/>
        Lock & Save Inspection
      </button>
    </div>);
};
exports.InspectionRunner = InspectionRunner;
