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
const types_2 = require("../types");
const lucide_react_1 = require("lucide-react");
const store_1 = require("../state/store");
const ROOMS = ['Entry', 'Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bathroom', 'Exterior'];
const InspectionRunner = ({ property, onClose }) => {
    const { dispatch } = (0, store_1.useStore)();
    const [step, setStep] = (0, react_2.useState)('verify');
    const [currentRoomIndex, setCurrentRoomIndex] = (0, react_2.useState)(0);
    const [inspectionData, setInspectionData] = (0, react_2.useState)({
        id: `insp-${Date.now()}`,
        propertyId: property.id,
        date: new Date().toISOString(),
        inspectorName: 'Current User',
        status: 'draft',
        items: ROOMS.map((room, idx) => ({
            id: `item-${idx}`,
            category: 'Room',
            name: room,
            rating: types_2.ConditionRating.NOT_INSPECTED,
            notes: '',
            photos: []
        })),
        summary: ''
    });
    const handleSave = (status) => {
        const finalData = { ...inspectionData, status };
        dispatch({ type: 'ADD_REPORT', payload: finalData });
        onClose();
    };
    const updateItem = (itemId, updates) => {
        setInspectionData(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
        }));
    };
    const handlePhotoUpload = (e, itemId, currentPhotos) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                updateItem(itemId, { photos: [...currentPhotos, base64String] });
            };
            reader.readAsDataURL(file);
        }
    };
    const currentItem = inspectionData.items[currentRoomIndex];
    const progress = Math.round((inspectionData.items.filter(i => i.rating !== types_2.ConditionRating.NOT_INSPECTED).length / inspectionData.items.length) * 100);
    const handleNextRoom = () => {
        if (currentRoomIndex < inspectionData.items.length - 1) {
            setCurrentRoomIndex(prev => prev + 1);
        }
        else {
            setStep('review');
        }
    };
    if (step === 'verify') {
        return (<div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 mt-10">
        <h2 className="text-2xl font-bold mb-4">Step 1: Verify & Context</h2>
        
        {/* Management Context Header */}
        <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-slate-700">
           <h3 className="font-bold text-blue-900 mb-2 flex items-center"><lucide_react_1.Building size={16} className="mr-2"/> Management Context</h3>
           <div className="grid grid-cols-2 gap-4">
              <div>
                  <span className="text-xs font-bold uppercase text-blue-400 block">Managed By</span>
                  {property.management?.managedBy}
              </div>
              <div>
                  <span className="text-xs font-bold uppercase text-blue-400 block">Key Access</span>
                  <div className="flex items-center">
                    <lucide_react_1.Key size={14} className="mr-1 opacity-70"/>
                    {property.management?.keyAccess}
                  </div>
              </div>
              <div className="col-span-2">
                  <span className="text-xs font-bold uppercase text-blue-400 block">Access Notes</span>
                  <div className="bg-white p-2 rounded border border-blue-100 mt-1">
                      {property.management?.accessNotes || 'No notes provided.'}
                  </div>
              </div>
           </div>
        </div>

        <p className="text-slate-600 mb-6">Confirm structural attributes sourced from external data providers.</p>
        
        <div className="space-y-4 mb-8">
           {[
                { label: 'Property Type', val: property.attributes.type.value },
                { label: 'Bedrooms', val: property.attributes.bedrooms.value },
                { label: 'Bathrooms', val: property.attributes.bathrooms.value },
                { label: 'Car Spaces', val: property.attributes.carSpaces.value },
            ].map((fact, idx) => (<div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
               <span className="font-medium text-slate-700">{fact.label}</span>
               <div className="flex items-center">
                 <span className="mr-3 font-bold text-lg">{fact.val}</span>
                 <lucide_react_1.CheckCircle className="text-green-500" size={18}/>
               </div>
             </div>))}
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
          <button onClick={() => setStep('inspect')} className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">
            Confirm & Start Inspection
          </button>
        </div>
      </div>);
    }
    if (step === 'inspect') {
        return (<div className="max-w-3xl mx-auto p-4 md:p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
           <button onClick={() => setStep('verify')} className="text-slate-500 hover:text-slate-800 flex items-center">
             <lucide_react_1.ArrowLeft size={16} className="mr-1"/> Back
           </button>
           <div className="flex items-center space-x-4">
              <button onClick={() => handleSave('draft')} className="text-slate-500 hover:text-blue-600 font-medium text-sm flex items-center">
                  <lucide_react_1.Save size={14} className="mr-1"/> Save Draft
              </button>
              <div className="text-sm font-medium text-slate-500 border-l pl-4 border-slate-300">
                Progress: {progress}%
              </div>
           </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
           <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <h2 className="text-2xl font-bold text-slate-800">{currentItem.name}</h2>
             <span className="text-xs font-mono text-slate-400">Room {currentRoomIndex + 1} of {inspectionData.items.length}</span>
           </div>

           <div className="p-6 flex-1 overflow-y-auto">
             <div className="mb-6">
               <label className="block text-sm font-medium text-slate-700 mb-3">Condition Rating</label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {[types_2.ConditionRating.GOOD, types_2.ConditionRating.FAIR, types_2.ConditionRating.POOR, types_2.ConditionRating.CRITICAL].map((rating) => (<button key={rating} onClick={() => updateItem(currentItem.id, { rating })} className={`
                       py-3 px-4 rounded-lg border text-sm font-semibold transition-all
                       ${currentItem.rating === rating
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'}
                     `}>
                     {rating}
                   </button>))}
               </div>
             </div>

             <div className="mb-6">
               <label className="block text-sm font-medium text-slate-700 mb-2">Observations / Defects</label>
               <textarea value={currentItem.notes} onChange={(e) => updateItem(currentItem.id, { notes: e.target.value })} placeholder={`Describe condition of ${currentItem.name.toLowerCase()}...`} className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"/>
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Photos</label>
                <div className="flex items-center space-x-4 flex-wrap gap-y-4">
                  <label className="cursor-pointer flex items-center justify-center w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 transition-colors">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, currentItem.id, currentItem.photos)}/>
                    <lucide_react_1.Camera className="text-slate-400"/>
                  </label>
                  {currentItem.photos.map((photo, i) => (<img key={i} src={photo} alt="evidence" className="w-24 h-24 object-cover rounded-lg border border-slate-200"/>))}
                </div>
             </div>
           </div>

           <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
             <button onClick={() => setCurrentRoomIndex(Math.max(0, currentRoomIndex - 1))} disabled={currentRoomIndex === 0} className="px-4 py-2 rounded text-slate-600 disabled:opacity-50">
               Previous
             </button>
             <button onClick={handleNextRoom} className="flex items-center px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
               {currentRoomIndex === inspectionData.items.length - 1 ? 'Finish Review' : 'Next Room'}
               <lucide_react_1.ChevronRight size={16} className="ml-2"/>
             </button>
           </div>
        </div>
      </div>);
    }
    return (<div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-200 mt-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-4">
          <lucide_react_1.CheckCircle size={32}/>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Inspection Complete</h2>
        <p className="text-slate-500">You have rated {inspectionData.items.filter(i => i.rating !== types_2.ConditionRating.NOT_INSPECTED).length} areas.</p>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg mb-6 max-h-60 overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Defect Summary</h3>
        {inspectionData.items.filter(i => i.rating === types_2.ConditionRating.POOR || i.rating === types_2.ConditionRating.CRITICAL).length === 0 ? (<p className="text-sm text-slate-500 italic">No major defects recorded.</p>) : (inspectionData.items.filter(i => i.rating === types_2.ConditionRating.POOR || i.rating === types_2.ConditionRating.CRITICAL).map(item => (<div key={item.id} className="flex items-start mb-2 last:mb-0">
               <lucide_react_1.AlertTriangle size={14} className="text-amber-500 mt-1 mr-2 flex-shrink-0"/>
               <div>
                 <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                 <p className="text-xs text-slate-600">{item.notes || 'No notes added.'}</p>
               </div>
            </div>)))}
      </div>

      <button onClick={() => handleSave('completed')} className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 flex justify-center items-center shadow-md transition-all">
        <lucide_react_1.Save className="mr-2"/>
        Lock & Save Inspection
      </button>
    </div>);
};
exports.InspectionRunner = InspectionRunner;
