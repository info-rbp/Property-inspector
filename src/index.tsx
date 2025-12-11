import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { GoogleGenerativeAI } from '@google/generative-ai'

type Bindings = {
  GEMINI_API_KEY: string
  KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors())

// The full React application HTML
const APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remote Business Partner - Property Inspection Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        @media print {
            @page { 
                size: A4; 
                margin: 0;
            }
            body * {
                visibility: hidden;
            }
            .print-area, .print-area * {
                visibility: visible;
            }
            .print-area {
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
            }
            .no-print {
                display: none !important;
            }
            .print\\\\:block {
                display: block !important;
            }
            .print\\\\:p-8 {
                padding: 2rem !important;
            }
            .print\\\\:bg-white {
                background-color: white !important;
            }
            .page-break {
                page-break-after: always;
            }
        }
        
        .animate-in {
            animation: fade-in 0.3s ease-out;
        }
        
        @keyframes fade-in {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- Babel Standalone for JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- IndexedDB for local storage -->
    <script src="https://unpkg.com/idb@7.1.1/build/umd.js"></script>
    
    <!-- PDF Generation -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

    <script type="text/babel">
        const { useState, useEffect, useRef, useCallback } = React;
        
        // Utility functions
        const generateId = () => Math.random().toString(36).substr(2, 9);
        
        const ROOM_TYPES = [
            'Living Room', 'Kitchen', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3', 
            'Bathroom', 'Ensuite', 'Laundry', 'Garage', 'Hallway', 'Study',
            'Dining Room', 'Powder Room', 'Pantry', 'Front Yard', 'Back Yard',
            'Balcony', 'Patio', 'Pool Area', 'Storage Room'
        ];

        const getInitialItemsForRoom = (roomType) => {
            const baseItems = ['Walls', 'Ceiling', 'Flooring', 'Windows', 'Light Fittings', 'Power Points'];
            
            const roomSpecificItems = {
                'Kitchen': ['Oven/Stove', 'Range Hood', 'Dishwasher', 'Sink/Taps', 'Benchtops', 'Cupboards/Drawers', 'Splashback'],
                'Bathroom': ['Shower', 'Bath', 'Basin/Taps', 'Toilet', 'Mirror', 'Towel Rail', 'Exhaust Fan'],
                'Ensuite': ['Shower', 'Basin/Taps', 'Toilet', 'Mirror', 'Towel Rail', 'Exhaust Fan'],
                'Laundry': ['Tub/Sink', 'Taps', 'Washing Machine Taps', 'Dryer Vent'],
                'Garage': ['Garage Door', 'Remote Controls', 'Shelving'],
                'Pool Area': ['Pool', 'Pool Fence', 'Pool Equipment', 'Pool Gate'],
            };
            
            return [...baseItems, ...(roomSpecificItems[roomType] || [])];
        };

        // Storage Service
        const storageService = {
            async saveReport(report) {
                try {
                    const response = await fetch('/api/reports/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(report)
                    });
                    return await response.json();
                } catch (error) {
                    console.error('Error saving report:', error);
                    throw error;
                }
            },
            
            async loadReports() {
                try {
                    const response = await fetch('/api/reports');
                    return await response.json();
                } catch (error) {
                    console.error('Error loading reports:', error);
                    return [];
                }
            },
            
            async deleteReport(id) {
                try {
                    const response = await fetch(\`/api/reports/\${id}\`, { method: 'DELETE' });
                    return await response.json();
                } catch (error) {
                    console.error('Error deleting report:', error);
                    throw error;
                }
            }
        };

        // Gemini Service
        const geminiService = {
            async analyzeImage(base64Image, roomType, existingComment = '') {
                try {
                    const response = await fetch('/api/gemini/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: base64Image,
                            roomType,
                            existingComment
                        })
                    });
                    return await response.json();
                } catch (error) {
                    console.error('Error analyzing image:', error);
                    throw error;
                }
            }
        };

        // Components
        const RoomForm = ({ room, onUpdate, onDelete }) => {
            const [isAnalyzing, setIsAnalyzing] = useState(false);
            const [showAddItem, setShowAddItem] = useState(false);
            const [newItemName, setNewItemName] = useState('');
            
            const handlePhotoUpload = async (e) => {
                const files = Array.from(e.target.files);
                const newPhotos = [];
                
                for (const file of files) {
                    const reader = new FileReader();
                    const base64 = await new Promise(resolve => {
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                    
                    newPhotos.push({
                        id: generateId(),
                        url: base64,
                        caption: ''
                    });
                }
                
                const updatedRoom = {
                    ...room,
                    photos: [...room.photos, ...newPhotos]
                };
                onUpdate(updatedRoom);
                
                // Auto-analyze first photo if it's new
                if (newPhotos.length > 0 && room.photos.length === 0) {
                    await analyzePhotos(updatedRoom);
                }
            };
            
            const analyzePhotos = async (roomToAnalyze = room) => {
                if (roomToAnalyze.photos.length === 0) return;
                
                setIsAnalyzing(true);
                try {
                    const result = await geminiService.analyzeImage(
                        roomToAnalyze.photos[0].url,
                        roomToAnalyze.name,
                        roomToAnalyze.overallComment
                    );
                    
                    if (result.success) {
                        const updatedRoom = {
                            ...roomToAnalyze,
                            overallComment: result.overallComment || roomToAnalyze.overallComment,
                            items: roomToAnalyze.items.map(item => {
                                const itemData = result.items?.[item.name];
                                if (itemData) {
                                    return {
                                        ...item,
                                        isClean: itemData.isClean !== undefined ? itemData.isClean : item.isClean,
                                        isUndamaged: itemData.isUndamaged !== undefined ? itemData.isUndamaged : item.isUndamaged,
                                        isWorking: itemData.isWorking !== undefined ? itemData.isWorking : item.isWorking,
                                        comment: itemData.comment || item.comment
                                    };
                                }
                                return item;
                            })
                        };
                        onUpdate(updatedRoom);
                    }
                } catch (error) {
                    console.error('Analysis failed:', error);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            
            const updateItem = (itemId, updates) => {
                const updatedRoom = {
                    ...room,
                    items: room.items.map(item => 
                        item.id === itemId ? { ...item, ...updates } : item
                    )
                };
                onUpdate(updatedRoom);
            };
            
            const deleteItem = (itemId) => {
                const updatedRoom = {
                    ...room,
                    items: room.items.filter(item => item.id !== itemId)
                };
                onUpdate(updatedRoom);
            };
            
            const addNewItem = () => {
                if (!newItemName.trim()) return;
                
                const newItem = {
                    id: generateId(),
                    name: newItemName,
                    isClean: true,
                    isUndamaged: true,
                    isWorking: true,
                    comment: ''
                };
                
                const updatedRoom = {
                    ...room,
                    items: [...room.items, newItem]
                };
                onUpdate(updatedRoom);
                setNewItemName('');
                setShowAddItem(false);
            };
            
            const removePhoto = (photoId) => {
                const updatedRoom = {
                    ...room,
                    photos: room.photos.filter(p => p.id !== photoId)
                };
                onUpdate(updatedRoom);
            };
            
            const updatePhotoCaption = (photoId, caption) => {
                const updatedRoom = {
                    ...room,
                    photos: room.photos.map(p => 
                        p.id === photoId ? { ...p, caption } : p
                    )
                };
                onUpdate(updatedRoom);
            };
            
            return (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
                        <button
                            onClick={onDelete}
                            className="text-red-500 hover:text-red-700"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    {/* Photo Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photos
                        </label>
                        <div className="flex flex-wrap gap-4">
                            {room.photos.map(photo => (
                                <div key={photo.id} className="relative">
                                    <img 
                                        src={photo.url} 
                                        alt={room.name}
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => removePhoto(photo.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                </div>
                            ))}
                            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                                <div className="text-center">
                                    <i className="fas fa-plus text-gray-400 text-2xl"></i>
                                    <p className="text-xs text-gray-500 mt-1">Add Photo</p>
                                </div>
                            </label>
                        </div>
                        
                        {room.photos.length > 0 && (
                            <button
                                onClick={() => analyzePhotos()}
                                disabled={isAnalyzing}
                                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                {isAnalyzing ? (
                                    <><i className="fas fa-spinner fa-spin mr-2"></i>Analyzing...</>
                                ) : (
                                    <><i className="fas fa-magic mr-2"></i>AI Analysis</>
                                )}
                            </button>
                        )}
                    </div>
                    
                    {/* Items Checklist */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Items Checklist
                            </label>
                            <button
                                onClick={() => setShowAddItem(!showAddItem)}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                                <i className="fas fa-plus mr-1"></i> Add Item
                            </button>
                        </div>
                        
                        {showAddItem && (
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Item name"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <button
                                    onClick={addNewItem}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                        
                        <div className="space-y-3">
                            {room.items.map(item => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">{item.name}</span>
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-4 mb-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={item.isClean}
                                                onChange={(e) => updateItem(item.id, { isClean: e.target.checked })}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Clean</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={item.isUndamaged}
                                                onChange={(e) => updateItem(item.id, { isUndamaged: e.target.checked })}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Undamaged</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={item.isWorking}
                                                onChange={(e) => updateItem(item.id, { isWorking: e.target.checked })}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Working</span>
                                        </label>
                                    </div>
                                    
                                    <input
                                        type="text"
                                        value={item.comment}
                                        onChange={(e) => updateItem(item.id, { comment: e.target.value })}
                                        placeholder="Additional comments..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Overall Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Overall Room Comment
                        </label>
                        <textarea
                            value={room.overallComment}
                            onChange={(e) => onUpdate({ ...room, overallComment: e.target.value })}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="General observations about the room..."
                        />
                    </div>
                </div>
            );
        };

        const ConditionReport = ({ reportType }) => {
            const [report, setReport] = useState({
                id: generateId(),
                type: reportType,
                propertyAddress: '',
                agentName: 'Admin Team',
                agentCompany: 'Remote Business Partner',
                clientName: '',
                tenantName: '',
                inspectionDate: new Date().toISOString().split('T')[0],
                rooms: []
            });
            const [viewMode, setViewMode] = useState('edit');
            const [newRoomName, setNewRoomName] = useState('');
            const [savedReports, setSavedReports] = useState([]);
            const [showLoadDialog, setShowLoadDialog] = useState(false);
            
            useEffect(() => {
                loadSavedReports();
            }, []);
            
            const loadSavedReports = async () => {
                const reports = await storageService.loadReports();
                setSavedReports(reports.filter(r => r.type === reportType));
            };
            
            const saveReport = async () => {
                try {
                    await storageService.saveReport(report);
                    alert('Report saved successfully!');
                    loadSavedReports();
                } catch (error) {
                    alert('Failed to save report');
                }
            };
            
            const loadReport = (reportToLoad) => {
                setReport(reportToLoad);
                setShowLoadDialog(false);
            };
            
            const handleAddRoom = (e) => {
                e.preventDefault();
                if (!newRoomName.trim()) return;
                
                const itemNames = getInitialItemsForRoom(newRoomName);
                const initialItems = itemNames.map(name => ({
                    id: generateId(),
                    name,
                    isClean: true,
                    isUndamaged: true,
                    isWorking: true,
                    comment: ''
                }));
                
                const newRoom = {
                    id: generateId(),
                    name: newRoomName,
                    items: initialItems,
                    photos: [],
                    overallComment: ''
                };
                
                setReport(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
                setNewRoomName('');
            };
            
            const updateRoom = (updatedRoom) => {
                setReport(prev => ({
                    ...prev,
                    rooms: prev.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
                }));
            };
            
            const deleteRoom = (roomId) => {
                if (confirm('Are you sure you want to delete this room?')) {
                    setReport(prev => ({
                        ...prev,
                        rooms: prev.rooms.filter(r => r.id !== roomId)
                    }));
                }
            };
            
            if (viewMode === 'preview') {
                return (
                    <div className="fixed inset-0 z-50 overflow-auto bg-gray-600 py-8 print:bg-white print:p-0">
                        <div className="fixed top-4 right-4 flex gap-4 no-print">
                            <button
                                onClick={() => window.print()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
                            >
                                <i className="fas fa-print mr-2"></i> Print / Save PDF
                            </button>
                            <button
                                onClick={() => setViewMode('edit')}
                                className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg"
                            >
                                <i className="fas fa-arrow-left mr-2"></i> Back to Edit
                            </button>
                        </div>
                        
                        <div className="max-w-4xl mx-auto bg-white p-8 shadow-2xl print-area print:shadow-none">
                            <PDFPreview report={report} />
                        </div>
                    </div>
                );
            }
            
            return (
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">
                            {reportType} Condition Report
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={report.propertyAddress}
                                    onChange={(e) => setReport(prev => ({ ...prev, propertyAddress: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="123 Main St, Suburb, State"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {reportType === 'Entry' ? 'Tenant Name' : 'Current Tenant'}
                                </label>
                                <input
                                    type="text"
                                    value={report.tenantName}
                                    onChange={(e) => setReport(prev => ({ ...prev, tenantName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="John Smith"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Owner/Landlord
                                </label>
                                <input
                                    type="text"
                                    value={report.clientName}
                                    onChange={(e) => setReport(prev => ({ ...prev, clientName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Property Owner Name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Inspection Date
                                </label>
                                <input
                                    type="date"
                                    value={report.inspectionDate}
                                    onChange={(e) => setReport(prev => ({ ...prev, inspectionDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={saveReport}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                            >
                                <i className="fas fa-save mr-2"></i> Save Report
                            </button>
                            <button
                                onClick={() => setShowLoadDialog(true)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                                <i className="fas fa-folder-open mr-2"></i> Load Report
                            </button>
                            <button
                                onClick={() => setViewMode('preview')}
                                disabled={!report.propertyAddress}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                <i className="fas fa-eye mr-2"></i> Preview
                            </button>
                        </div>
                    </div>
                    
                    {/* Add Room Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-bold mb-4">Add Room</h3>
                        <form onSubmit={handleAddRoom} className="flex gap-4">
                            <select
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">Select a room type...</option>
                                {ROOM_TYPES.map(room => (
                                    <option key={room} value={room}>{room}</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={!newRoomName}
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                <i className="fas fa-plus mr-2"></i> Add Room
                            </button>
                        </form>
                    </div>
                    
                    {/* Rooms List */}
                    {report.rooms.map(room => (
                        <RoomForm
                            key={room.id}
                            room={room}
                            onUpdate={updateRoom}
                            onDelete={() => deleteRoom(room.id)}
                        />
                    ))}
                    
                    {/* Load Dialog */}
                    {showLoadDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                                <h3 className="text-lg font-bold mb-4">Load {reportType} Report</h3>
                                {savedReports.length === 0 ? (
                                    <p className="text-gray-500">No saved reports found.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {savedReports.map(savedReport => (
                                            <div
                                                key={savedReport.id}
                                                onClick={() => loadReport(savedReport)}
                                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <div className="font-medium">{savedReport.propertyAddress}</div>
                                                <div className="text-sm text-gray-500">
                                                    {savedReport.tenantName} • {savedReport.inspectionDate}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowLoadDialog(false)}
                                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const PDFPreview = ({ report }) => {
            const getStatusBadge = (item) => {
                if (!item.isClean || !item.isUndamaged || !item.isWorking) {
                    return <span className="text-red-600 font-medium">Attention Required</span>;
                }
                return <span className="text-green-600">Good Condition</span>;
            };
            
            return (
                <div className="bg-white">
                    {/* Header */}
                    <div className="border-b-2 border-gray-800 pb-4 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {report.type} Condition Report
                                </h1>
                                <p className="text-gray-600 mt-2">{report.propertyAddress}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">{report.agentCompany}</p>
                                <p className="text-sm text-gray-600">{report.agentName}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div>
                            <span className="font-semibold">Owner/Landlord:</span> {report.clientName || 'Not specified'}
                        </div>
                        <div>
                            <span className="font-semibold">Tenant:</span> {report.tenantName || 'Not specified'}
                        </div>
                        <div>
                            <span className="font-semibold">Inspection Date:</span> {report.inspectionDate}
                        </div>
                        <div>
                            <span className="font-semibold">Report Type:</span> {report.type} Inspection
                        </div>
                    </div>
                    
                    {/* Rooms */}
                    {report.rooms.map((room, idx) => (
                        <div key={room.id} className={idx > 0 ? 'page-break' : ''}>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                                    {room.name}
                                </h2>
                                
                                {/* Photos */}
                                {room.photos.length > 0 && (
                                    <div className="mb-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            {room.photos.slice(0, 6).map(photo => (
                                                <div key={photo.id}>
                                                    <img 
                                                        src={photo.url} 
                                                        alt={room.name}
                                                        className="w-full h-32 object-cover rounded"
                                                    />
                                                    {photo.caption && (
                                                        <p className="text-xs text-gray-600 mt-1">{photo.caption}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Items */}
                                <div className="mb-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2">Item</th>
                                                <th className="text-center py-2">Clean</th>
                                                <th className="text-center py-2">Undamaged</th>
                                                <th className="text-center py-2">Working</th>
                                                <th className="text-left py-2">Comment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {room.items.map(item => (
                                                <tr key={item.id} className="border-b">
                                                    <td className="py-2 font-medium">{item.name}</td>
                                                    <td className="text-center py-2">
                                                        {item.isClean ? '✓' : '✗'}
                                                    </td>
                                                    <td className="text-center py-2">
                                                        {item.isUndamaged ? '✓' : '✗'}
                                                    </td>
                                                    <td className="text-center py-2">
                                                        {item.isWorking ? '✓' : '✗'}
                                                    </td>
                                                    <td className="py-2 text-gray-600">{item.comment}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Overall Comment */}
                                {room.overallComment && (
                                    <div className="bg-gray-50 p-4 rounded">
                                        <h4 className="font-semibold mb-2">Overall Room Condition:</h4>
                                        <p className="text-gray-700">{room.overallComment}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t-2 border-gray-800">
                        <p className="text-sm text-gray-600 text-center">
                            This report was generated on {new Date().toLocaleDateString()} by {report.agentCompany}
                        </p>
                    </div>
                </div>
            );
        };

        // Main App Component
        const App = () => {
            const [activeTool, setActiveTool] = useState('dashboard');
            const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
            
            const NavButton = ({ tool, icon, label }) => (
                <button 
                    onClick={() => { setActiveTool(tool); setIsMobileMenuOpen(false); }}
                    className={\`text-sm font-medium transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg \${
                        activeTool === tool ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }\`}
                >
                    <i className={\`\${icon}\`}></i>
                    {label}
                </button>
            );
            
            const getActiveComponent = () => {
                switch (activeTool) {
                    case 'entry-report':
                        return <ConditionReport key="entry" reportType="Entry" />;
                    case 'routine-inspection':
                        return <ConditionReport key="routine" reportType="Routine" />;
                    case 'exit-inspection':
                        return <ConditionReport key="exit" reportType="Exit" />;
                    default:
                        return null;
                }
            };
            
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    {/* Top Navigation */}
                    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16 items-center">
                                {/* Logo */}
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTool('dashboard')}>
                                    <div className="w-9 h-9 bg-blue-800 rounded-lg text-white flex items-center justify-center font-bold text-lg">
                                        RB
                                    </div>
                                    <span className="font-bold text-xl text-gray-900">Remote Business Partner</span>
                                </div>
                                
                                {/* Desktop Navigation */}
                                <nav className="hidden md:flex items-center gap-2">
                                    <NavButton tool="dashboard" icon="fas fa-home" label="Dashboard" />
                                    <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                    <NavButton tool="entry-report" icon="fas fa-file-alt" label="Entry Report" />
                                    <NavButton tool="routine-inspection" icon="fas fa-clipboard-check" label="Routine" />
                                    <NavButton tool="exit-inspection" icon="fas fa-sign-out-alt" label="Exit" />
                                </nav>
                                
                                {/* Mobile Menu Toggle */}
                                <button 
                                    className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    <i className={\`fas \${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}\`}></i>
                                </button>
                            </div>
                        </div>
                        
                        {/* Mobile Menu */}
                        {isMobileMenuOpen && (
                            <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
                                <div className="flex flex-col gap-2">
                                    <NavButton tool="dashboard" icon="fas fa-home" label="Dashboard" />
                                    <NavButton tool="entry-report" icon="fas fa-file-alt" label="Entry Report" />
                                    <NavButton tool="routine-inspection" icon="fas fa-clipboard-check" label="Routine Inspection" />
                                    <NavButton tool="exit-inspection" icon="fas fa-sign-out-alt" label="Exit Inspection" />
                                </div>
                            </div>
                        )}
                    </header>
                    
                    {/* Main Content */}
                    <main className="flex-1">
                        {activeTool === 'dashboard' ? (
                            <div className="max-w-7xl mx-auto px-4 py-10 animate-in">
                                <div className="mb-10 text-center md:text-left">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Inspection Platform</h1>
                                    <p className="text-gray-500">Select an inspection type to get started.</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div 
                                        onClick={() => setActiveTool('entry-report')}
                                        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                                    >
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                            <i className="fas fa-file-alt text-2xl"></i>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Entry Condition Report</h3>
                                        <p className="text-gray-500 text-sm mb-4">
                                            Document property condition at tenant move-in with photos and AI assistance.
                                        </p>
                                        <div className="flex items-center text-blue-600 text-sm font-semibold">
                                            Start Report <i className="fas fa-arrow-right ml-2"></i>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        onClick={() => setActiveTool('routine-inspection')}
                                        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer"
                                    >
                                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                                            <i className="fas fa-clipboard-check text-2xl"></i>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Routine Inspection</h3>
                                        <p className="text-gray-500 text-sm mb-4">
                                            Conduct periodic property inspections with streamlined reporting.
                                        </p>
                                        <div className="flex items-center text-green-600 text-sm font-semibold">
                                            Start Inspection <i className="fas fa-arrow-right ml-2"></i>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        onClick={() => setActiveTool('exit-inspection')}
                                        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer"
                                    >
                                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                                            <i className="fas fa-sign-out-alt text-2xl"></i>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Exit Inspection</h3>
                                        <p className="text-gray-500 text-sm mb-4">
                                            Final inspection at tenant move-out to assess condition and damages.
                                        </p>
                                        <div className="flex items-center text-orange-600 text-sm font-semibold">
                                            Start Exit Report <i className="fas fa-arrow-right ml-2"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            getActiveComponent()
                        )}
                    </main>
                </div>
            );
        };
        
        // Render the app
        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>`;

// Initialize Gemini AI with hardcoded API key for development
const GEMINI_API_KEY = 'AIzaSyB1eta3AGLBi5exnNLV3HbqBVRm1bCl3gs';
let genAI: GoogleGenerativeAI | null = null;

// Initialize Gemini when needed
const getGenAI = (apiKey: string) => {
  if (!genAI || apiKey !== GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', service: 'inspection-platform' });
});

// Save report
app.post('/api/reports/save', async (c) => {
  try {
    const report = await c.req.json();
    const { KV } = c.env;
    
    const key = `report:${report.id}`;
    await KV.put(key, JSON.stringify(report));
    
    // Update report list
    const listKey = 'reports:list';
    const existingList = await KV.get(listKey);
    const reports = existingList ? JSON.parse(existingList) : [];
    
    const existingIndex = reports.findIndex((r: any) => r.id === report.id);
    if (existingIndex >= 0) {
      reports[existingIndex] = {
        id: report.id,
        propertyAddress: report.propertyAddress,
        type: report.type,
        tenantName: report.tenantName,
        inspectionDate: report.inspectionDate
      };
    } else {
      reports.push({
        id: report.id,
        propertyAddress: report.propertyAddress,
        type: report.type,
        tenantName: report.tenantName,
        inspectionDate: report.inspectionDate
      });
    }
    
    await KV.put(listKey, JSON.stringify(reports));
    
    return c.json({ success: true, id: report.id });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Load all reports
app.get('/api/reports', async (c) => {
  try {
    const { KV } = c.env;
    const listKey = 'reports:list';
    const existingList = await KV.get(listKey);
    const reports = existingList ? JSON.parse(existingList) : [];
    
    // Fetch full report data
    const fullReports = await Promise.all(
      reports.map(async (meta: any) => {
        const reportData = await KV.get(`report:${meta.id}`);
        return reportData ? JSON.parse(reportData) : meta;
      })
    );
    
    return c.json(fullReports);
  } catch (error) {
    return c.json([]);
  }
});

// Delete report
app.delete('/api/reports/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { KV } = c.env;
    
    // Delete report data
    await KV.delete(`report:${id}`);
    
    // Update list
    const listKey = 'reports:list';
    const existingList = await KV.get(listKey);
    const reports = existingList ? JSON.parse(existingList) : [];
    const filtered = reports.filter((r: any) => r.id !== id);
    await KV.put(listKey, JSON.stringify(filtered));
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Gemini AI Analysis Endpoint
app.post('/api/gemini/analyze', async (c) => {
  try {
    const { image, roomType, existingComment } = await c.req.json();
    
    // Use hardcoded API key if environment variable not set
    const apiKey = c.env.GEMINI_API_KEY || GEMINI_API_KEY;
    const ai = getGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Remove data URL prefix
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const prompt = `You are a professional property inspector conducting a ${roomType} inspection.
    
Analyze this photo and provide:
1. Overall room condition (2-3 sentences)
2. For each standard item, assess:
   - Walls: Clean/Undamaged/Working status and any issues
   - Ceiling: Clean/Undamaged/Working status and any issues
   - Flooring: Clean/Undamaged/Working status and any issues
   - Windows: Clean/Undamaged/Working status and any issues
   - Light Fittings: Clean/Undamaged/Working status and any issues
   - Power Points: Clean/Undamaged/Working status and any issues

Focus on visible defects, damage, or maintenance issues. Be concise and professional.
Use Australian English spelling (e.g., colour not color).

Return response in this JSON format:
{
  "overallComment": "Overall room assessment here",
  "items": {
    "Walls": {
      "isClean": true/false,
      "isUndamaged": true/false, 
      "isWorking": true/false,
      "comment": "Specific observations"
    },
    "Ceiling": { ... },
    "Flooring": { ... },
    "Windows": { ... },
    "Light Fittings": { ... },
    "Power Points": { ... }
  }
}`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0]);
      return c.json({
        success: true,
        ...analysisResult
      });
    }
    
    return c.json({
      success: true,
      overallComment: text,
      items: {}
    });
    
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return c.json({
      success: false,
      error: String(error),
      overallComment: '',
      items: {}
    });
  }
});

// Test Gemini connection
app.get('/api/gemini/test', async (c) => {
  try {
    const apiKey = c.env.GEMINI_API_KEY || GEMINI_API_KEY;
    const ai = getGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent('Say "API Connected Successfully"');
    const response = await result.response;
    const text = response.text();
    
    return c.json({
      success: true,
      message: text,
      model: 'gemini-2.0-flash-exp'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: String(error)
    }, 500);
  }
});

// Serve the main application
app.get('/', (c) => {
  return c.html(APP_HTML);
});

// Catch all routes - return the app
app.get('*', (c) => {
  return c.html(APP_HTML);
});

export default app