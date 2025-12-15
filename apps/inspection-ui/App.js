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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_2 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const ConditionReport_1 = __importDefault(require("./components/ConditionReport"));
const ClientManager_1 = __importDefault(require("./components/ClientManager"));
const ProposalGenerator_1 = __importDefault(require("./components/ProposalGenerator"));
const Settings_1 = __importDefault(require("./components/Settings"));
const FeatureRequest_1 = __importDefault(require("./components/FeatureRequest"));
const App = () => {
    const [activeTool, setActiveTool] = (0, react_2.useState)('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, react_2.useState)(false);
    const getActiveComponent = () => {
        switch (activeTool) {
            case 'condition-report':
                return <ConditionReport_1.default key="entry" reportType="Entry"/>;
            case 'routine-inspection':
                return <ConditionReport_1.default key="routine" reportType="Routine"/>;
            case 'exit-inspection':
                return <ConditionReport_1.default key="exit" reportType="Exit"/>;
            case 'clients':
                return <ClientManager_1.default />;
            case 'proposals':
                return <ProposalGenerator_1.default />;
            case 'settings':
                return <Settings_1.default />;
            case 'feature-request':
                return <FeatureRequest_1.default />;
            default:
                return null;
        }
    };
    const NavButton = ({ tool, icon: Icon, label }) => (<button onClick={() => { setActiveTool(tool); setIsMobileMenuOpen(false); }} className={`text-sm font-medium transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg ${activeTool === tool ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
      <Icon size={18}/>
      {label}
    </button>);
    return (<div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTool('dashboard')}>
              <div className="w-9 h-9 bg-blue-800 rounded-lg text-white flex items-center justify-center font-bold text-lg shadow-sm">
                RB
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Remote Business Partner</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-2">
              <NavButton tool="dashboard" icon={lucide_react_1.LayoutDashboard} label="Dashboard"/>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <NavButton tool="condition-report" icon={lucide_react_1.FileText} label="Entry Report"/>
              <NavButton tool="routine-inspection" icon={lucide_react_1.ClipboardCheck} label="Routine"/>
              <NavButton tool="exit-inspection" icon={lucide_react_1.LogOut} label="Exit"/>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <NavButton tool="clients" icon={lucide_react_1.Building} label="Properties"/>
              <NavButton tool="proposals" icon={lucide_react_1.FileOutput} label="Proposals"/>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <NavButton tool="feature-request" icon={lucide_react_1.Lightbulb} label="Features"/>
              <NavButton tool="settings" icon={lucide_react_1.Settings} label="Settings"/>
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-4 xl:hidden">
              <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <lucide_react_1.X size={24}/> : <lucide_react_1.Menu size={24}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (<div className="xl:hidden bg-white border-t border-gray-200 px-4 pt-2 pb-4 shadow-lg absolute w-full z-50">
             <div className="flex flex-col gap-2">
               <NavButton tool="dashboard" icon={lucide_react_1.LayoutDashboard} label="Dashboard"/>
               <NavButton tool="condition-report" icon={lucide_react_1.FileText} label="Entry Report"/>
               <NavButton tool="routine-inspection" icon={lucide_react_1.ClipboardCheck} label="Routine Inspection"/>
               <NavButton tool="exit-inspection" icon={lucide_react_1.LogOut} label="Exit Inspection"/>
               <NavButton tool="clients" icon={lucide_react_1.Building} label="Properties"/>
               <NavButton tool="proposals" icon={lucide_react_1.FileOutput} label="Proposals"/>
               <NavButton tool="feature-request" icon={lucide_react_1.Lightbulb} label="Feature Request"/>
               <NavButton tool="settings" icon={lucide_react_1.Settings} label="Settings"/>
             </div>
          </div>)}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTool === 'dashboard' ? (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, Admin</h1>
                <p className="text-gray-500">Select a tool below to get started with your property management tasks.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Reports Group */}
                <div onClick={() => setActiveTool('condition-report')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <lucide_react_1.FileText size={28}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Entry Condition Report</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Create comprehensive entry condition reports including photos, AI-assisted commentary, and formatting for print/PDF.
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Start Report <lucide_react_1.ArrowRight size={16} className="ml-1"/>
                    </div>
                </div>

                <div onClick={() => setActiveTool('routine-inspection')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                        <lucide_react_1.ClipboardCheck size={28}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Routine Inspection</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Conduct periodic routine inspections with AI analysis and streamlined reporting.
                    </p>
                    <div className="flex items-center text-green-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Start Inspection <lucide_react_1.ArrowRight size={16} className="ml-1"/>
                    </div>
                </div>

                <div onClick={() => setActiveTool('exit-inspection')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                        <lucide_react_1.LogOut size={28}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Exit Inspection</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Generate final exit reports, comparing conditions and identifying bond deductions efficiently.
                    </p>
                    <div className="flex items-center text-orange-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Start Exit Report <lucide_react_1.ArrowRight size={16} className="ml-1"/>
                    </div>
                </div>

                {/* Management Group */}
                <div onClick={() => setActiveTool('clients')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <lucide_react_1.Building size={28}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Property Manager</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Manage your property portfolio, owner details, keys, and tenant assignments.
                    </p>
                    <div className="flex items-center text-purple-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        View Properties <lucide_react_1.ArrowRight size={16} className="ml-1"/>
                    </div>
                </div>

                <div onClick={() => setActiveTool('proposals')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                        <lucide_react_1.FileOutput size={28}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Proposal Generator</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Create professional management proposals and agreements for new landlords in minutes.
                    </p>
                    <div className="flex items-center text-indigo-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Create Proposal <lucide_react_1.ArrowRight size={16} className="ml-1"/>
                    </div>
                </div>

                <div onClick={() => setActiveTool('feature-request')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
                        <lucide_react_1.Lightbulb size={28}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Feature Request</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Submit ideas and requests for new features to help improve the platform.
                    </p>
                    <div className="flex items-center text-yellow-700 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Request Feature <lucide_react_1.ArrowRight size={16} className="ml-1"/>
                    </div>
                </div>

                <div onClick={() => setActiveTool('settings')} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                        <lucide_react_1.Settings size={28}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Configure company details, branding, API keys, and application preferences.
                    </p>
                    <div className="flex items-center text-gray-700 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Manage Settings <lucide_react_1.ArrowRight size={16} className="ml-1"/>
                    </div>
                </div>

             </div>
          </div>) : (getActiveComponent())}
      </main>

    </div>);
};
exports.default = App;
