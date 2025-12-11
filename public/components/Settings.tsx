import React from 'react';
import { Save, Building, Image as ImageIcon, Key } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your company profile and application preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Company Profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Building size={20} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Company Profile</h2>
           </div>
           <div className="p-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" defaultValue="Remote Business Partner" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <input type="text" defaultValue="19 Bonnard Crescent, Ashby WA 6065" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" placeholder="+61 ..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" placeholder="admin@example.com" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
              </div>
           </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <ImageIcon size={20} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Branding & Logo</h2>
           </div>
           <div className="p-6 flex items-start gap-8">
              <div className="w-24 h-24 bg-blue-800 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-md">RB</div>
              <div className="flex-1">
                 <h3 className="font-medium text-gray-900 mb-1">Current Logo</h3>
                 <p className="text-sm text-gray-500 mb-4">This logo will appear on all generated PDF reports and proposals.</p>
                 <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Remove</button>
                    <button className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition">Upload New</button>
                 </div>
              </div>
           </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Key size={20} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">System Configuration</h2>
           </div>
           <div className="p-6 space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Gemini AI API Key</label>
                 <div className="flex gap-2">
                    <input type="password" value="************************" disabled className="flex-1 border border-gray-300 p-2.5 rounded-lg bg-gray-50 text-gray-500" />
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Update</button>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Currently managed via environment variables.</p>
              </div>
              <div className="flex items-center justify-between py-2">
                 <div>
                    <p className="text-sm font-medium text-gray-900">Auto-Generate Comments</p>
                    <p className="text-xs text-gray-500">Automatically run AI analysis when photos are uploaded.</p>
                 </div>
                 <div className="w-11 h-6 bg-green-600 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-end pt-4">
           <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95">
             <Save size={20} /> Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;