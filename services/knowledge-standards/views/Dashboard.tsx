import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StandardType, StandardStatus } from '../types';
import { knowledgeStore } from '../services/knowledgeStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, GitCommit, Layers, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onChangeView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const [stats, setStats] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

  useEffect(() => {
    const allItems = knowledgeStore.getAll();
    
    // Calculate counts
    const counts = {
      [StandardType.DEFECT]: 0,
      [StandardType.SEVERITY]: 0,
      [StandardType.ROOM]: 0,
      [StandardType.PHRASING]: 0,
      [StandardType.GUARDRAIL]: 0,
    };

    allItems.forEach(item => {
      if (item.status === StandardStatus.ACTIVE) {
        counts[item.type]++;
      }
    });

    const chartData = [
      { name: 'Defects', count: counts[StandardType.DEFECT], color: '#3b82f6' },
      { name: 'Severity', count: counts[StandardType.SEVERITY], color: '#ef4444' },
      { name: 'Rooms', count: counts[StandardType.ROOM], color: '#10b981' },
      { name: 'Phrasing', count: counts[StandardType.PHRASING], color: '#8b5cf6' },
      { name: 'Guardrails', count: counts[StandardType.GUARDRAIL], color: '#f59e0b' },
    ];

    setStats(chartData);
    setRecentUpdates(allItems.slice(0, 5));
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={color} size={24} />
      </div>
    </div>
  );

  return (
    <Layout title="Knowledge Graph Overview" currentView="dashboard" onChangeView={onChangeView}>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Standards" 
          value={stats.reduce((acc, curr) => acc + curr.count, 0)} 
          icon={Layers} 
          color="text-blue-600" 
        />
        <StatCard 
          title="Defect Types" 
          value={stats.find(s => s.name === 'Defects')?.count || 0} 
          icon={Activity} 
          color="text-emerald-600" 
        />
        <StatCard 
          title="Total Versions" 
          value={knowledgeStore.getAll().length} 
          icon={GitCommit} 
          color="text-purple-600" 
        />
         <div className="bg-slate-900 p-6 rounded-xl shadow-sm flex flex-col justify-center items-start cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => onChangeView('simulator')}>
          <p className="text-blue-400 font-bold mb-1 flex items-center gap-2">
            <RefreshCw size={16} /> Simulator
          </p>
          <p className="text-white text-lg font-semibold">Test Retrieval Engine &rarr;</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Distribution by Domain</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Updates</h3>
          <div className="space-y-4">
            {recentUpdates.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className={`mt-1 w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-500">{item.type.split('_')[0]}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">v{item.version}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-1 line-clamp-1">
                    {/* Dynamic label based on type */}
                    {item.code || item.severityLevel || item.roomType || item.context || item.ruleKey}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(item.updatedAt).toLocaleDateString()} by {item.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
