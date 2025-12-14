import React, { useState } from 'react';
import type { RemoteInspectionRequest, RemoteInspectionStatus, ReportData, Room, InspectionItem, Property, ReportType } from '../types';
import { Plus, Send, Smartphone, Eye, Clock, CheckCircle, AlertTriangle, Loader2, Search, ArrowRight, X, Building, Link2 } from 'lucide-react';
import { generateId, getInitialItemsForRoom } from '../utils';

interface RemoteManagerProps {
  requests: RemoteInspectionRequest[];
  properties: Property[];
  onCreateRequest: (req: RemoteInspectionRequest) => void;
  onLaunchTenantView: (req: RemoteInspectionRequest) => void;
  onReviewRequest: (req: RemoteInspectionRequest) => void;
}

const RemoteManager: React.FC<RemoteManagerProps> = ({ requests, properties, onCreateRequest, onLaunchTenantView, onReviewRequest }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('Routine');
  const [customTenantName, setCustomTenantName] = useState('');
  const [customTenantEmail, setCustomTenantEmail] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    if (!selectedProperty) return;

    // Use property tenant details or overrides
    const tName = customTenantName || selectedProperty.tenantName || 'Tenant';
    const tEmail = customTenantEmail || selectedProperty.tenantEmail || '';

    // Define rooms: Prefer Property Specific Layout, fallback to defaults based on type
    let roomNames: string[] = [];
    
    if (selectedProperty.defaultRooms && selectedProperty.defaultRooms.length > 0) {
        // Use the custom layout defined in Property Manager
        roomNames = selectedProperty.defaultRooms;
    } else {
        // Fallback Logic
        if (selectedReportType === 'Entry' || selectedReportType === 'Exit') {
            roomNames = ['Entry', 'Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bathroom', 'Laundry', 'Exterior'];
        } else {
            // Routine
            roomNames = ['Living Areas', 'Kitchen', 'Bedrooms', 'Wet Areas (Bath/Laundry)', 'Exterior'];
        }
    }

    const initialRooms: Room[] = roomNames.map(name => ({
        id: generateId(),
        name,
        items: getInitialItemsForRoom(name).map(itemName => ({
            id: generateId(),
            name: itemName,
            isClean: true,
            isUndamaged: true,
            isWorking: true,
            comment: ''
        })),
        photos: [],
        overallComment: ''
    }));

    const newRequest: RemoteInspectionRequest = {
        id: generateId(),
        token: Math.random().toString(36).substring(7),
        propertyId: selectedProperty.id,
        propertyAddress: selectedProperty.address,
        tenantName: tName,
        tenantEmail: tEmail,
        status: 'SENT' as RemoteInspectionStatus,
        reportType: selectedReportType,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        data: {
            id: generateId(),
            type: selectedReportType,
            propertyAddress: selectedProperty.address,
            tenantName: tName,
            agentName: 'Remote Manager',
            agentCompany: 'Remote Business Partner',
            clientName: selectedProperty.ownerName,
            inspectionDate: new Date().toISOString().split('T')[0],
            rooms: initialRooms
        }
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
        case 'SENT':
            return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Send size={12} /> Sent</span>;
        case 'IN_PROGRESS':
            return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12} /> In Progress</span>;
        case 'SUBMITTED':
            return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Submitted</span>;
        case 'REVIEWED':
            return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Reviewed</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Remote Inspections</h1>
          <p className="text-gray-500">Send inspection links to tenants from your property list.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
        >
          <Plus size={20} /> New Request
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
         {/* Table Header */}
         <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
             <div className="col-span-4">Property / Tenant</div>
             <div className="col-span-2">Type</div>
             <div className="col-span-2">Status</div>
             <div className="col-span-2">Due Date</div>
             <div className="col-span-2 text-right">Actions</div>
         </div>

         {/* Table Body */}
         {requests.length === 0 ? (
             <div className="p-12 text-center text-gray-500">
                 <Smartphone size={48} className="mx-auto mb-4 text-gray-300" />
                 <p>No remote inspections active.</p>
                 {properties.length === 0 && <p className="text-sm mt-2 text-blue-500">Tip: Add properties in the Property Manager first.</p>}
             </div>
         ) : (
             requests.map(req => (
                 <div key={req.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
                     <div className="col-span-4">
                         <div className="font-bold text-gray-900">{req.propertyAddress}</div>
                         <div className="text-sm text-gray-500">{req.tenantName}</div>
                     </div>
                     <div className="col-span-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 font-medium">
                            {req.reportType}
                        </span>
                     </div>
                     <div className="col-span-2">
                         {getStatusBadge(req.status)}
                     </div>
                     <div className="col-span-2 text-sm text-gray-600">
                         {req.dueDate}
                     </div>
                     <div className="col-span-2 flex justify-end gap-2">
                         {/* Simulation Buttons */}
                         <button 
                             onClick={() => onLaunchTenantView(req)}
                             className="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 flex items-center gap-1 text-gray-600"
                             title="Simulate Tenant Link"
                         >
                             <Link2 size={12} /> Link
                         </button>

                         {req.status === 'SUBMITTED' ? (
                             <button 
                                onClick={() => onReviewRequest(req)}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1 rounded shadow-sm flex items-center gap-1"
                             >
                                <Eye size={12} /> Review
                             </button>
                         ) : (
                            <button className="text-gray-300 cursor-not-allowed text-xs font-bold px-3 py-1 flex items-center gap-1">
                                <Clock size={12} /> Waiting
                            </button>
                         )}
                     </div>
                 </div>
             ))
         )}
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-bold text-gray-900">Send Inspection Request</h2>
                   <button onClick={() => { setIsModalOpen(false); resetForm(); }}><X size={24} className="text-gray-400" /></button>
               </div>
               
               {properties.length === 0 ? (
                  <div className="text-center py-8">
                     <Building className="mx-auto text-gray-300 mb-2" size={40} />
                     <p className="text-gray-600 mb-4">You have no properties managed.</p>
                     <p className="text-sm text-gray-500">Please go to Property Manager and add a property first.</p>
                  </div>
               ) : (
                   <form onSubmit={handleCreate} className="space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
                           <select 
                             required
                             className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                             value={selectedPropertyId}
                             onChange={e => {
                                 setSelectedPropertyId(e.target.value);
                                 // Optional: Auto-fill custom fields if needed, but let's stick to overrides
                             }}
                           >
                               <option value="">-- Choose Property --</option>
                               {properties.map(p => (
                                   <option key={p.id} value={p.id}>{p.address} ({p.ownerName})</option>
                               ))}
                           </select>
                       </div>

                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
                           <select 
                             required
                             className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                             value={selectedReportType}
                             onChange={e => setSelectedReportType(e.target.value as ReportType)}
                           >
                               <option value="Routine">Routine Inspection</option>
                               <option value="Entry">Entry Condition Report</option>
                               <option value="Exit">Exit Condition Report</option>
                           </select>
                       </div>
                       
                       {/* Tenant Details Preview/Override */}
                       <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                           <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Tenant Details</h3>
                           {selectedPropertyId ? (
                               <div className="space-y-3">
                                   <div>
                                       <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                       <input 
                                         type="text" 
                                         className="w-full border border-gray-300 rounded p-2 text-sm"
                                         value={customTenantName}
                                         placeholder={properties.find(p => p.id === selectedPropertyId)?.tenantName || "No tenant on file"}
                                         onChange={e => setCustomTenantName(e.target.value)}
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                       <input 
                                         type="email" 
                                         className="w-full border border-gray-300 rounded p-2 text-sm"
                                         value={customTenantEmail}
                                         placeholder={properties.find(p => p.id === selectedPropertyId)?.tenantEmail || "No email on file"}
                                         onChange={e => setCustomTenantEmail(e.target.value)}
                                       />
                                   </div>
                               </div>
                           ) : (
                               <p className="text-xs text-gray-400 italic">Select a property to view/edit tenant details.</p>
                           )}
                       </div>
                       
                       {/* Room Preview */}
                       {selectedPropertyId && (
                           <div className="text-xs text-gray-500 mt-2">
                               {(() => {
                                   const p = properties.find(prop => prop.id === selectedPropertyId);
                                   if (p?.defaultRooms && p.defaultRooms.length > 0) {
                                       return <span className="text-blue-600 flex items-center gap-1"><CheckCircle size={10} /> Using property specific layout ({p.defaultRooms.length} areas).</span>
                                   }
                                   return <span className="text-gray-400 italic">Using standard {selectedReportType} template.</span>
                               })()}
                           </div>
                       )}

                       <div className="pt-4 flex justify-end gap-3">
                           <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                           <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Send Request</button>
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
