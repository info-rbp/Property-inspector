
import React, { useState, useRef } from 'react';
import { RemoteInspectionRequest, Room, InspectionItem, Photo } from '../types';
import { Camera, Upload, Check, ChevronRight, ChevronLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { generateId, processImageFile } from '../utils';

interface TenantInspectionProps {
  request: RemoteInspectionRequest;
  onSubmit: (updatedData: RemoteInspectionRequest) => void;
}

const TenantInspection: React.FC<TenantInspectionProps> = ({ request, onSubmit }) => {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [localData, setLocalData] = useState<RemoteInspectionRequest>(request);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const currentRoom = localData.data.rooms[currentRoomIndex];
  const progress = ((currentRoomIndex) / localData.data.rooms.length) * 100;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId?: string, isRoomOverall?: boolean) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]; // Single file for simplicity in this demo
      
      try {
        const processedFile = await processImageFile(file);
        const newPhoto: Photo = {
          id: generateId(),
          file: processedFile,
          previewUrl: URL.createObjectURL(processedFile)
        };

        const updatedRooms = [...localData.data.rooms];
        const room = updatedRooms[currentRoomIndex];

        if (isRoomOverall) {
           room.photos = [...room.photos, newPhoto];
        } else if (itemId) {
           const itemIndex = room.items.findIndex(i => i.id === itemId);
           room.photos = [...room.photos, newPhoto];
        }

        setLocalData({
            ...localData,
            data: { ...localData.data, rooms: updatedRooms }
        });

      } catch (err) {
        console.error("Photo processing failed", err);
      }
    }
  };

  const updateItem = (itemId: string, field: keyof InspectionItem, value: any) => {
    const updatedRooms = [...localData.data.rooms];
    const item = updatedRooms[currentRoomIndex].items.find(i => i.id === itemId);
    if (item) {
        (item as any)[field] = value;
        setLocalData({
            ...localData,
            data: { ...localData.data, rooms: updatedRooms }
        });
    }
  };

  const handleSubmit = () => {
    if (confirm("Are you ready to submit your inspection report? You won't be able to edit it afterwards.")) {
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit({
                ...localData,
                status: 'SUBMITTED' as any
            });
            setIsSubmitting(false);
        }, 1500);
    }
  };

  const getReportTitle = () => {
      switch(request.reportType) {
          case 'Entry': return 'Entry Condition Report';
          case 'Exit': return 'Exit Condition Report';
          case 'Routine': return 'Routine Inspection';
          default: return 'Remote Inspection';
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Mobile Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center font-bold">RB</div>
            <div className="flex flex-col">
                <span className="font-semibold text-gray-900 text-sm leading-tight">{getReportTitle()}</span>
                <span className="text-[10px] text-gray-500 leading-tight">{request.propertyAddress}</span>
            </div>
        </div>
        <div className="text-xs font-medium text-gray-500">
           {currentRoomIndex + 1} / {localData.data.rooms.length} Areas
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 w-full">
         <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
         
         <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{currentRoom.name}</h1>
            <p className="text-gray-500 text-sm">Please inspect the items below and upload photos of the general area.</p>
         </div>

         {/* Room Photo Upload */}
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                <Camera size={16} className="text-blue-600"/> Room Overview Photos
            </h3>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
                {currentRoom.photos.map(photo => (
                    <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                        <img src={photo.previewUrl} className="w-full h-full object-cover" />
                    </div>
                ))}
                <label className="aspect-square bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
                    <Camera size={24} className="text-blue-500 mb-1" />
                    <span className="text-[10px] text-blue-600 font-bold uppercase">Add Photo</span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handlePhotoUpload(e, undefined, true)}
                    />
                </label>
            </div>
         </div>

         {/* Items List */}
         <div className="space-y-4 mb-8">
            {currentRoom.items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-gray-800">{item.name}</span>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => updateItem(item.id, 'isClean', !item.isClean)}
                                className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${item.isClean ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                             >
                                Clean
                             </button>
                             <button 
                                onClick={() => updateItem(item.id, 'isUndamaged', !item.isUndamaged)}
                                className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${item.isUndamaged ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                             >
                                Undamaged
                             </button>
                             <button 
                                onClick={() => updateItem(item.id, 'isWorking', !item.isWorking)}
                                className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${item.isWorking ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                             >
                                Working
                             </button>
                        </div>
                    </div>
                    
                    <textarea 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder={`Comments on ${item.name}...`}
                        value={item.comment}
                        onChange={(e) => updateItem(item.id, 'comment', e.target.value)}
                        rows={2}
                    />
                </div>
            ))}
         </div>

         {/* Navigation */}
         <div className="flex justify-between items-center pt-4 pb-8">
             <button 
                onClick={() => setCurrentRoomIndex(prev => Math.max(0, prev - 1))}
                disabled={currentRoomIndex === 0}
                className="flex items-center gap-1 text-gray-500 disabled:opacity-30 font-medium px-4 py-2"
             >
                <ChevronLeft size={20} /> Previous
             </button>

             {currentRoomIndex < localData.data.rooms.length - 1 ? (
                 <button 
                    onClick={() => setCurrentRoomIndex(prev => prev + 1)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95"
                 >
                    Next Area <ChevronRight size={20} />
                 </button>
             ) : (
                 <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 hover:bg-green-700 transition-transform active:scale-95"
                 >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                    Submit Inspection
                 </button>
             )}
         </div>

      </div>
    </div>
  );
};

export default TenantInspection;
