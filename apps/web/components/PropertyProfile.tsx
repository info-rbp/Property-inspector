
import React, { useState } from 'react';
import { Property, Inspection } from '@/types';
import { Building, BedDouble, Bath, Car, Calendar, MapPin, Edit3, Camera, Upload, Link as LinkIcon, Users, Key } from 'lucide-react';

interface PropertyProfileProps {
  property: Property;
  inspections: Inspection[];
  onStartInspection: () => void;
  onUpdateProperty: (updates: Partial<Property>) => void;
}

export const PropertyProfile: React.FC<PropertyProfileProps> = ({ property, inspections, onStartInspection, onUpdateProperty }) => {
  const [isEditingImage, setIsEditingImage] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onUpdateProperty({ thumbnailUrl: url });
      setIsEditingImage(false);
    }
  };

  const handleImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      onUpdateProperty({ thumbnailUrl: url });
      setIsEditingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="relative w-full h-64 bg-gray-200 group">
          <img 
            src={property.thumbnailUrl || 'https://via.placeholder.com/800x400?text=Property+Image'} 
            alt={property.address} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
             <button 
               onClick={() => setIsEditingImage(!isEditingImage)}
               className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center transition-all transform translate-y-2 group-hover:translate-y-0"
             >
               <Camera size={16} className="mr-2" />
               Change Photo
             </button>
          </div>
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.address}</h1>
          <div className="flex items-center text-gray-500 text-sm">
             <MapPin size={16} className="mr-1" />
             Property Details
          </div>
        </div>
      </div>

      {isEditingImage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setIsEditingImage(false)}>
          <div className="bg-white rounded-xl shadow-xl p-4 z-20 border border-gray-200 w-full max-w-sm" onClick={e => e.stopPropagation()}>
             <h4 className="text-sm font-bold text-gray-800 mb-3">Update Property Photo</h4>
             <div className="space-y-2">
               <label className="flex items-center justify-center w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 text-sm font-medium transition-colors">
                  <Upload size={16} className="mr-2" />
                  Upload File
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
               </label>
               <button 
                 onClick={handleImageUrl}
                 className="flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
               >
                  <LinkIcon size={16} className="mr-2" />
                  Paste URL
               </button>
             </div>
             <button onClick={() => setIsEditingImage(false)} className="mt-3 text-xs text-gray-400 hover:text-gray-600 w-full text-center">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="flex items-center font-bold text-gray-800 mb-6">
             <Users className="mr-2" size={20} /> Tenant & Owner
          </h3>
          <div className="space-y-4">
            <EditableField label="Tenant Name" value={property.tenantName} onSave={(val) => onUpdateProperty({ tenantName: val })} />
            <EditableField label="Tenant Email" value={property.tenantEmail} onSave={(val) => onUpdateProperty({ tenantEmail: val })} />
            <EditableField label="Owner Name" value={property.ownerName} onSave={(val) => onUpdateProperty({ ownerName: val })} />
          </div>
        </div>

        {/* Default Rooms */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="flex items-center font-bold text-gray-800 mb-6">
            <Key className="mr-2" size={20} /> Default Rooms
          </h3>
          <div className="space-y-2">
            {property.defaultRooms.map((room, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded-md text-sm">{room}</div>
            ))}
            {property.defaultRooms.length === 0 && <p className='text-gray-400'>No rooms defined</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditableFieldProps {
    label: string;
    value: string;
    onSave: (value: string) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, onSave }) => {
    return (
        <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1 flex justify-between items-center">
                {label}
                <button 
                    onClick={() => {
                        const newValue = prompt(`Update ${label}`, value);
                        if (newValue !== null && newValue.trim() !== '') onSave(newValue);
                    }}
                    className="text-gray-400 hover:text-blue-600"
                >
                    <Edit3 size={14} />
                </button>
            </div>
            <div className="text-lg font-medium text-gray-800">{value}</div>
        </div>
    )
}
