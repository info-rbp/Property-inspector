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
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/utils");
const PhotoThumbnail = ({ photo, onRemove }) => {
    return (<div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
      <img src={photo.url} alt="Upload preview" className="w-full h-full object-cover"/>
      <button onClick={onRemove} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <lucide_react_1.Trash2 size={14}/>
      </button>
    </div>);
};
const RoomForm = ({ room, onUpdate, onDelete }) => {
    const fileInputRef = (0, react_2.useRef)(null);
    const [isUploading, setIsUploading] = (0, react_2.useState)(false);
    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            const files = Array.from(e.target.files);
            const newPhotos = [];
            for (const file of files) {
                const base64Url = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                newPhotos.push({ id: (0, utils_1.generateId)(), url: base64Url, caption: '' });
            }
            onUpdate({ ...room, photos: [...(room.photos || []), ...newPhotos] });
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    const removePhoto = (photoId) => {
        onUpdate({ ...room, photos: (room.photos || []).filter(p => p.id !== photoId) });
    };
    return (<div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-2">
          <lucide_react_1.Trash2 size={18}/>
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Photos</h4>
          <div className="flex flex-wrap gap-2">
            {(room.photos || []).map(photo => (<PhotoThumbnail key={photo.id} photo={photo} onRemove={() => removePhoto(photo.id)}/>))}
            <label className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer">
              {isUploading ? <lucide_react_1.Loader2 className="animate-spin"/> : <lucide_react_1.Plus />}
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect}/>
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Comments</label>
          <textarea value={room.overallComment} onChange={(e) => onUpdate({ ...room, overallComment: e.target.value })} className="w-full text-sm p-2 border border-gray-300 rounded min-h-[80px]" placeholder="Overall comments for the room..."/>
        </div>
      </div>
    </div>);
};
exports.default = RoomForm;
