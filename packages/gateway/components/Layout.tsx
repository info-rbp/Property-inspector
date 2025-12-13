import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  LogOut,
  Bell
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: 'dashboard') => void;
  tenantName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, tenantName }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              G
            </div>
            <span className="text-lg font-semibold tracking-tight">Gateway App</span>
          </div>
          {tenantName && (
            <div className="mt-2 text-xs text-slate-400 uppercase tracking-wider truncate">
              {tenantName}
            </div>
          )}
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700 transition-colors"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <ClipboardList size={18} />
            Inspections
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings size={18} />
            Settings
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-700">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">
            Inspection Management
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-medium">
              JD
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-auto scroller p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
