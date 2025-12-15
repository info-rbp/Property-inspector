"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_2 = __importDefault(require("react"));
const PDFPreview = ({ data }) => {
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '';
        return new Date(dateStr).toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    const getReportTitle = () => {
        switch (data.type) {
            case 'Exit':
                return 'Residential Tenancy Exit Condition Report';
            case 'Routine':
                return 'Routine Property Inspection Report';
            case 'Entry':
            default:
                return 'Residential Tenancy Entry Condition Report';
        }
    };
    return (<div className="bg-white text-black text-sm leading-tight max-w-[210mm] mx-auto shadow-none print:w-full print:max-w-none">
      
      {/* Page 1: Cover */}
      <div className="p-10 mb-8 border-b-2 border-gray-200 print:border-none page-break">
        <div className="flex justify-between items-start mb-20">
          <div className="flex items-center gap-2">
             {/* Logo Placeholder */}
             <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl print:print-color-adjust">
               RB
             </div>
             <h1 className="text-3xl font-bold text-blue-800 tracking-tighter uppercase">Remote Business Partner</h1>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">{data.agentCompany || 'Remote Business Partner'}</p>
            <p>19 Bonnard Crescent</p>
            <p>Ashby WA 6065</p>
          </div>
        </div>

        <div className="text-center mt-32 mb-32">
          <h1 className="text-4xl font-bold mb-8">{getReportTitle()}</h1>
          <h2 className="text-2xl font-semibold mb-12">{data.propertyAddress || 'Address Not Provided'}</h2>
        </div>

        <div className="text-center mt-20">
          <p className="text-lg mb-2">Report completed on {formatDate(data.inspectionDate)}</p>
          <p className="text-lg">Prepared by {data.agentName || 'Admin Team'}</p>
        </div>
        
        <div className="text-center mt-32 text-xs text-gray-500">
           <p>Powered by Remote Business Partner AI</p>
        </div>
      </div>

      {/* Page 2: Disclosures and Details */}
      <div className="p-10 mb-8 page-break">
         
         <div className="border-b-2 border-gray-900 pb-4 mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Report Details & Disclosures</h1>
         </div>

         {/* Representation Disclaimer Section */}
         <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 text-xs text-blue-900 text-justify leading-relaxed print:print-color-adjust">
             <h3 className="font-bold mb-2 text-sm">Representation Disclaimer</h3>
             <p>
                This report has been conducted and prepared by Tiberius Holdings Corporation Pty Ltd as trading as Remote Business Partner on behalf of <span className="font-bold">{data.clientName || '[Client Name]'}</span>. We receive a fee to carry out property reports, including the one that has been produced in this document, from the landlord or managing real estate agent and conduct inspections and subsequent reports based on their requirements and those under the Residential Tenancies Act 1987 (WA). The commentary provided within this report is based on the observations made of the property on the date of the inspection and may reference reports conducted and prepared by other parties in relation to the property. If you have been provided this report by your landlord or the real estate agency, you must address all questions or disputes with these parties and not directly with us.
             </p>
         </div>

         {/* Report Creation Disclaimer Section */}
         <div className="bg-gray-50 border-l-4 border-gray-500 p-4 mb-10 text-xs text-gray-800 text-justify leading-relaxed print:print-color-adjust">
             <h3 className="font-bold mb-2 text-sm">Report Creation Disclaimer</h3>
             <p>
                This report and commentary is created utilising a web application designed by and managed by Tiberius Holdings Corporation Pty Ltd as trading as Remote Business Partner. This report may utilise artificial intelligence in the creation of the report and its commentary and the any analysis provided within the report including, but not limited to, property overviews, room overviews and overviews of different aspects of rooms. All commentary and images are checked by the author before being provided to the intended recipient.
             </p>
         </div>

         <div className="border border-black p-0 mb-6">
            <div className="bg-gray-200 p-2 font-bold border-b border-black">Tenancy Details</div>
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3 font-bold">Property Address:</div>
                    <div className="col-span-9 border-b border-gray-300">{data.propertyAddress}</div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3 font-bold">Inspecting Agent:</div>
                    <div className="col-span-9 border-b border-gray-300">{data.agentName}</div>
                </div>
                 <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3 font-bold">Inspection Date:</div>
                    <div className="col-span-9 border-b border-gray-300">{formatDate(data.inspectionDate)}</div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3 font-bold">Tenant/s:</div>
                    <div className="col-span-9 border-b border-gray-300">{data.tenantName}</div>
                </div>
            </div>
         </div>
         
         <div className="border border-black p-4 flex justify-between items-center text-sm">
             <div>Tenant's Initial(s):</div>
             <div className="w-16 border-b border-black"></div>
             <div className="w-16 border-b border-black"></div>
             <div>Date:</div>
             <div className="w-24 border-b border-black"></div>
         </div>
      </div>

      {/* Pages 3+: Rooms */}
      <div className="p-10">
        <div className="mb-4 text-xs bg-gray-100 p-2 border border-black">
            <strong>Key:</strong> 
            <span className="mx-2"><span className="font-bold">Cln</span> = Clean</span>
            <span className="mx-2"><span className="font-bold">Udg</span> = Undamaged</span>
            <span className="mx-2"><span className="font-bold">Wkg</span> = Working</span>
        </div>

        {data.rooms.map((room, rIndex) => (<div key={room.id} className="mb-8">
            <div className="bg-gray-800 text-white p-2 font-bold text-sm mb-0 flex justify-between print:bg-gray-300 print:text-black print:border print:border-black print:border-b-0">
                <span>{room.name}</span>
                <span className="font-normal opacity-75">Room {rIndex + 1} of {data.rooms.length}</span>
            </div>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left w-3/12 text-sm font-bold">Item</th>
                  <th className="border border-black p-1 w-8 text-center">Cln</th>
                  <th className="border border-black p-1 w-8 text-center">Udg</th>
                  <th className="border border-black p-1 w-8 text-center">Wkg</th>
                  <th className="border border-black p-2 text-left w-auto text-gray-800">
                     Agent Condition Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td className="border border-black p-2 font-semibold bg-gray-50">Room Overview</td>
                    <td className="border border-black bg-gray-50"></td>
                    <td className="border border-black bg-gray-50"></td>
                    <td className="border border-black bg-gray-50"></td>
                    <td className="border border-black p-2 font-medium bg-gray-50">
                        {room.photos.length > 0 && <span className="text-blue-700 block mb-1">({room.photos.length} photos attached)</span>}
                        {room.overallComment || <span className="text-gray-400 italic">No overall comment provided.</span>}
                    </td>
                </tr>
                {room.items.map((item) => (<tr key={item.id} className="avoid-break">
                    <td className="border border-black p-2 font-medium">{item.name}</td>
                    <td className="border border-black p-1 text-center font-bold">{item.isClean ? 'Y' : 'N'}</td>
                    <td className="border border-black p-1 text-center font-bold">{item.isUndamaged ? 'Y' : 'N'}</td>
                    <td className="border border-black p-1 text-center font-bold">{item.isWorking ? 'Y' : 'N'}</td>
                    <td className="border border-black p-2 align-top whitespace-pre-wrap leading-relaxed">{item.comment}</td>
                  </tr>))}
              </tbody>
            </table>
            
            {/* Photos for this room - Grid Layout */}
            {room.photos.length > 0 && (<div className="mt-4 border border-black p-2 bg-gray-50 avoid-break">
                    <div className="text-xs font-bold mb-2 uppercase border-b border-gray-300 pb-1">Photos - {room.name}</div>
                    <div className="grid grid-cols-4 gap-2">
                         {room.photos.map((photo, pIndex) => (<div key={photo.id} className="avoid-break">
                                <div className="aspect-[4/3] w-full overflow-hidden border border-gray-300 bg-white relative">
                                    <img src={photo.previewUrl} className="w-full h-full object-cover" alt="Inspection"/>
                                    <div className="absolute bottom-0 right-0 text-[8px] bg-white/80 px-1 border-tl border-gray-200">
                                        #{pIndex + 1}
                                    </div>
                                </div>
                            </div>))}
                    </div>
                </div>)}
          </div>))}
      </div>
    </div>);
};
exports.default = PDFPreview;
