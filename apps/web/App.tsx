import React, { useState } from 'react';
import { LayoutDashboard, FileText, ChevronRight, Menu, X, ArrowRight, ClipboardCheck, LogOut, Users, Settings as SettingsIcon, FileOutput, Lightbulb, Building, ChevronsLeft, ChevronsRight } from 'lucide-react';
import ConditionReport from './components/ConditionReport';
import ClientManager from './components/ClientManager';
import ProposalGenerator from './components/ProposalGenerator';
import Settings from './components/Settings';
import FeatureRequest from './components/FeatureRequest';
import RemoteManager from './components/RemoteManager';
import TenantInspection from './components/TenantInspection';

type ActiveTool = 'dashboard' | 'condition-report' | 'routine-inspection' | 'exit-inspection' | 'clients' | 'proposals' | 'settings' | 'feature-request' | 'remote-inspection';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const getActiveComponent = () => {
    switch (activeTool) {
      case 'condition-report':
        return <ConditionReport key="entry" reportType="Entry" />;
      case 'routine-inspection':
        return <ConditionReport key="routine" reportType="Routine" />;
      case 'exit-inspection':
        return <ConditionReport key="exit" reportType="Exit" />;
      case 'clients':
        return <ClientManager />;
      case 'proposals':
        return <ProposalGenerator />;
      case 'settings':
        return <Settings />;
      case 'feature-request':
        return <FeatureRequest />;
      case 'remote-inspection':
        return <RemoteManager />;
      default:
        const url = new URL(window.location.href);
        if (url.pathname.startsWith('/remote/')) {
          const token = url.pathname.split('/').pop();
          return <TenantInspection token={token} />;
        }
        return null;
    }
  };
  
  const NavButton = ({ tool, icon: Icon, label, isExpanded }: { tool: ActiveTool; icon: any; label: string, isExpanded: boolean }) => (
    <button 
      onClick={() => setActiveTool(tool)}
      className={`w-full text-sm font-medium transition-colors duration-200 flex items-center gap-3 px-3 py-2 rounded-lg ${
        activeTool === tool ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon size={18} />
      {isExpanded && <span className='truncate'>{label}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between h-16 p-4 border-b border-gray-200">
          {isSidebarExpanded && (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTool('dashboard')}>
              <div className="w-9 h-9 bg-blue-800 rounded-lg text-white flex items-center justify-center font-bold text-lg shadow-sm">
                RB
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">RBP</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            {isSidebarExpanded ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <NavButton tool="dashboard" icon={LayoutDashboard} label="Dashboard" isExpanded={isSidebarExpanded} />
            <div className="h-px bg-gray-200 my-2"></div>
            <NavButton tool="condition-report" icon={FileText} label="Entry Report" isExpanded={isSidebarExpanded} />
            <NavButton tool="routine-inspection" icon={ClipboardCheck} label="Routine" isExpanded={isSidebarExpanded} />
            <NavButton tool="exit-inspection" icon={LogOut} label="Exit" isExpanded={isSidebarExpanded} />
            <NavButton tool="remote-inspection" icon={Users} label="Remote" isExpanded={isSidebarExpanded} />
            <div className="h-px bg-gray-200 my-2"></div>
            <NavButton tool="clients" icon={Building} label="Properties" isExpanded={isSidebarExpanded} />
            <NavButton tool="proposals" icon={FileOutput} label="Proposals" isExpanded={isSidebarExpanded} />
            <div className="h-px bg-gray-200 my-2"></div>
            <NavButton tool="feature-request" icon={Lightbulb} label="Features" isExpanded={isSidebarExpanded} />
            <NavButton tool="settings" icon={SettingsIcon} label="Settings" isExpanded={isSidebarExpanded} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTool === 'dashboard' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, Admin</h1>
                <p className="text-gray-500">Select a tool below to get started with your property management tasks.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Reports Group */}
                <div 
                  onClick={() => setActiveTool('condition-report')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Entry Condition Report</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Create comprehensive entry condition reports including photos, AI-assisted commentary, and formatting for print/PDF.
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Start Report <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                <div 
                  onClick={() => setActiveTool('routine-inspection')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                        <ClipboardCheck size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Routine Inspection</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Conduct periodic routine inspections with AI analysis and streamlined reporting.
                    </p>
                    <div className="flex items-center text-green-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Start Inspection <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                <div 
                  onClick={() => setActiveTool('exit-inspection')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                        <LogOut size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Exit Inspection</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Generate final exit reports, comparing conditions and identifying bond deductions efficiently.
                    </p>
                    <div className="flex items-center text-orange-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Start Exit Report <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>
                
                <div 
                  onClick={() => setActiveTool('remote-inspection')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors">
                        <Users size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Remote Inspection</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Manage and review tenant-led remote inspections.
                    </p>
                    <div className="flex items-center text-cyan-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Manage Remotes <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                {/* Management Group */}
                <div 
                  onClick={() => setActiveTool('clients')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <Building size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Property Manager</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Manage your property portfolio, owner details, keys, and tenant assignments.
                    </p>
                    <div className="flex items-center text-purple-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        View Properties <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                <div 
                  onClick={() => setActiveTool('proposals')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                        <FileOutput size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Proposal Generator</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Create professional management proposals and agreements for new landlords in minutes.
                    </p>
                    <div className="flex items-center text-indigo-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Create Proposal <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                <div 
                  onClick={() => setActiveTool('feature-request')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
                        <Lightbulb size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Feature Request</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Submit ideas and requests for new features to help improve the platform.
                    </p>
                    <div className="flex items-center text-yellow-700 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Request Feature <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

                <div 
                  onClick={() => setActiveTool('settings')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-400 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                        <SettingsIcon size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Configure company details, branding, API keys, and application preferences.
                    </p>
                    <div className="flex items-center text-gray-700 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        Manage Settings <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>

             </div>
          </div>
        ) : (
          <div className="w-full h-full p-4"><div className="bg-white w-full h-full rounded-lg shadow-sm">{getActiveComponent()}</div></div>
        )}
      </main>

    </div>
  );
};

export default App;