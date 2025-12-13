import { ServiceCardData, ServiceHealth, ServiceReady, TestRun, TestStep, SyntheticTestType, TenantDetail } from '../types';

// MOCK CONSTANTS
const SERVICES = [
  'Gateway', 'Identity', 'Media', 'Jobs', 'Billing', 'Audit', 
  'Report', 'Branding', 'Notifications', 'Standards', 'Analysis'
];

const DELAY = (ms: number) => new Promise(res => setTimeout(res, ms));

const randomId = () => Math.random().toString(36).substring(7);

// SIMULATED BACKEND STATE
let mockTestHistory: TestRun[] = [];

// MOCK SERVICE BEHAVIOR
const mockServiceCall = async (serviceName: string, endpoint: 'health' | 'ready'): Promise<any> => {
  // Simulate Network Latency
  const latency = Math.floor(Math.random() * 300) + 50; 
  await DELAY(latency);

  // Simulate Occasional Failure
  if (Math.random() > 0.98) {
    throw new Error("Network Error");
  }

  // Common Health Response
  if (endpoint === 'health') {
    return {
      status: 'ok',
      service: serviceName.toLowerCase() + '-service',
      version: 'v1.4.2',
      commitSha: '8f3a2b1',
      buildTime: new Date(Date.now() - 86400000).toISOString(),
      latencyMs: latency
    } as ServiceHealth;
  }

  // Common Ready Response
  if (endpoint === 'ready') {
    const isDegraded = Math.random() > 0.9;
    return {
      status: isDegraded ? 'degraded' : 'ready',
      latencyMs: latency,
      checks: [
        { name: 'database', status: 'pass', latencyMs: 12, details: { kind: 'postgres' } },
        { name: 'auth_provider', status: 'pass', latencyMs: 45 },
        { name: 'internal_api', status: isDegraded ? 'warn' : 'pass', latencyMs: isDegraded ? 800 : 60, details: isDegraded ? { reason: 'high_latency' } : {} }
      ],
      dependencies: {
        criticalFailures: 0,
        warnings: isDegraded ? 1 : 0
      }
    } as ServiceReady;
  }
};

/**
 * DIAGNOSTICS API LAYER
 * In a real app, these would be server-side Next.js API Routes
 */
export const diagnosticsApi = {
  
  // GET /api/diag/overview
  getOverview: async (): Promise<ServiceCardData[]> => {
    // Fan-out pattern simulation
    const promises = SERVICES.map(async (name) => {
      const start = performance.now();
      try {
        const [health, ready] = await Promise.all([
           mockServiceCall(name, 'health'),
           mockServiceCall(name, 'ready')
        ]);
        return {
          name,
          baseUrl: `https://${name.toLowerCase()}.internal`,
          health,
          ready,
          lastCheckedAt: new Date().toISOString(),
          isLoading: false
        };
      } catch (e) {
        return {
          name,
          baseUrl: `https://${name.toLowerCase()}.internal`,
          health: null,
          ready: { status: 'not_ready', checks: [], dependencies: { criticalFailures: 1, warnings: 0 }, latencyMs: 0 },
          lastCheckedAt: new Date().toISOString(),
          isLoading: false
        };
      }
    });
    return Promise.all(promises);
  },

  // GET /api/diag/service?name=
  getServiceDetails: async (name: string) => {
    return mockServiceCall(name, 'ready');
  },

  // POST /api/diag/tests/run
  runSyntheticTest: async (type: SyntheticTestType, updateCallback: (run: TestRun) => void): Promise<void> => {
    const runId = `run-${randomId()}`;
    const correlationId = `corr-${randomId()}`;
    
    let currentRun: TestRun = {
      id: runId,
      testType: type,
      environment: 'staging',
      startTime: new Date().toISOString(),
      status: 'running',
      correlationId,
      steps: []
    };

    const addStep = (name: string) => {
      currentRun.steps.push({ 
        name, 
        status: 'running', 
        latencyMs: 0, 
        requestId: `req-${randomId()}` 
      });
      updateCallback({...currentRun});
    };

    const completeStep = (index: number, status: 'pass' | 'fail', details?: string) => {
      currentRun.steps[index].status = status;
      currentRun.steps[index].latencyMs = Math.floor(Math.random() * 200) + 50;
      currentRun.steps[index].details = details;
      if (status === 'fail') currentRun.status = 'fail';
      updateCallback({...currentRun});
    };

    // Simulate Workflow Steps
    const steps = [
      { name: 'Gateway: Create Inspection', failChance: 0.1 },
      { name: 'Media: Initiate Upload', failChance: 0.1 },
      { name: 'Gateway: Attach Media', failChance: 0.05 },
      { name: 'Jobs: Trigger Analysis', failChance: 0.05 },
      { name: 'Jobs: Poll Completion', failChance: 0.1 },
      { name: 'Report: Generate PDF', failChance: 0.1 },
      { name: 'Gateway: Finalize', failChance: 0.05 }
    ];

    mockTestHistory.unshift(currentRun);
    updateCallback({...currentRun});

    for (let i = 0; i < steps.length; i++) {
      if (currentRun.status === 'fail') break;
      
      addStep(steps[i].name);
      await DELAY(800); // Simulate processing time
      
      const success = Math.random() > steps[i].failChance;
      completeStep(i, success ? 'pass' : 'fail', success ? 'HTTP 200 OK' : 'HTTP 500 Internal Error');
    }

    if (currentRun.status === 'running') currentRun.status = 'pass';
    currentRun.endTime = new Date().toISOString();
    updateCallback({...currentRun});
  },

  // GET /api/admin/tenants
  searchTenants: async (query: string): Promise<TenantDetail[]> => {
    await DELAY(500);
    const mockTenants: TenantDetail[] = [
      { tenantId: 't-1', name: 'Acme Corp', plan: 'PRO', status: 'active', brandingVersion: 'v2', featureFlags: { beta: true } },
      { tenantId: 't-2', name: 'Beta Ltd', plan: 'BASIC', status: 'suspended', brandingVersion: 'v1', featureFlags: {} },
    ];
    return mockTenants.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  },

  // POST /api/admin/ops
  performOp: async (action: string, payload: any): Promise<boolean> => {
    await DELAY(1000);
    return true; // Always succeed for mock
  }
};