"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLayout = void 0;
const react_2 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const AdminLayout = ({ children, currentView, onNavigate }) => {
    const NavItem = ({ view, icon: Icon, label }) => (<button onClick={() => onNavigate(view)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${currentView === view
            ? 'bg-slate-800 text-blue-400 border border-slate-700'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={18}/>
      {label}
    </button>);
    return (<div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row font-mono">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/50">
              <lucide_react_1.Terminal size={18}/>
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-white">Platform Ops</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Internal Console</span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider px-4 mb-2 mt-2">Observability</div>
          <NavItem view="dashboard" icon={lucide_react_1.LayoutGrid} label="Service Overview"/>
          <NavItem view="tests" icon={lucide_react_1.Activity} label="Synthetic Tests"/>
          
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider px-4 mb-2 mt-6">Administration</div>
          <NavItem view="tenants" icon={lucide_react_1.Users} label="Tenant Management"/>
          <NavItem view="ops" icon={lucide_react_1.Settings} label="Ops Actions"/>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 text-xs text-slate-500 flex justify-between items-center">
             <span>Env: <span className="text-green-400">PROD</span></span>
             <span>v2.4.0</span>
          </div>
          <button className="w-full mt-2 flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/30 rounded-lg transition-colors">
            <lucide_react_1.LogOut size={16}/>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black/20">
        <header className="h-14 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-400">
             <span className="text-slate-600">Context:</span>
             <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-xs font-medium text-green-500">System Operational</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {children}
        </main>
      </div>
    </div>);
};
exports.AdminLayout = AdminLayout;
