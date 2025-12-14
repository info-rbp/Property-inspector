import React, { useState, useMemo } from 'react';
import { Property, DataSource, DataField, Inspection, ConditionRating, PropertyAttributes, ManagedByType, PropertyLegal } from '../types';
import { 
  Building, BedDouble, Bath, Car, Calendar, MapPin, TrendingUp, TrendingDown, 
  History, ClipboardCheck, Edit3, ShieldAlert, DollarSign,
  Scale, Home, BarChart3, Camera, Upload, Link as LinkIcon, Users, Key,
  Database, CheckCircle2, ExternalLink, FileText, Download
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ConditionGauge } from './ConditionGauge';
import { PropertyMap } from './PropertyMap';

interface PropertyProfileProps {
  property: Property;
  inspections: Inspection[];
  onStartInspection: (propertyId: string) => void;
  onUpdateField: (field: keyof PropertyAttributes, value: any) => void;
  onUpdateProperty: (updates: Partial<Property>) => void;
}

const SourceBadge: React.FC<{ source: DataSource }> = ({ source }) => {
  let bg = 'bg-slate-100 text-slate-600';
  let icon = null;

  switch (source) {
    case DataSource.GNAF:
      bg = 'bg-blue-100 text-blue-800 border border-blue-200';
      icon = <CheckCircle2 size={10} className="mr-1" />;
      break;
    case DataSource.LAND_REGISTRY:
    case DataSource.GOVT_PLANNING:
      bg = 'bg-slate-800 text-white border border-slate-700';
      icon = <Scale size={10} className="mr-1" />;
      break;
    case DataSource.INSPECTOR:
      bg = 'bg-green-100 text-green-800 border border-green-200';
      icon = <CheckCircle2 size={10} className="mr-1" />;
      break;
    case DataSource.LICENSED_PROVIDER:
      bg = 'bg-purple-50 text-purple-700 border border-purple-200';
      break;
    case DataSource.AI_PARSED:
      bg = 'bg-amber-50 text-amber-700 border border-amber-200 dashed border';
      break;
  }

  return (
    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ml-2 uppercase tracking-wide`}>
      {icon} {source}
    </span>
  );
};

export const PropertyProfile: React.FC<PropertyProfileProps> = ({ property, inspections, onStartInspection, onUpdateField, onUpdateProperty }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'structural' | 'market' | 'history' | 'management' | 'reports'>('identity');
  const [isEditingImage, setIsEditingImage] = useState(false);

  const latestInspection = inspections.length > 0 ? inspections[0] : undefined;

  // Generate trend data based on current median
  const trendData = useMemo(() => {
    // Deterministic pseudo-random based on property id
    let seed = 0;
    for (let i = 0; i < property.id.length; i++) seed = (seed * 31 + property.id.charCodeAt(i)) >>> 0;

    const rand = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const base = property.rentalContext.medianRentSuburb || 0;

    return months.map((name) => ({
      name,
      uv: Math.round(base * (1 + (rand() * 0.1 - 0.05)))
    }));
  }, [property.id, property.rentalContext.medianRentSuburb]);

  // Mock Reports Data based on inspection history + static docs
  const reports = useMemo(() => {
    const list = [
        ...inspections
            .filter(i => i.status === 'completed')
            .map(i => ({
                id: `rep-${i.id}`,
                name: `Routine Inspection Report`,
                date: i.date,
                type: 'PDF',
                size: '2.4 MB'
            })),
        { id: 'rep-lease-23', name: 'Lease Agreement Signed', date: '2023-01-15', type: 'PDF', size: '4.1 MB' },
        { id: 'rep-entry-23', name: 'Entry Condition Report', date: '2023-01-10', type: 'PDF', size: '3.8 MB' },
        { id: 'rep-val-22', name: 'Rental Appraisal', date: '2022-12-05', type: 'PDF', size: '1.2 MB' }
    ];
    // Sort descending by date
    return list.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inspections]);

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

  const renderAttribute = (label: string, icon: React.ReactNode, fieldKey: keyof PropertyAttributes, field?: DataField<any>) => {
    if (!field) return null;
    return (
      <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 transition-colors group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-slate-500 text-xs uppercase font-bold tracking-wider">
            {icon}
            <span className="ml-2">{label}</span>
          </div>
          <button 
            onClick={() => {
              const newValue = prompt(`Update ${label}`, String(field.value));
              if (newValue !== null && newValue !== undefined && String(newValue).trim() !== '') {
                const isNumber = typeof field.value === 'number';
                const cleaned = String(newValue).trim();

                const nextValue = isNumber ? Number(cleaned) : cleaned;
                if (isNumber && Number.isNaN(nextValue)) return;

                onUpdateField(fieldKey, {
                  ...field,
                  value: nextValue,
                  source: DataSource.USER,
                  lastUpdated: new Date().toISOString(),
                  confidence: 1
                });
              }
            }}
            className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100"
          >
            <Edit3 size={14} />
          </button>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xl font-semibold text-slate-800">{String(field.value)}</span>
          <SourceBadge source={field.source} />
        </div>
      </div>
    );
  };

  const renderLegalField = (label: string, value: string | number, fieldKey: keyof PropertyLegal) => (
    <div className="bg-white p-3 rounded border border-slate-200 group hover:border-blue-400 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
        <button
          onClick={() => {
            const currentVal = value;
            const promptVal = prompt(`Update ${label}`, String(currentVal));
            if (promptVal !== null) {
               // Handle number for landSizeSqm
               let newVal: string | number = promptVal;
               if (fieldKey === 'landSizeSqm') {
                 newVal = parseFloat(promptVal);
                 if (isNaN(newVal)) return; // validation
               }
               
               onUpdateProperty({
                 legal: {
                   ...property.legal,
                   [fieldKey]: newVal
                 }
               });
            }
          }}
          className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit3 size={14} />
        </button>
      </div>
      <div className="font-medium text-slate-800 font-mono text-lg truncate" title={String(value)}>
        {fieldKey === 'landSizeSqm' ? `${value} m²` : value}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Identity Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-1/3 h-64 md:h-auto bg-slate-200 group">
          <img 
            src={property.thumbnailUrl || 'https://via.placeholder.com/400x300?text=No+Image'} 
            alt={property.identity.address} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
             <button 
               onClick={() => setIsEditingImage(!isEditingImage)}
               className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center transition-all transform translate-y-2 group-hover:translate-y-0"
             >
               <Camera size={16} className="mr-2" />
               Change Photo
             </button>
          </div>
          
          {isEditingImage && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-xl p-4 z-20 border border-slate-200 animate-in fade-in zoom-in duration-200">
               <h4 className="text-sm font-bold text-slate-800 mb-3">Update Property Photo</h4>
               <div className="space-y-2">
                 <label className="flex items-center justify-center w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 text-sm font-medium transition-colors">
                    <Upload size={16} className="mr-2" />
                    Upload File
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </label>
                 <button 
                   onClick={handleImageUrl}
                   className="flex items-center justify-center w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                 >
                    <LinkIcon size={16} className="mr-2" />
                    Paste URL
                 </button>
               </div>
               <button onClick={() => setIsEditingImage(false)} className="mt-3 text-xs text-slate-400 hover:text-slate-600 w-full text-center">Cancel</button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 p-6 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 hidden md:block"></div>
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded border border-slate-200 uppercase">
                  GNAF PID: {property.identity.gnafPid}
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded border border-slate-200 uppercase">
                  {property.identity.councilArea}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.identity.address}</h1>
              <div className="flex items-center text-slate-500 text-sm">
                 <MapPin size={16} className="mr-1" />
                 {property.identity.suburb}, {property.identity.state} {property.identity.postcode}
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
               <div className="flex items-center space-x-4">
                 {latestInspection && <ConditionGauge inspection={latestInspection} />}
                 <div>
                    <div className="text-xs text-slate-400 font-medium">Last Inspection</div>
                    <div className="text-sm font-semibold text-slate-700">{latestInspection ? new Date(latestInspection.date).toLocaleDateString() : 'Never'}</div>
                 </div>
               </div>
               <button 
                  onClick={() => onStartInspection(property.id)}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium shadow-md transition-all active:scale-95"
                >
                  <ClipboardCheck size={18} className="mr-2" />
                  Inspect
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'identity', label: 'Identity & Legal', icon: <Scale size={16}/> },
            { id: 'structural', label: 'Structural', icon: <Home size={16}/> },
            { id: 'market', label: 'Market Context', icon: <BarChart3 size={16}/> },
            { id: 'history', label: 'History', icon: <History size={16}/> },
            { id: 'management', label: 'Management', icon: <Users size={16}/> },
            { id: 'reports', label: 'Reports', icon: <FileText size={16}/> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: IDENTITY & LEGAL (The Truth) */}
        {activeTab === 'identity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
               <div className="flex items-center mb-4 text-slate-800">
                 <Database className="mr-2" size={20} />
                 <h3 className="font-bold">Land Registry Data</h3>
               </div>
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   {renderLegalField("Lot Number", property.legal.lotNumber, 'lotNumber')}
                   {renderLegalField("Plan Number", property.legal.planNumber, 'planNumber')}
                 </div>
                 {renderLegalField("Parcel ID", property.legal.parcelId, 'parcelId')}
                 {renderLegalField("Registered Land Size", property.legal.landSizeSqm, 'landSizeSqm')}
               </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
               <div className="flex items-center mb-4 text-slate-800">
                 <Scale className="mr-2" size={20} />
                 <h3 className="font-bold">Planning & Zoning</h3>
               </div>
               <div className="space-y-4">
                 <div className="flex items-center justify-between bg-white p-3 rounded border border-slate-200">
                   <div>
                     <div className="text-xs text-slate-400 uppercase tracking-wider">Zone Code</div>
                     <div className="font-bold text-slate-800">{property.legal.zoningCode}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Description</div>
                      <div className="text-xs text-slate-600">{property.legal.zoningDescription}</div>
                   </div>
                 </div>
                 
                 <div className="bg-white p-3 rounded border border-slate-200">
                   <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Overlays</div>
                   <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${property.legal.overlays.heritage ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50'}`}>
                        Heritage
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${property.legal.overlays.bushfire ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50'}`}>
                        Bushfire
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${property.legal.overlays.flood ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50'}`}>
                        Flood
                      </span>
                   </div>
                 </div>
               </div>
            </div>

             <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
                 <h3 className="flex items-center font-bold text-slate-800 mb-4">
                    <MapPin className="mr-2" size={18} /> Location Context
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Google Map Integration */}
                    <div className="h-full min-h-[300px] relative group rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                      <PropertyMap 
                        lat={property.identity.latitude} 
                        lng={property.identity.longitude} 
                        title={property.identity.address}
                      />
                      {property.identity.latitude !== 0 && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${property.identity.latitude},${property.identity.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 text-xs px-2 py-1 rounded shadow-sm border border-slate-200 flex items-center transition-colors opacity-0 group-hover:opacity-100 z-10"
                        >
                          <ExternalLink size={10} className="mr-1" />
                          View on Google Maps
                        </a>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Education</h4>
                           <ul className="text-sm text-slate-700 space-y-1">
                              {property.location.schools.map((s,i) => (
                                 <li key={i}>{s.name} <span className="text-slate-400">({s.distanceKm}km)</span></li>
                              ))}
                           </ul>
                        </div>
                        <div>
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Transport</h4>
                           <ul className="text-sm text-slate-700 space-y-1">
                              {property.location.transport.map((s,i) => (
                                 <li key={i}>{s.name} <span className="text-slate-400">({s.distanceKm}km)</span></li>
                              ))}
                           </ul>
                        </div>
                        <div className="md:col-span-2">
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Risk Factors</h4>
                           <ul className="text-sm text-slate-700 space-y-1">
                              {property.location.emergencyServices.map((s,i) => (
                                 <li key={i} className="flex items-center justify-between">
                                   {s.type} 
                                   <span className={`text-[10px] px-1.5 rounded ${s.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{s.riskLevel}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                    </div>
                 </div>
             </div>
          </div>
        )}

        {/* TAB 2: STRUCTURAL (The Physical Reality) */}
        {activeTab === 'structural' && (
          <div className="space-y-6">
            <div className="flex items-center p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 text-sm">
               <ShieldAlert className="mr-2" size={18} />
               These attributes are pre-filled from external data. They must be verified by an inspector.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {renderAttribute("Property Type", <Building size={14} />, 'type', property.attributes.type)}
               {renderAttribute("Bedrooms", <BedDouble size={14} />, 'bedrooms', property.attributes.bedrooms)}
               {renderAttribute("Bathrooms", <Bath size={14} />, 'bathrooms', property.attributes.bathrooms)}
               {renderAttribute("Car Spaces", <Car size={14} />, 'carSpaces', property.attributes.carSpaces)}
               {renderAttribute("Year Built", <Calendar size={14} />, 'yearBuilt', property.attributes.yearBuilt)}
               {renderAttribute("Floor Area (m²)", <Building size={14} />, 'floorAreaSqm', property.attributes.floorAreaSqm)}
            </div>
          </div>
        )}

        {/* TAB 3: MARKET CONTEXT (Aggregates) */}
        {activeTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Weekly Rent Trend (Suburb Median)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={['dataMin - 50', 'dataMax + 50']} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="uv" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">
                 Based on aggregated listing history for {property.identity.suburb} (3-bed Houses).
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-700 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Weekly Median ({property.identity.suburb})</div>
                <div className="text-3xl font-bold">${property.rentalContext.medianRentSuburb}</div>
                <div className="mt-4 flex items-center justify-between text-sm border-t border-slate-700 pt-3">
                   <span className="text-slate-400">Comparable ({property.attributes.bedrooms.value} Bed)</span>
                   <span className="font-mono font-bold">${property.rentalContext.medianRentBedrooms}</span>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Market Health</div>
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-sm text-slate-700">Vacancy Rate</span>
                   <span className="font-bold text-slate-900">{property.rentalContext.vacancyRate}%</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-slate-700">12 Mo. Trend</span>
                   <span className={`flex items-center text-sm font-bold ${property.rentalContext.trend12Month === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                     {property.rentalContext.trend12Month === 'up' ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                     {property.rentalContext.trend12Month.toUpperCase()}
                   </span>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTORY (Sales & Inspections) */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="flex items-center font-bold text-slate-800 mb-4">
                   <DollarSign className="mr-2" size={18} /> Sales History
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {property.salesHistory.map((sale, i) => (
                    <div key={i} className="relative flex items-center justify-between pl-8 group">
                      <div className="absolute left-0 w-2.5 h-2.5 bg-slate-200 rounded-full group-hover:bg-blue-500 transition-colors ml-[11px]"></div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{new Date(sale.date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{sale.type}</div>
                      </div>
                      <div className="font-mono font-bold text-slate-700">
                        ${sale.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="flex items-center font-bold text-slate-800">
                   <ClipboardCheck className="mr-2" size={18} /> Inspection Log
                </h3>
                {inspections.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">No inspections recorded.</div>
                ) : (
                  inspections.map(insp => (
                    <div key={insp.id} className="flex items-center bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{new Date(insp.date).toLocaleDateString()}</h4>
                          <p className="text-sm text-slate-500">Inspector: {insp.inspectorName}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${insp.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {insp.status.toUpperCase()}
                          </span>
                        </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* TAB 5: MANAGEMENT & ACCESS (Internal) */}
        {activeTab === 'management' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="flex items-center font-bold text-slate-800 mb-6">
                   <Users className="mr-2" size={20} /> Ownership & Management
                </h3>
                <div className="space-y-6">
                   <div>
                      <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Managed By</h4>
                      <div className="text-lg font-medium text-slate-800">
                         {property.management?.managedBy || 'Not Specified'}
                      </div>
                      {property.management?.managedBy === ManagedByType.REAL_ESTATE_AGENCY && property.management.managingAgencyName && (
                        <div className="text-sm text-slate-600 mt-1">{property.management.managingAgencyName}</div>
                      )}
                   </div>
                   
                   <hr className="border-slate-100"/>
                   
                   <div>
                      <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Owner Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <div className="text-xs text-slate-400 mb-1">Name</div>
                            <div className="font-medium text-slate-800">{property.management?.ownerName || 'Unknown'}</div>
                         </div>
                         <div>
                            <div className="text-xs text-slate-400 mb-1">Phone</div>
                            <div className="font-medium text-slate-800">{property.management?.ownerPhone || 'Unknown'}</div>
                         </div>
                         <div className="col-span-2">
                            <div className="text-xs text-slate-400 mb-1">Email</div>
                            <div className="font-medium text-slate-800">{property.management?.ownerEmail || 'Unknown'}</div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="flex items-center font-bold text-slate-800 mb-6">
                   <Key className="mr-2" size={20} /> Access Control
                </h3>
                <div className="space-y-6">
                   <div>
                      <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Key Location</h4>
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-semibold border border-blue-100">
                         {property.management?.keyAccess || 'Not Specified'}
                      </span>
                   </div>
                   
                   <div>
                      <h4 className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Access Notes</h4>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 min-h-[100px]">
                         {property.management?.accessNotes || 'No access notes provided.'}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* TAB 6: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="flex items-center font-bold text-slate-800 text-lg">
                   <FileText className="mr-2" size={20} /> Property Reports
                </h3>
                <p className="text-sm text-slate-500 mt-1">Generated documents and historical snapshots.</p>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic">No reports generated yet.</div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{report.name}</div>
                        <div className="text-xs text-slate-500 flex items-center mt-1">
                          <span className="mr-2">{new Date(report.date).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                          <span>{report.type}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full mx-2"></span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all">
                      <Download size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};