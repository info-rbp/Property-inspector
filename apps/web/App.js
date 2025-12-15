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
exports.default = App;
const react_2 = __importStar(require("react"));
const PropertyProfile_1 = require("./components/PropertyProfile");
const InspectionRunner_1 = require("./components/InspectionRunner");
const AddressAutocompleteInput_1 = require("./components/AddressAutocompleteInput");
const lucide_react_1 = require("lucide-react");
const store_1 = require("./state/store");
const utils_1 = require("./utils");
const PLACEHOLDER_THUMB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364758b' font-family='Arial' font-size='22'%3EProperty Preview%3C/text%3E%3C/svg%3E";
function App() {
    const { state, dispatch } = (0, store_1.useStore)();
    const { properties, reports, activePropertyId } = state;
    const [isInspecting, setIsInspecting] = (0, react_2.useState)(false);
    const [importText, setImportText] = (0, react_2.useState)('');
    const [searchError, setSearchError] = (0, react_2.useState)(null);
    const updateProperty = (id, updates) => {
        dispatch({ type: 'UPDATE_PROPERTY', payload: { id, updates } });
    };
    const handleAIImport = async () => {
        if (!importText)
            return;
        setSearchError(null);
        const newId = (0, utils_1.generateId)();
        const draft = {
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
        return (<InspectionRunner_1.InspectionRunner property={selectedProperty} onClose={() => setIsInspecting(false)} onSave={(inspection) => {
                dispatch({ type: 'ADD_REPORT', payload: inspection });
                setIsInspecting(false);
            }}/>);
    }
    return (<div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="w-20 md:w-64 bg-gray-800 flex-shrink-0 flex flex-col items-center md:items-stretch py-6 border-r border-gray-700">
        <div className="px-4 mb-10 flex items-center justify-center md:justify-start">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="ml-3 font-bold text-white text-xl hidden md:block tracking-tight">ProInspect</span>
        </div>
        <nav className="flex-1 space-y-2 px-2">
          <button onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: undefined })} className={`w-full flex items-center p-3 rounded-lg transition-colors ${!activePropertyId ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
            <lucide_react_1.Home size={20}/>
            <span className="ml-3 hidden md:block font-medium">Portfolio</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {activePropertyId && selectedProperty ? (<div>
            <div className="p-4 border-b bg-white flex items-center sticky top-0 z-10">
              <button onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: undefined })} className="text-gray-500 hover:text-gray-800 mr-4">
                <lucide_react_1.ArrowLeft size={20}/>
              </button>
              <span className="text-sm font-medium text-gray-500">Property Detail View</span>
            </div>
            <PropertyProfile_1.PropertyProfile property={selectedProperty} inspections={reports.filter(i => i.propertyId === selectedProperty.id)} onStartInspection={() => setIsInspecting(true)} onUpdateProperty={(updates) => updateProperty(selectedProperty.id, updates)}/>
          </div>) : (<div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Property Portfolio</h1>
                <p className="text-gray-500 mt-1">{properties.length} managed assets</p>
              </div>
              <div className="w-full max-w-md">
                <AddressAutocompleteInput_1.AddressAutocompleteInput value={importText} onChange={setImportText} onSelect={(s) => setImportText(s.display_name)} autoFocus/>
                <button onClick={handleAIImport} disabled={!importText} className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2">Add Property</button>
                {searchError && (<div className="flex items-center text-red-600 text-sm mt-2">
                      <lucide_react_1.AlertTriangle size={16} className="mr-2"/>
                      {searchError}
                  </div>)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(prop => (<div key={prop.id} onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: prop.id })} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="h-48 bg-gray-200 relative">
                    <img src={prop.thumbnailUrl} alt={prop.address} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = PLACEHOLDER_THUMB; }}/>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                      {prop.address}
                    </h3>
                  </div>
                </div>))}
            </div>
          </div>)}
      </main>
    </div>);
}
