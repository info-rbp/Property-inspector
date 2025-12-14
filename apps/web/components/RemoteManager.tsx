
import React, { useState } from 'react';
import type { RemoteInspectionRequest, Property, ReportType, Room } from '@/types';
import { RemoteInspectionStatus } from '@/types';
import { Plus, Send, Clock, CheckCircle, X, Building } from 'lucide-react';
import { generateId } from '@/utils';

interface RemoteManagerProps {
  requests: RemoteInspectionRequest[];
  properties: Property[];
  onCreateRequest: (req: RemoteInspectionRequest) => void;
}

const RemoteManager: React.FC<RemoteManagerProps> = ({ requests, properties, onCreateRequest }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('Routine');
  const [customTenantName, setCustomTenantName] = useState('');
  const [customTenantEmail, setCustomTenantEmail] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    if (!selectedProperty) return;

    const tName = customTenantName || selectedProperty.tenantName || 'Tenant';
    const tEmail = customTenantEmail || selectedProperty.tenantEmail || '';

    const roomNames = selectedProperty.defaultRooms || ['Living Room', 'Kitchen', 'Master Bedroom'];
    const initialRooms: Room[] = roomNames.map(name => ({
        id: generateId(),
        name,
        items: [],
        photos: [],
        overallComment: ''
    }));

    const newRequest: RemoteInspectionRequest = {
        id: generateId(),
        propertyId: selectedProperty.id,
        propertyAddress: selectedProperty.address,
        status: RemoteInspectionStatus.SENT,
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

  const getStatusBadge = (status: RemoteInspectionStatus) => {
    switch (status) {
        case RemoteInspectionStatus.SENT:
            return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Send size={12} /> Sent</span>;
        case RemoteInspectionStatus.IN_PROGRESS:
            return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12} /> In Progress</span>;
        case RemoteInspectionStatus.SUBMITTED:
        case RemoteInspectionStatus.REVIEWED: // Added REVIEWED here
            return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Completed</span>;
        default:
          return null
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Remote Inspections</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus size={20} /> New Request
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
             return (
                 <div key={req.id} className="grid grid-cols-12 p-4 border-b items-center">
                     <div className="col-span-5">
                         <div className="font-bold text-gray-900">{prop?.address}</div>
                         <div className="text-sm text-gray-500">{req.tenantName}</div>
                     </div>
                     <div className="col-span-2">{getStatusBadge(req.status)}</div>
                     <div className="col-span-2 text-sm text-gray-600">{req.inspectionDate.toLocaleDateString()}</div>
                     <div className="col-span-3 flex justify-end gap-2"></div>
                 </div>
             )
         })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
               <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-gray-900">Send Inspection Request</h2>
                   <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
               </div>
               
               {properties.length === 0 ? (
                  <div className="text-center py-8">
                     <Building className="mx-auto text-gray-300 mb-2" size={40} />
                     <p>You have no properties managed.</p>
                  </div>
               ) : (
                   <form onSubmit={handleCreate} className="space-y-4">
                       <select required className="w-full border border-gray-300 rounded-lg p-2.5" value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}>
                           <option value="">-- Choose Property --</option>
                           {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                       </select>
                       <div className="pt-4 flex justify-end gap-3">
                           <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 rounded-lg">Cancel</button>
                           <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Send Request</button>
                       </div>
                   </form>
               )}
           </div>
        </div>
      )}
    </div>
  );
};

export default RemoteManager;
