import React, { useState } from 'react';
import { diagnosticsApi } from '../services/diagnosticsApi';
import { TestRun, SyntheticTestType } from '../types';
import { Play, Check, X, Loader2, FileCode, Clock } from 'lucide-react';

export const TestRunner: React.FC = () => {
  const [activeRun, setActiveRun] = useState<TestRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (type: SyntheticTestType) => {
    setIsRunning(true);
    await diagnosticsApi.runSyntheticTest(type, (updatedRun) => {
      setActiveRun(updatedRun);
    });
    setIsRunning(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Test Scenarios</h3>
          <div className="space-y-3">
            <TestButton 
              label="Full Inspection Workflow" 
              desc="Create -> Upload -> Analyze -> Report"
              onClick={() => runTest('FULL_WORKFLOW')}
              disabled={isRunning}
            />
            <TestButton 
              label="Media Contract Test" 
              desc="Upload -> Retrieval -> Resizing"
              onClick={() => runTest('MEDIA_CONTRACT')}
              disabled={isRunning}
            />
            <TestButton 
              label="Report Generation Cycle" 
              desc="Template Load -> Gen -> Finalize"
              onClick={() => runTest('REPORT_CYCLE')}
              disabled={isRunning}
            />
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
           <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Test Context</h3>
           <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Environment:</span>
                <span className="font-mono text-blue-400">STAGING</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tenant:</span>
                <span className="font-mono text-yellow-400">test-runner-01</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>User Role:</span>
                <span className="font-mono text-purple-400">ADMIN</span>
              </div>
           </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-hidden flex flex-col">
        {activeRun ? (
          <>
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-800">
               <div>
                  <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
                    {activeRun.testType.replace('_', ' ')}
                    {activeRun.status === 'running' && <Loader2 className="animate-spin text-blue-500" size={20} />}
                    {activeRun.status === 'pass' && <Check className="text-green-500" size={24} />}
                    {activeRun.status === 'fail' && <X className="text-red-500" size={24} />}
                  </h2>
                  <div className="text-xs font-mono text-slate-500 flex gap-4">
                    <span>ID: {activeRun.id}</span>
                    <span>Corr: {activeRun.correlationId}</span>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-2xl font-mono text-white">
                     {activeRun.endTime ? 
                       `${(new Date(activeRun.endTime).getTime() - new Date(activeRun.startTime).getTime()) / 1000}s` : 
                       'Running...'}
                  </div>
                  <div className="text-xs text-slate-500">Duration</div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
               {activeRun.steps.map((step, idx) => (
                  <div key={idx} className={`p-3 rounded border flex items-center justify-between ${
                     step.status === 'pass' ? 'bg-green-500/5 border-green-500/20' :
                     step.status === 'fail' ? 'bg-red-500/5 border-red-500/20' :
                     step.status === 'running' ? 'bg-blue-500/5 border-blue-500/20' :
                     'bg-slate-800 border-slate-700 opacity-50'
                  }`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                           step.status === 'pass' ? 'bg-green-500 text-black' :
                           step.status === 'fail' ? 'bg-red-500 text-white' :
                           'bg-slate-700 text-slate-300'
                        }`}>
                           {idx + 1}
                        </div>
                        <div>
                           <div className="text-sm font-medium text-slate-200">{step.name}</div>
                           {step.details && <div className="text-xs text-slate-500 mt-0.5">{step.details}</div>}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-mono text-slate-400">{step.latencyMs > 0 ? `${step.latencyMs}ms` : '-'}</div>
                        <div className="text-[10px] text-slate-600 font-mono">{step.requestId}</div>
                     </div>
                  </div>
               ))}
            </div>
          </>
        ) : (
           <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <FileCode size={48} className="mb-4 opacity-50" />
              <p>Select a test scenario to begin diagnostics.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const TestButton = ({ label, desc, onClick, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className="w-full text-left p-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="flex justify-between items-center mb-1">
      <span className="font-bold text-slate-200 group-hover:text-blue-400">{label}</span>
      <Play size={16} className="text-slate-500 group-hover:text-blue-400" />
    </div>
    <div className="text-xs text-slate-500">{desc}</div>
  </button>
);
