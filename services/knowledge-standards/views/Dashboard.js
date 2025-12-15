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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = void 0;
const react_2 = __importStar(require("react"));
const Layout_1 = require("../components/Layout");
const types_2 = require("../types");
const knowledgeStore_1 = require("../services/knowledgeStore");
const recharts_1 = require("recharts");
const lucide_react_1 = require("lucide-react");
const Dashboard = ({ onChangeView }) => {
    const [stats, setStats] = (0, react_2.useState)([]);
    const [recentUpdates, setRecentUpdates] = (0, react_2.useState)([]);
    (0, react_2.useEffect)(() => {
        const allItems = knowledgeStore_1.knowledgeStore.getAll();
        // Calculate counts
        const counts = {
            [types_2.StandardType.DEFECT]: 0,
            [types_2.StandardType.SEVERITY]: 0,
            [types_2.StandardType.ROOM]: 0,
            [types_2.StandardType.PHRASING]: 0,
            [types_2.StandardType.GUARDRAIL]: 0,
        };
        allItems.forEach(item => {
            if (item.status === types_2.StandardStatus.ACTIVE) {
                counts[item.type]++;
            }
        });
        const chartData = [
            { name: 'Defects', count: counts[types_2.StandardType.DEFECT], color: '#3b82f6' },
            { name: 'Severity', count: counts[types_2.StandardType.SEVERITY], color: '#ef4444' },
            { name: 'Rooms', count: counts[types_2.StandardType.ROOM], color: '#10b981' },
            { name: 'Phrasing', count: counts[types_2.StandardType.PHRASING], color: '#8b5cf6' },
            { name: 'Guardrails', count: counts[types_2.StandardType.GUARDRAIL], color: '#f59e0b' },
        ];
        setStats(chartData);
        setRecentUpdates(allItems.slice(0, 5));
    }, []);
    const StatCard = ({ title, value, icon: Icon, color }) => (<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={color} size={24}/>
      </div>
    </div>);
    return (<Layout_1.Layout title="Knowledge Graph Overview" currentView="dashboard" onChangeView={onChangeView}>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Standards" value={stats.reduce((acc, curr) => acc + curr.count, 0)} icon={lucide_react_1.Layers} color="text-blue-600"/>
        <StatCard title="Defect Types" value={stats.find(s => s.name === 'Defects')?.count || 0} icon={lucide_react_1.Activity} color="text-emerald-600"/>
        <StatCard title="Total Versions" value={knowledgeStore_1.knowledgeStore.getAll().length} icon={lucide_react_1.GitCommit} color="text-purple-600"/>
         <div className="bg-slate-900 p-6 rounded-xl shadow-sm flex flex-col justify-center items-start cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => onChangeView('simulator')}>
          <p className="text-blue-400 font-bold mb-1 flex items-center gap-2">
            <lucide_react_1.RefreshCw size={16}/> Simulator
          </p>
          <p className="text-white text-lg font-semibold">Test Retrieval Engine &rarr;</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Distribution by Domain</h3>
          <div className="h-64">
            <recharts_1.ResponsiveContainer width="100%" height="100%">
              <recharts_1.BarChart data={stats}>
                <recharts_1.XAxis dataKey="name" axisLine={false} tickLine={false}/>
                <recharts_1.YAxis axisLine={false} tickLine={false}/>
                <recharts_1.Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                <recharts_1.Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {stats.map((entry, index) => (<recharts_1.Cell key={`cell-${index}`} fill={entry.color}/>))}
                </recharts_1.Bar>
              </recharts_1.BarChart>
            </recharts_1.ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Updates</h3>
          <div className="space-y-4">
            {recentUpdates.map((item) => (<div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className={`mt-1 w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}/>
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
              </div>))}
          </div>
        </div>
      </div>
    </Layout_1.Layout>);
};
exports.Dashboard = Dashboard;
