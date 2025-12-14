import React, { useEffect, useState } from 'react';
import { diagnosticsApi } from '../services/diagnosticsApi';
import { ServiceCardData } from '../types';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Clock, Server, ArrowRight } from 'lucide-react';

interface ServiceGridProps {
  onSelectService: (name: string) => void;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({ onSelectService }) => {
  const [services, setServices] = useState<ServiceCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOverview = async () => {
    setLoading(true);
    const data = await diagnosticsApi.getOverview();
    setServices(data);
    setLoading(false);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Service Health Overview</h2>
          <p className="text-slate-400 text-sm">Real-time status of all platform microservices</p>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-xs text-slate-500">
             Last check: {lastRefreshed.toLocaleTimeString()}
           </span>
           <button 
             onClick={fetchOverview} 
             disabled={loading}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50"
           >
             <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
             Refresh
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map(svc => (
          <ServiceCard key={svc.name} service={svc} onSelect={() => onSelectService(svc.name)} />
        ))}
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{ service: ServiceCardData, onSelect: () => void }> = ({ service, onSelect }) => {
  const status = service.ready?.status || 'unknown';
  
  const statusColor = {
    ready: 'bg-green-500/10 border-green-500/30 text-green-500',
    degraded: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
    not_ready: 'bg-red-500/10 border-red-500/30 text-red-500',
    unknown: 'bg-slate-500/10 border-slate-500/30 text-slate-500'
  }[status];

  const StatusIcon = {
    ready: CheckCircle,
    degraded: AlertTriangle,
    not_ready: XCircle,
    unknown: Clock
  }[status];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${statusColor}`}>
            <StatusIcon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-200">{service.name}</h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">
              v{service.health?.version || '?.?.?'}
            </span>
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>

      <div className="space-y-3 mb-4">
        <Metric label="Health Latency" value={`${service.health?.latencyMs || '-'}ms`} />
        <Metric label="Ready Latency" value={`${service.ready?.latencyMs || '-'}ms`} />
        <Metric label="Commit" value={service.health?.commitSha || '-------'} />
      </div>

      <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
        <span className="text-xs text-slate-500">
           {service.ready?.dependencies.criticalFailures ? 
              `${service.ready.dependencies.criticalFailures} Critical Fails` : 
              'Dependencies OK'}
        </span>
        <button onClick={onSelect} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Details <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-mono text-slate-300">{value}</span>
  </div>
);
