import React from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  title: string;
  actions?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView,
  title,
  actions
}) => {
  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <Navigation currentView={currentView} onChangeView={onChangeView} />
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">Versioned Standards Management</p>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </header>

      <main className="p-8">
        {children}
      </main>
    </div>
  );
};
