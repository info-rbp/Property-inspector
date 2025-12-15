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
const react_2 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("../utils");
const ClientManager = () => {
    const [properties, setProperties] = (0, react_2.useState)([]);
    const [isModalOpen, setIsModalOpen] = (0, react_2.useState)(false);
    const [editingId, setEditingId] = (0, react_2.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_2.useState)('');
    // Form State
    const [formData, setFormData] = (0, react_2.useState)({
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        address: '',
        managerType: 'Real Estate',
        keyDetails: 'Held with Agent',
        notes: ''
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            ownerName: '',
            ownerEmail: '',
            ownerPhone: '',
            address: '',
            managerType: 'Real Estate',
            keyDetails: 'Held with Agent',
            notes: ''
        });
        setIsModalOpen(true);
    };
    const handleEdit = (property) => {
        setEditingId(property.id);
        setFormData({
            ownerName: property.ownerName,
            ownerEmail: property.ownerEmail,
            ownerPhone: property.ownerPhone,
            address: property.address,
            managerType: property.managerType,
            keyDetails: property.keyDetails,
            notes: property.notes
        });
        setIsModalOpen(true);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            // Update existing
            setProperties(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
        }
        else {
            // Create new
            const newProperty = {
                id: (0, utils_1.generateId)(),
                ...formData
            };
            setProperties(prev => [...prev, newProperty]);
        }
        setIsModalOpen(false);
        setEditingId(null);
    };
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this property?')) {
            setProperties(prev => prev.filter(p => p.id !== id));
        }
    };
    const filteredProperties = properties.filter(p => p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Manager</h1>
          <p className="text-gray-500">Manage your portfolio, property details and keys.</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <lucide_react_1.Plus size={20}/> Add New Property
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex gap-4 bg-gray-50">
           <div className="relative flex-1 max-w-md">
             <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
             <input type="text" placeholder="Search by address, owner or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
           </div>
        </div>
        
        {/* Content Area */}
        {properties.length === 0 ? (<div className="p-16 text-center text-gray-500">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-200">
               <lucide_react_1.Home size={40}/>
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
             <p className="mb-8 max-w-sm mx-auto">Get started by adding your first property to streamline your reports and inspections.</p>
             <button onClick={openAddModal} className="text-blue-600 font-semibold hover:text-blue-800 hover:underline">
               + Add New Property
             </button>
          </div>) : (<div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (<div key={property.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {property.ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{property.ownerName}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {property.managerType}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(property)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Property">
                      <lucide_react_1.Edit size={18}/>
                    </button>
                    <button onClick={() => handleDelete(property.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete Property">
                      <lucide_react_1.Trash2 size={18}/>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 pt-2 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <lucide_react_1.MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                    <span className="font-medium text-gray-800">{property.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Mail size={16} className="text-gray-400"/>
                    <span className="truncate">{property.ownerEmail || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Phone size={16} className="text-gray-400"/>
                    <span>{property.ownerPhone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 mt-2">
                    <lucide_react_1.Key size={16} className="text-amber-500"/>
                    <span className="text-amber-700 font-medium text-xs bg-amber-50 px-2 py-1 rounded">
                      {property.keyDetails}
                    </span>
                  </div>
                </div>
              </div>))}
          </div>)}
      </div>

      {/* Add/Edit Property Modal */}
      {isModalOpen && (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Property Details' : 'Add New Property'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <lucide_react_1.X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Property Address */}
              <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-4">
                    <lucide_react_1.MapPin size={16}/> Property Location
                  </h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 123 Main St, Suburb WA 6000"/>
              </div>

              {/* Owner Details */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <lucide_react_1.User size={16}/> Owner / Client Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                    <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Jane Doe"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                    <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="jane@example.com"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
                    <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0400 000 000"/>
                  </div>
                </div>
              </div>

              {/* Management Details */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <lucide_react_1.Building size={16}/> Management & Access
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Managed By</label>
                    <select name="managerType" value={formData.managerType} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="Real Estate">Real Estate Agency</option>
                      <option value="Landlord">Private Landlord</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Access Details</label>
                    <select name="keyDetails" value={formData.keyDetails} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="Held with Agent">Held with Agent</option>
                      <option value="Held with Landlord">Held with Landlord</option>
                      <option value="Safebox">Safebox / Lockbox</option>
                      <option value="Tenant">Tenant to provide access</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none h-20" placeholder="Access codes, specific instructions, etc."></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors">
                  {editingId ? 'Update Property' : 'Save Property'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
exports.default = ClientManager;
