import React, { useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { ServiceGrid } from './components/ServiceGrid';
import { TestRunner } from './components/TestRunner';
import { OpsPanel } from './components/OpsPanel';
import { ViewState } from './types';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
    setSelectedService(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <ServiceGrid onSelectService={(name) => { console.log('Selected', name); }} />;
      case 'tests':
        return <TestRunner />;
      case 'tenants':
      case 'ops':
        return <OpsPanel />;
      default:
        return <ServiceGrid onSelectService={() => {}} />;
    }
  };

  return (
    <AdminLayout currentView={view} onNavigate={handleNavigate}>
      {renderContent()}
    </AdminLayout>
  );
}
