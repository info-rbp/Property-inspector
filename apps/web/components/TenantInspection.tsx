
import React, { useState } from 'react';
import { RemoteInspectionRequest, Room, InspectionItem, Photo, RemoteInspectionStatus } from '@/types';
import { Camera, Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { generateId } from '@/utils';

interface TenantInspectionProps {
  request: RemoteInspectionRequest;
  onSubmit: (updatedData: RemoteInspectionRequest) => void;
}

const TenantInspection: React.FC<TenantInspectionProps> = ({ request, onSubmit }) => {
  const [localData, setLocalData] = useState<RemoteInspectionRequest>(request);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentRoom = localData.rooms[currentRoomIndex];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
      const newPhoto: Photo = { id: generateId(), url: base64Url, caption: '' };

      const updatedRooms = [...localData.rooms];
      updatedRooms[currentRoomIndex].photos.push(newPhoto);
      setLocalData({ ...localData, rooms: updatedRooms });
    }
  };

  const updateItem = (itemId: string, updates: Partial<InspectionItem>) => {
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
        onSubmit({ ...localData, status: RemoteInspectionStatus.SUBMITTED });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Camera/>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
            </label>
          </div>
        </div>

        {currentRoom.items.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-lg mb-2 shadow-sm">
                <p className="font-semibold">{item.name}</p>
                <textarea value={item.comment} onChange={e => updateItem(item.id, {comment: e.target.value})} className="w-full border rounded p-1 mt-1"/>
            </div>
        ))}

        <div className="flex justify-between mt-4">
            <button onClick={() => setCurrentRoomIndex(p => p - 1)} disabled={currentRoomIndex === 0}><ChevronLeft/> Prev</button>
            {currentRoomIndex < localData.rooms.length - 1 ? 
                <button onClick={() => setCurrentRoomIndex(p => p + 1)}>Next <ChevronRight/></button> : 
                <button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? <Loader2/> : 'Submit'}</button>}
        </div>
      </div>
    </div>
  );
};

export default TenantInspection;
