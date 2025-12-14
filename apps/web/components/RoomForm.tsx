
import React, { useRef, useState } from 'react';
import { Room, InspectionItem, Photo } from '@/types';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { generateId } from '@/utils';

interface RoomFormProps {
  room: Room;
  onUpdate: (updatedRoom: Room) => void;
  onDelete: () => void;
}

const PhotoThumbnail: React.FC<{ photo: Photo; onRemove: () => void; }> = ({ photo, onRemove }) => {
  return (
    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
      <img src={photo.url} alt="Upload preview" className="w-full h-full object-cover" />
      <button 
        onClick={onRemove}
        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const RoomForm: React.FC<RoomFormProps> = ({ room, onUpdate, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const newPhotos: Photo[] = [];

      for (const file of files) {
        const base64Url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        newPhotos.push({ id: generateId(), url: base64Url, caption: '' });
      }

      onUpdate({ ...room, photos: [...(room.photos || []), ...newPhotos] });
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (photoId: string) => {
    onUpdate({ ...room, photos: (room.photos || []).filter(p => p.id !== photoId) });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-2">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Photos</h4>
          <div className="flex flex-wrap gap-2">
            {(room.photos || []).map(photo => (
              <PhotoThumbnail key={photo.id} photo={photo} onRemove={() => removePhoto(photo.id)} />
            ))}
            <label className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer">
              {isUploading ? <Loader2 className="animate-spin"/> : <Plus/>}
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Comments</label>
          <textarea
            value={room.overallComment}
            onChange={(e) => onUpdate({ ...room, overallComment: e.target.value })}
            className="w-full text-sm p-2 border border-gray-300 rounded min-h-[80px]"
            placeholder="Overall comments for the room..."
          />
        </div>
      </div>
    </div>
  );
};

export default RoomForm;
