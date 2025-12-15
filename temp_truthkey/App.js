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
const types_2 = require("./types");
const PropertyProfile_1 = require("./components/PropertyProfile");
const InspectionRunner_1 = require("./components/InspectionRunner");
const ManagementStep_1 = require("./components/ManagementStep");
const AddressAutocompleteInput_1 = require("./components/AddressAutocompleteInput");
const lucide_react_1 = require("lucide-react");
const geminiService_1 = require("./services/geminiService");
const addressService_1 = require("./services/addressService");
const store_1 = require("./state/store");
// Small neutral placeholder so we never show a broken-image icon.
const PLACEHOLDER_THUMB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364758b' font-family='Arial' font-size='22'%3EProperty Preview%3C/text%3E%3C/svg%3E";
function App() {
    const { state, dispatch } = (0, store_1.useStore)();
    const { properties, reports, activePropertyId } = state;
    // Add Property flow state
    const [importStage, setImportStage] = (0, react_2.useState)('closed');
    const [importText, setImportText] = (0, react_2.useState)('');
    const [isImporting, setIsImporting] = (0, react_2.useState)(false);
    const [importDraft, setImportDraft] = (0, react_2.useState)(null);
    const [managementDraft, setManagementDraft] = (0, react_2.useState)({
        managedBy: types_2.ManagedByType.PRIVATE_LANDLORD,
        keyAccess: types_2.KeyAccessType.HELD_WITH_LANDLORD,
    });
    const [searchError, setSearchError] = (0, react_2.useState)(null);
    const [isInspecting, setIsInspecting] = (0, react_2.useState)(false);
    const fileInputRef = (0, react_2.useRef)(null);
    // -- HANDLERS --
    const handleUpdateField = (fieldKey, newValue) => {
        if (!activePropertyId)
            return;
        const prop = properties.find(p => p.id === activePropertyId);
        if (prop) {
            dispatch({
                type: 'UPDATE_PROPERTY',
                payload: {
                    ...prop,
                    attributes: { ...prop.attributes, [fieldKey]: newValue }
                }
            });
        }
    };
    const handleUpdateProperty = (updates) => {
        if (!activePropertyId)
            return;
        const prop = properties.find(p => p.id === activePropertyId);
        if (prop) {
            dispatch({ type: 'UPDATE_PROPERTY', payload: { ...prop, ...updates } });
        }
    };
    const openAddProperty = () => {
        setImportStage('input');
        setImportDraft(null);
        setImportText('');
        setManagementDraft({
            managedBy: types_2.ManagedByType.PRIVATE_LANDLORD,
            keyAccess: types_2.KeyAccessType.HELD_WITH_LANDLORD,
        });
        setSearchError(null);
    };
    const cancelAddProperty = () => {
        setImportStage('closed');
        setImportDraft(null);
        setImportText('');
        setIsImporting(false);
        setSearchError(null);
    };
    const backToInput = () => {
        setImportStage('input');
        setImportDraft(null);
        setSearchError(null);
    };
    const handleAIImport = async () => {
        if (!importText)
            return;
        setIsImporting(true);
        setSearchError(null);
        try {
            // 1. Validate Location via Google Geocoding
            let validated = await (0, addressService_1.validateAddress)(importText);
            if (!validated) {
                console.warn("Address validation failed. Proceeding with raw input.");
                validated = {
                    formattedAddress: importText,
                    placeId: `manual-${Date.now()}`,
                    location: { lat: 0, lng: 0 },
                    streetNumber: '',
                    streetName: '',
                    suburb: '',
                    state: '',
                    postcode: '',
                    councilArea: ''
                };
            }
            // 2. AI Enrichment
            const data = await (0, geminiService_1.parsePropertyDetails)(validated.formattedAddress);
            const aiAttributes = data?.attributes || {};
            const aiLegal = data?.legal || {};
            const aiContext = data?.marketContext || {};
            const aiThumbnail = data?.thumbnailUrl || PLACEHOLDER_THUMB;
            const now = new Date().toISOString();
            const newId = `PROP-${Date.now()}`;
            // Build attributes
            const attrs = {
                type: {
                    value: aiAttributes.type || types_2.PropertyType.HOUSE,
                    source: types_2.DataSource.AI_PARSED,
                    lastUpdated: now,
                    confidence: 0.6
                },
                bedrooms: {
                    value: typeof aiAttributes.bedrooms === 'number' ? aiAttributes.bedrooms : 0,
                    source: types_2.DataSource.AI_PARSED,
                    lastUpdated: now,
                    confidence: 0.6
                },
                bathrooms: {
                    value: typeof aiAttributes.bathrooms === 'number' ? aiAttributes.bathrooms : 0,
                    source: types_2.DataSource.AI_PARSED,
                    lastUpdated: now,
                    confidence: 0.6
                },
                carSpaces: {
                    value: typeof aiAttributes.carSpaces === 'number' ? aiAttributes.carSpaces : 0,
                    source: types_2.DataSource.AI_PARSED,
                    lastUpdated: now,
                    confidence: 0.6
                }
            };
            if (typeof aiAttributes.yearBuilt === 'number') {
                attrs.yearBuilt = { value: aiAttributes.yearBuilt, source: types_2.DataSource.AI_PARSED, lastUpdated: now, confidence: 0.5 };
            }
            if (typeof aiAttributes.floorArea === 'number') {
                attrs.floorAreaSqm = { value: aiAttributes.floorArea, source: types_2.DataSource.AI_PARSED, lastUpdated: now, confidence: 0.5 };
            }
            const draft = {
                id: newId,
                thumbnailUrl: aiThumbnail,
                identity: {
                    gnafPid: `GNAF-PENDING-${Date.now()}`,
                    placeId: validated.placeId,
                    address: validated.formattedAddress,
                    streetNumber: validated.streetNumber,
                    streetName: validated.streetName,
                    suburb: validated.suburb,
                    state: validated.state,
                    postcode: validated.postcode,
                    councilArea: validated.councilArea || data?.identity?.council || 'Pending',
                    latitude: validated.location.lat,
                    longitude: validated.location.lng
                },
                legal: {
                    lotNumber: aiLegal.lotNumber || 'Pending',
                    planNumber: aiLegal.planNumber || 'Pending',
                    parcelId: 'Pending',
                    landSizeSqm: 0,
                    zoningCode: aiLegal.zoningCode || 'Pending',
                    zoningDescription: 'Pending Check',
                    overlays: { heritage: false, bushfire: false, flood: false }
                },
                attributes: attrs,
                salesHistory: [],
                rentalContext: {
                    medianRentSuburb: typeof aiContext.medianRentSuburb === 'number' ? aiContext.medianRentSuburb : 0,
                    medianRentType: 0,
                    medianRentBedrooms: 0,
                    vacancyRate: typeof aiContext.vacancyRate === 'number' ? aiContext.vacancyRate : 0,
                    trend12Month: 'flat'
                },
                location: { schools: [], transport: [], emergencyServices: [] },
                metadata: {
                    createdDate: now,
                    lastVerified: 'Pending',
                    status: 'Draft'
                }
            };
            setImportDraft(draft);
            setImportStage('draft');
        }
        catch (e) {
            setSearchError("An unexpected error occurred. Please try again.");
            console.error(e);
        }
        finally {
            setIsImporting(false);
        }
    };
    const handleCSVUpload = (e) => {
        // (Simplified for brevity - keep existing logic or adapt to store)
        alert("Please update CSV import to use global store dispatch.");
    };
    const selectedProperty = properties.find(p => p.id === activePropertyId);
    if (isInspecting && selectedProperty) {
        return (<InspectionRunner_1.InspectionRunner property={selectedProperty} onClose={() => setIsInspecting(false)}/>);
    }
    return (<div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-slate-850 flex-shrink-0 flex flex-col items-center md:items-stretch py-6 border-r border-slate-700">
        <div className="px-4 mb-10 flex items-center justify-center md:justify-start">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
          <span className="ml-3 font-bold text-white text-xl hidden md:block tracking-tight">TruthKey</span>
        </div>

        <nav className="flex-1 space-y-2 px-2">
          <button onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: undefined })} className={`w-full flex items-center p-3 rounded-lg transition-colors ${!activePropertyId ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <lucide_react_1.Home size={20}/>
            <span className="ml-3 hidden md:block font-medium">Portfolio</span>
          </button>
        </nav>

        <div className="px-4 mt-auto">
          <div className="bg-slate-800 p-4 rounded-xl hidden md:block">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Data Status</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-green-400 text-xs">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>GNAF Connected
              </div>
              <div className="flex items-center text-green-400 text-xs">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>Registry Live
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activePropertyId && selectedProperty ? (<div>
            <div className="p-4 border-b bg-white flex items-center sticky top-0 z-10">
              <button onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: undefined })} className="text-slate-500 hover:text-slate-800 mr-4">
                <lucide_react_1.ArrowLeft size={20}/>
              </button>
              <span className="text-sm font-medium text-slate-500">Property Detail View</span>
            </div>
            <PropertyProfile_1.PropertyProfile property={selectedProperty} inspections={reports.filter(i => i.propertyId === selectedProperty.id)} onStartInspection={() => setIsInspecting(true)} onUpdateField={handleUpdateField} onUpdateProperty={handleUpdateProperty}/>
          </div>) : (<div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Property Portfolio</h1>
                <p className="text-slate-500 mt-1">Single source of truth for {properties.length} managed assets.</p>
              </div>
              <div className="flex items-center">
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCSVUpload}/>
                <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-5 py-3 rounded-lg font-medium shadow-sm flex items-center mr-3 transition-all">
                    <lucide_react_1.UploadCloud size={18} className="mr-2"/>
                    Import CSV
                </button>
                <button onClick={openAddProperty} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-lg font-medium shadow-lg flex items-center">
                    <lucide_react_1.Plus size={18} className="mr-2"/>
                    Add Property
                </button>
              </div>
            </div>

            {/* ADD PROPERTY PANEL */}
            {importStage !== 'closed' && (<div className="mb-8 bg-white p-6 rounded-xl border border-blue-200 shadow-sm ring-4 ring-blue-50/50">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <lucide_react_1.Sparkles className="text-purple-500 mr-2" size={20}/>
                  Add New Property
                </h3>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                  Step {importStage === 'input' ? '1' : importStage === 'draft' ? '2' : '3'} of 3 · {importStage === 'input' ? 'Search Address' : importStage === 'draft' ? 'Review Details' : 'Management'}
                </div>

                {importStage === 'input' && (<div className="flex flex-col items-center py-6">
                    <div className="w-full max-w-md mb-6">
                         <AddressAutocompleteInput_1.AddressAutocompleteInput value={importText} onChange={setImportText} onSelect={(s) => setImportText(s.display_name)} autoFocus/>
                         
                         {searchError && (<div className="flex items-center justify-center text-red-600 text-sm mt-3 bg-red-50 p-2 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                                <lucide_react_1.AlertTriangle size={16} className="mr-2 flex-shrink-0"/>
                                {searchError}
                            </div>)}

                         <p className="text-xs text-slate-500 mt-3 text-center px-4">
                           Enter a full address. We'll use Google Maps data to auto-fill legal identifiers, structural attributes, and market context.
                         </p>
                    </div>

                    <div className="flex justify-center space-x-4 w-full">
                      <button onClick={cancelAddProperty} className="px-6 py-2 text-slate-500 hover:bg-slate-100 rounded-full font-medium transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleAIImport} disabled={isImporting || !importText} className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                        {isImporting ? (<>
                             <lucide_react_1.Loader2 className="animate-spin mr-2" size={18}/>
                             Searching...
                           </>) : (<>
                             Find Property
                           </>)}
                      </button>
                    </div>
                  </div>)}

                {importStage === 'draft' && importDraft && (<>
                    <div className="flex items-center p-3 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-sm mb-4">
                      <lucide_react_1.AlertTriangle className="mr-2" size={18}/>
                      Draft only. This has not been added to your portfolio yet.
                    </div>

                    {/* DRAFT PREVIEW */}
                    <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                            Draft
                          </div>
                          <h4 className="mt-2 text-xl font-bold text-slate-900">
                            {importDraft.identity.address}
                          </h4>
                          <div className="mt-1 text-sm text-slate-600">
                            {importDraft.identity.suburb}, {importDraft.identity.state} {importDraft.identity.postcode}
                          </div>

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <div className="text-xs text-slate-400 uppercase tracking-wider">GNAF PID</div>
                              <div className="font-mono text-slate-800">{importDraft.identity.gnafPid}</div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3">
                              <div className="text-xs text-slate-400 uppercase tracking-wider">Lot / Plan</div>
                              <div className="font-mono text-slate-800">
                                Lot {importDraft.legal.lotNumber} / {importDraft.legal.planNumber}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Next</div>
                          <div className="flex items-center text-blue-700 text-sm font-medium">
                            <lucide_react_1.ArrowRightCircle className="mr-2" size={18}/>
                            Setup Management
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-5">
                      <button onClick={backToInput} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded flex items-center">
                        <lucide_react_1.ArrowLeftCircle size={18} className="mr-2"/>
                        Back to search
                      </button>

                      <div className="flex gap-3">
                        <button onClick={cancelAddProperty} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded flex items-center">
                          <lucide_react_1.XCircle size={18} className="mr-2"/>
                          Cancel
                        </button>
                        <button onClick={() => setImportStage('management')} className="px-6 py-2 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 flex items-center">
                          <lucide_react_1.CheckCircle2 size={18} className="mr-2"/>
                          Next: Management & Access
                        </button>
                      </div>
                    </div>
                  </>)}

                {importStage === 'management' && importDraft && (<>
                    <ManagementStep_1.ManagementStep value={managementDraft} onChange={setManagementDraft}/>

                    <div className="flex justify-between items-center mt-6">
                      <button onClick={() => setImportStage('draft')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
                        Back
                      </button>

                      <div className="flex gap-3">
                        <button onClick={cancelAddProperty} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
                          Cancel
                        </button>

                        <button onClick={() => {
                        const finalDraft = { ...importDraft, management: managementDraft, metadata: { ...importDraft.metadata, status: 'Active' } };
                        dispatch({ type: 'ADD_PROPERTY', payload: finalDraft });
                        dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: finalDraft.id });
                        setImportStage('closed');
                        setImportDraft(null);
                        setImportText('');
                    }} className="px-6 py-2 bg-slate-900 text-white rounded font-medium hover:bg-slate-800">
                          Confirm & Add Property
                        </button>
                      </div>
                    </div>
                  </>)}
              </div>)}

            {/* PORTFOLIO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(prop => (<div key={prop.id} onClick={() => dispatch({ type: 'SET_ACTIVE_PROPERTY', payload: prop.id })} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="h-48 bg-slate-200 relative">
                    <img src={prop.thumbnailUrl} alt={prop.identity.address} className="w-full h-full object-cover" onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_THUMB;
                }}/>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-800 shadow-sm">
                      {prop.identity.suburb}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {prop.identity.address}
                    </h3>

                    <div className="flex items-center space-x-4 mt-3 text-slate-500 text-sm">
                      <span>{prop.attributes.bedrooms.value} Bed</span>
                      <span>{prop.attributes.bathrooms.value} Bath</span>
                      <span>{prop.attributes.carSpaces.value} Car</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-400">
                        {prop.legal.lotNumber !== 'Pending' ? `Lot ${prop.legal.lotNumber}` : 'Pending Legal'}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${prop.metadata.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    </div>
                  </div>
                </div>))}
            </div>
          </div>)}
      </main>
    </div>);
}
