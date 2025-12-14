import React, { useState } from 'react';
import { FileOutput, ChevronRight, Check, ChevronLeft, Building2, DollarSign, PenTool } from 'lucide-react';

const ProposalGenerator: React.FC = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Proposal Generator</h1>
        <p className="text-gray-500 mt-2">Create professional property management proposals in 4 simple steps.</p>
      </div>

      {/* Progress Wizard */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
           <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
           ></div>
           
           {[
             { id: 1, label: 'Client', icon: Building2 }, 
             { id: 2, label: 'Fees', icon: DollarSign }, 
             { id: 3, label: 'Terms', icon: PenTool }, 
             { id: 4, label: 'Review', icon: Check }
           ].map((s) => (
             <div key={s.id} className="flex flex-col items-center bg-gray-50 pt-2 px-2">
               <div 
                 className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-300 shadow-sm ${
                    step >= s.id 
                    ? 'bg-blue-600 border-blue-600 text-white scale-110' 
                    : 'bg-white border-gray-300 text-gray-400'
                 }`}
               >
                 <s.icon size={20} />
               </div>
               <span className={`text-xs font-semibold mt-2 ${step >= s.id ? 'text-blue-700' : 'text-gray-500'}`}>{s.label}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Wizard Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 min-h-[400px] flex flex-col justify-between">
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building2 className="text-blue-600" /> Client & Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. John Smith" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                    <input type="text" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 123 Main St" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option>Residential House</option>
                        <option>Apartment / Unit</option>
                        <option>Commercial</option>
                    </select>
                 </div>
              </div>
            </div>
          )}
          {step === 2 && (
             <div>
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <DollarSign className="text-green-600" /> Services & Management Fees
               </h2>
               <div className="space-y-4">
                  <div className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer bg-gray-50 flex justify-between items-center">
                      <div>
                          <p className="font-bold text-gray-900">Standard Management</p>
                          <p className="text-sm text-gray-500">Includes routine inspections and rent collection.</p>
                      </div>
                      <span className="font-bold text-lg text-blue-600">8.5%</span>
                  </div>
                  <div className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer bg-white flex justify-between items-center shadow-sm ring-1 ring-blue-500 border-blue-500">
                      <div>
                          <p className="font-bold text-gray-900">Premium Management</p>
                          <p className="text-sm text-gray-500">All inclusive, court attendance, premium marketing.</p>
                      </div>
                      <span className="font-bold text-lg text-blue-600">11.0%</span>
                  </div>
                  
                  <div className="pt-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                          Include Letting Fee (1.5 weeks rent)
                      </label>
                  </div>
               </div>
             </div>
          )}
          {step === 3 && (
             <div>
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <PenTool className="text-purple-600" /> Custom Terms & Clauses
               </h2>
               <textarea 
                  className="w-full h-48 border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Enter any specific terms, conditions or notes for this proposal..."
                  defaultValue="The agency agrees to provide 4 routine inspections per annum."
               />
             </div>
          )}
           {step === 4 && (
             <div className="text-center py-8">
               <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <FileOutput size={48} />
               </div>
               <h2 className="text-2xl font-bold mb-2">Ready to Generate</h2>
               <p className="text-gray-500 mb-8">Review your details before creating the final PDF document.</p>
               
               <div className="bg-gray-50 p-4 rounded-lg max-w-sm mx-auto text-left text-sm text-gray-600 space-y-2">
                  <p><span className="font-bold">Client:</span> John Smith</p>
                  <p><span className="font-bold">Property:</span> 123 Main St</p>
                  <p><span className="font-bold">Plan:</span> Premium Management (11.0%)</p>
               </div>
             </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
           <button 
             onClick={() => setStep(s => Math.max(1, s - 1))}
             disabled={step === 1}
             className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
             <ChevronLeft size={18} /> Back
           </button>
           <button 
             onClick={() => setStep(s => Math.min(4, s + 1))}
             className={`px-8 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${
                 step === 4 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
             }`}
           >
             {step === 4 ? (
                 <>Generate PDF <FileOutput size={18} /></>
             ) : (
                 <>Next Step <ChevronRight size={18} /></>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalGenerator;