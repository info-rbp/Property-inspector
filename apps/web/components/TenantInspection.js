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
const TenantInspection = ({ request, onSubmit }) => {
    const [localData, setLocalData] = (0, react_2.useState)(request);
    const [currentRoomIndex, setCurrentRoomIndex] = (0, react_2.useState)(0);
    const [isSubmitting, setIsSubmitting] = (0, react_2.useState)(false);
    const currentRoom = localData.rooms[currentRoomIndex];
    const handlePhotoUpload = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64Url = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const newPhoto = { id: (0, utils_1.generateId)(), url: base64Url, caption: '' };
            const updatedRooms = [...localData.rooms];
            updatedRooms[currentRoomIndex].photos.push(newPhoto);
            setLocalData({ ...localData, rooms: updatedRooms });
        }
    };
    const updateItem = (itemId, updates) => {
        const updatedRooms = [...localData.rooms];
        const room = updatedRooms[currentRoomIndex];
        const itemIndex = room.items.findIndex(i => i.id === itemId);
        if (itemIndex > -1) {
            room.items[itemIndex] = { ...room.items[itemIndex], ...updates };
            setLocalData({ ...localData, rooms: updatedRooms });
        }
    };
    const handleSubmit = () => {
        if (window.confirm("Submit your inspection? This cannot be undone.")) {
            setIsSubmitting(true);
            onSubmit({ ...localData, status: types_2.RemoteInspectionStatus.SUBMITTED });
        }
    };
    return (<div className="min-h-screen bg-gray-50">
      <div className="p-4 sticky top-0 bg-white shadow-sm">
        <h1 className="font-bold text-lg">{currentRoom.name}</h1>
        <p className="text-sm text-gray-500">Room {currentRoomIndex + 1} of {localData.rooms.length}</p>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {currentRoom.photos.map(p => <img key={p.id} src={p.url} className="rounded-lg w-full h-auto"/>)}
            <label className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer">
              <lucide_react_1.Camera />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
            </label>
          </div>
        </div>

        {currentRoom.items.map(item => (<div key={item.id} className="bg-white p-3 rounded-lg mb-2 shadow-sm">
                <p className="font-semibold">{item.name}</p>
                <textarea value={item.comment} onChange={e => updateItem(item.id, { comment: e.target.value })} className="w-full border rounded p-1 mt-1"/>
            </div>))}

        <div className="flex justify-between mt-4">
            <button onClick={() => setCurrentRoomIndex(p => p - 1)} disabled={currentRoomIndex === 0}><lucide_react_1.ChevronLeft /> Prev</button>
            {currentRoomIndex < localData.rooms.length - 1 ?
            <button onClick={() => setCurrentRoomIndex(p => p + 1)}>Next <lucide_react_1.ChevronRight /></button> :
            <button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? <lucide_react_1.Loader2 /> : 'Submit'}</button>}
        </div>
      </div>
    </div>);
};
exports.default = TenantInspection;
