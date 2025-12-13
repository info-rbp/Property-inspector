import React from 'react';
import { 
  LayoutDashboard, 
  Book, 
  AlertTriangle, 
  Home, 
  MessageSquare, 
  ShieldCheck, 
  Play,
  Database
} from 'lucide-react';

interface NavProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export const Navigation: React.FC<NavProps> = ({ currentView, onChangeView }) => {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { type: 'divider', label: 'Core Standards' },
    { id: 'defects', label: 'Defect Taxonomy', icon: Book },
    { id: 'severity', label: 'Severity Rules', icon: AlertTriangle },
    { id: 'rooms', label: 'Room Standards', icon: Home },
    { id: 'phrasing', label: 'Phrasing Library', icon: MessageSquare },
    { id: 'guardrails', label: 'Analysis Guardrails', icon: ShieldCheck },
    { type: 'divider', label: 'Integration' },
    { id: 'simulator', label: 'Context Simulator', icon: Play },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <Database className="text-blue-500" />
          <span>Knowledge<span className="text-blue-500">DB</span></span>
        </div>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Authoritative Source</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item, idx) => {
            if (item.type === 'divider') {
              return (
                <li key={idx} className="px-6 py-3 mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.label}
                </li>
              );
            }

            const Icon = item.icon!;
            const active = currentView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onChangeView(item.id)}
                  className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                    active 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 border-r-2 border-white' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-blue-200' : 'text-slate-400'} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Admin User</span>
            <span className="text-xs text-slate-500">Platform Engineer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
