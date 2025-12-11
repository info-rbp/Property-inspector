import React, { useState, useEffect } from 'react';
import { ReportData, Room, ReportViewMode, InspectionItem, ReportType } from '../types';
import RoomForm from './RoomForm';
import PDFPreview from './PDFPreview';
import { generateId, getInitialItemsForRoom } from '../utils';
import { FileText, Printer, Plus, Eye, Edit2 } from 'lucide-react';

interface ConditionReportProps {
  reportType: ReportType;
}

const getInitialReport = (type: ReportType): ReportData => ({
  id: generateId(),
  type: type,
  propertyAddress: '',
  agentName: 'Admin Team',
  agentCompany: 'Remote Business Partner',
  clientName: '',
  inspectionDate: new Date().toISOString().split('T')[0],
  tenantName: '',
  rooms: []
});

const ConditionReport: React.FC<ConditionReportProps> = ({ reportType }) => {
  const [report, setReport] = useState<ReportData>(getInitialReport(reportType));
  const [viewMode, setViewMode] = useState<ReportViewMode>(ReportViewMode.EDIT);
  const [newRoomName, setNewRoomName] = useState('');

  // Handle document title for better "Save as PDF" filenames
  useEffect(() => {
    if (viewMode === ReportViewMode.PREVIEW) {
      document.title = report.propertyAddress 
        ? `${report.propertyAddress} - ${reportType} Condition Report` 
        : `${reportType} Condition Report`;
    } else {
      document.title = 'Remote Business Partner Property Reports';
    }
  }, [viewMode, report.propertyAddress, reportType]);

  const updateReport = (updates: Partial<ReportData>) => {
    setReport(prev => ({ ...prev, ...updates }));
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const itemNames = getInitialItemsForRoom(newRoomName);
    const initialItems: InspectionItem[] = itemNames.map(name => ({
      id: generateId(),
      name,
      isClean: true,
      isUndamaged: true,
      isWorking: true,
      comment: ''
    }));

    const newRoom: Room = {
      id: generateId(),
      name: newRoomName,
      items: initialItems,
      photos: [],
      overallComment: ''
    };

    setReport(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    setNewRoomName('');
  };

  const updateRoom = (updatedRoom: Room) => {
    setReport(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
    }));
  };

  const deleteRoom = (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setReport(prev => ({
        ...prev,
        rooms: prev.rooms.filter(r => r.id !== roomId)
      }));
    }
  };

  if (viewMode === ReportViewMode.PREVIEW) {
    return (
      <div className="fixed inset-0 z-[100] overflow-auto min-h-screen bg-gray-600 py-8 print:bg-white print:p-0 print:m-0 print:h-auto print:w-full">
        <div className="fixed top-4 right-4 flex gap-4 no-print z-50">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium"
          >
            <Printer size={20} /> Print / Save PDF
          </button>
          <button
            onClick={() => setViewMode(ReportViewMode.EDIT)}
            className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium"
          >
            <Edit2 size={20} /> Back to Edit
          </button>
        </div>
        <PDFPreview data={report} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FileText size={24} />
                </div>
                <div>
                <h1 className="text-2xl font-bold text-gray-900">New {reportType} Report</h1>
                <p className="text-gray-500">Fill in the details below to generate the {reportType} Condition Report.</p>
                </div>
            </div>
            <button 
                onClick={() => setViewMode(ReportViewMode.PREVIEW)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2 shadow-sm"
            >
                <Eye size={16} /> Preview Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
              <input
                type="text"
                value={report.propertyAddress}
                onChange={(e) => updateReport({ propertyAddress: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., 7 Riley St, Tuart Hill, WA 6060"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client / Landlord</label>
              <input
                type="text"
                value={report.clientName}
                onChange={(e) => updateReport({ clientName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="On behalf of..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspecting Agent</label>
              <input
                type="text"
                value={report.agentName}
                onChange={(e) => updateReport({ agentName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date</label>
              <input
                type="date"
                value={report.inspectionDate}
                onChange={(e) => updateReport({ inspectionDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name(s)</label>
              <input
                type="text"
                value={report.tenantName}
                onChange={(e) => updateReport({ tenantName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., John Doe"
              />
            </div>
          </div>
        </div>

        {/* Room Management */}
        <div className="mb-8">
           <h2 className="text-xl font-bold text-gray-900 mb-4">Rooms & Areas</h2>
           
           {report.rooms.length === 0 ? (
             <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl mb-6">
                <p className="text-gray-500 mb-2">No rooms added yet.</p>
                <p className="text-sm text-gray-400">Add a room like "Kitchen" or "Entry" to start.</p>
             </div>
           ) : (
             report.rooms.map(room => (
               <RoomForm 
                 key={room.id} 
                 room={room} 
                 onUpdate={updateRoom}
                 onDelete={() => deleteRoom(room.id)}
               />
             ))
           )}

           {/* Add Room Form */}
           <form onSubmit={handleAddRoom} className="bg-gray-100 p-4 rounded-lg flex gap-4 items-center border border-gray-200">
             <input
               type="text"
               value={newRoomName}
               onChange={(e) => setNewRoomName(e.target.value)}
               placeholder="Room Name (e.g. Master Bedroom)"
               className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
             <button 
               type="submit"
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
               disabled={!newRoomName.trim()}
             >
               <Plus size={20} /> Add Room
             </button>
           </form>
        </div>
    </div>
  );
};

export default ConditionReport;