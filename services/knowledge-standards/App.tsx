import React, { useState } from 'react';
import { Dashboard } from './views/Dashboard';
import { StandardsManager } from './views/StandardsManager';
import { Simulator } from './views/Simulator';
import { StandardType } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onChangeView={setCurrentView} />;
      
      case 'defects':
        return <StandardsManager type={StandardType.DEFECT} title="Defect Taxonomy" currentView={currentView} onChangeView={setCurrentView} />;
      
      case 'severity':
        return <StandardsManager type={StandardType.SEVERITY} title="Severity Rules" currentView={currentView} onChangeView={setCurrentView} />;
      
      case 'rooms':
        return <StandardsManager type={StandardType.ROOM} title="Room Standards" currentView={currentView} onChangeView={setCurrentView} />;
      
      case 'phrasing':
        return <StandardsManager type={StandardType.PHRASING} title="Approved Phrasing" currentView={currentView} onChangeView={setCurrentView} />;
      
      case 'guardrails':
        return <StandardsManager type={StandardType.GUARDRAIL} title="Analysis Guardrails" currentView={currentView} onChangeView={setCurrentView} />;
      
      case 'simulator':
        return <Simulator onChangeView={setCurrentView} />;
        
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="text-slate-800 font-sans">
      {renderView()}
    </div>
  );
}
