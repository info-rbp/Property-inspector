
import React, { useState, useRef } from 'react';
import { Property, Inspection, ReportType } from '@/types';
import { PropertyProfile } from './components/PropertyProfile';
import { InspectionRunner } from './components/InspectionRunner';
import { AddressAutocompleteInput } from './components/AddressAutocompleteInput';
import { Home, Plus, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useStore } from './state/store';
import { generateId } from './utils';

const PLACEHOLDER_THUMB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364758b' font-family='Arial' font-size='22'%3EProperty Preview%3C/text%3E%3C/svg%3E";

export default function App() {
  const { state, dispatch } = useStore();
  const { properties, reports, activePropertyId } = state;
  const [isInspecting, setIsInspecting] = useState(false);
  const [importText, setImportText] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const updateProperty = (id: string, updates: Partial<Property>) => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: { id, updates } });
  };

  const handleAIImport = async () => {
    if (!importText) return;
    setSearchError(null);
    const newId = generateId();
    const draft: Property = {
      id: newId,
      address: importText,
      ownerName: 'Pending',
      tenantName: 'Pending',
      tenantEmail: 'Pending',
      defaultRooms: [],
      thumbnailUrl: PLACEHOLDER_THUMB,
    };
    dispatch({ type: 'ADD_PROPERTY', payload: draft });
    dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: newId });
    setImportText('');
  };

  const selectedProperty = properties.find(p => p.id === activePropertyId);

  if (isInspecting && selectedProperty) {
    return (
      <InspectionRunner
        property={selectedProperty}
        onClose={() => setIsInspecting(false)}
        onSave={(inspection: Inspection) => {
          dispatch({ type: 'ADD_REPORT', payload: inspection });
          setIsInspecting(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="w-20 md:w-64 bg-gray-800 flex-shrink-0 flex flex-col items-center md:items-stretch py-6 border-r border-gray-700">
        <div className="px-4 mb-10 flex items-center justify-center md:justify-start">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="ml-3 font-bold text-white text-xl hidden md:block tracking-tight">ProInspect</span>
        </div>
        <nav className="flex-1 space-y-2 px-2">
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: undefined })}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${
              !activePropertyId ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Home size={20} />
            <span className="ml-3 hidden md:block font-medium">Portfolio</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {activePropertyId && selectedProperty ? (
          <div>
            <div className="p-4 border-b bg-white flex items-center sticky top-0 z-10">
              <button onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: undefined })} className="text-gray-500 hover:text-gray-800 mr-4">
                <ArrowLeft size={20} />
              </button>
              <span className="text-sm font-medium text-gray-500">Property Detail View</span>
            </div>
            <PropertyProfile
              property={selectedProperty}
              inspections={reports.filter(i => i.propertyId === selectedProperty.id)}
              onStartInspection={() => setIsInspecting(true)}
              onUpdateProperty={(updates) => updateProperty(selectedProperty.id, updates)}
            />
          </div>
        ) : (
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Property Portfolio</h1>
                <p className="text-gray-500 mt-1">{properties.length} managed assets</p>
              </div>
              <div className="w-full max-w-md">
                <AddressAutocompleteInput
                  value={importText}
                  onChange={setImportText}
                  onSelect={(s) => setImportText(s.display_name)}
                  autoFocus
                />
                <button onClick={handleAIImport} disabled={!importText} className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2">Add Property</button>
                {searchError && (
                  <div className="flex items-center text-red-600 text-sm mt-2">
                      <AlertTriangle size={16} className="mr-2" />
                      {searchError}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(prop => (
                <div
                  key={prop.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: prop.id })}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="h-48 bg-gray-200 relative">
                    <img
                      src={prop.thumbnailUrl}
                      alt={prop.address}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_THUMB; }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                      {prop.address}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
