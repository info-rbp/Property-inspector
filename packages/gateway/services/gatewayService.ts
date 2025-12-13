import { 
  Inspection, InspectionStatus, ReportStatus, Room, RoomType, Component, 
  Issue, IssueSeverity, IssueSource, MediaReference, MediaLabel,
  Job, JobStatus, JobType, UploadInitiationResponse,
  UserRole, SecurityContext, ChatMessage, BootstrapResponse, ErrorCode, 
  AiIssueResolution, InspectionType
} from '../types';

/**
 * GATEWAY ORCHESTRATION & SECURITY SPECIFICATION
 */

// ... [RBAC_MATRIX and SecurityKernel kept same as previous, re-included for context] ...
type ActionType = 'READ_INSPECTION' | 'CREATE_INSPECTION' | 'UPDATE_INSPECTION' | 'UPLOAD_MEDIA' | 'TRIGGER_ANALYSIS' | 'GENERATE_REPORT' | 'FINALIZE_REPORT' | 'INTERNAL_WEBHOOK' | 'CHAT_INTERACTION'; 

const RBAC_MATRIX: Record<ActionType, UserRole[]> = {
  READ_INSPECTION:   [UserRole.ADMIN, UserRole.INSPECTOR, UserRole.VIEWER],
  CREATE_INSPECTION: [UserRole.ADMIN, UserRole.INSPECTOR],
  UPDATE_INSPECTION: [UserRole.ADMIN, UserRole.INSPECTOR],
  UPLOAD_MEDIA:      [UserRole.ADMIN, UserRole.INSPECTOR],
  TRIGGER_ANALYSIS:  [UserRole.ADMIN, UserRole.INSPECTOR],
  GENERATE_REPORT:   [UserRole.ADMIN, UserRole.INSPECTOR],
  FINALIZE_REPORT:   [UserRole.ADMIN], 
  INTERNAL_WEBHOOK:  [UserRole.SYSTEM_SERVICE],
  CHAT_INTERACTION:  [UserRole.ADMIN, UserRole.INSPECTOR, UserRole.VIEWER]
};

const SecurityKernel = {
  authorize(action: ActionType, resource: { tenant_id: string, status?: InspectionStatus } | null, context: SecurityContext) {
    if (!context || !context.userId) throw new Error(`${ErrorCode.UNAUTHENTICATED}: Missing Identity`);
    if (resource) {
       if (context.role !== UserRole.SYSTEM_SERVICE && resource.tenant_id !== context.tenantId) {
         throw new Error(`${ErrorCode.TENANT_MISMATCH}: Access Denied`);
       }
       const isMutative = ['UPDATE_INSPECTION', 'UPLOAD_MEDIA', 'TRIGGER_ANALYSIS', 'FINALIZE_REPORT'].includes(action);
       if (isMutative && resource.status === InspectionStatus.FINALIZED) {
         throw new Error(`${ErrorCode.INSPECTION_FINALIZED}: Immutable`);
       }
    }
    if (!RBAC_MATRIX[action].includes(context.role)) {
      throw new Error(`${ErrorCode.FORBIDDEN_ROLE}: Insufficient Permissions`);
    }
  },
  getEffectiveContext(): SecurityContext {
    return { userId: 'user-1', tenantId: 'tenant-abc', role: UserRole.INSPECTOR, email: 'inspector@example.com' };
  },
  validateServiceAuth(secret: string): SecurityContext {
    return { userId: 'system-orchestrator', tenantId: 'system', role: UserRole.SYSTEM_SERVICE };
  }
};

class GatewayService {
  
  async bootstrap(): Promise<BootstrapResponse> {
    return mockBackend.bootstrap(SecurityKernel.getEffectiveContext());
  }

  // --- CRUD ---
  async getInspections(): Promise<Inspection[]> { return mockBackend.getInspections(SecurityKernel.getEffectiveContext()); }
  async getInspection(id: string): Promise<Inspection> { return mockBackend.getInspection(id, SecurityKernel.getEffectiveContext()); }
  async getInspectionRooms(id: string): Promise<Room[]> { return mockBackend.getRooms(id, SecurityKernel.getEffectiveContext()); }
  async getRoomComponents(roomId: string): Promise<Component[]> { return mockBackend.getComponents(roomId, SecurityKernel.getEffectiveContext()); }
  async getComponentIssues(componentId: string): Promise<Issue[]> { return mockBackend.getIssues(componentId, SecurityKernel.getEffectiveContext()); }
  async getComponentMedia(componentId: string): Promise<MediaReference[]> { return mockBackend.getMedia(componentId, SecurityKernel.getEffectiveContext()); }

  async initiateUpload(componentId: string, file: File): Promise<UploadInitiationResponse> {
    return mockBackend.initiateUpload(componentId, file, SecurityKernel.getEffectiveContext());
  }
  async completeUpload(componentId: string, mediaId: string): Promise<MediaReference> {
    return mockBackend.completeUpload(componentId, mediaId, SecurityKernel.getEffectiveContext());
  }

  // --- COMPONENT EDITS (Human Wins) ---

  async updateComponentCondition(componentId: string, condition: Component['condition']): Promise<Component> {
    return mockBackend.updateComponent(componentId, { condition }, SecurityKernel.getEffectiveContext());
  }

  async updateComponentComment(componentId: string, comment: string): Promise<Component> {
    return mockBackend.updateComponent(componentId, { overview_comment: comment }, SecurityKernel.getEffectiveContext());
  }

  // --- ISSUE MANAGEMENT (Human vs AI) ---

  async createHumanIssue(componentId: string, issue: Partial<Issue>): Promise<Issue> {
    return mockBackend.createIssue(componentId, issue, SecurityKernel.getEffectiveContext());
  }

  /**
   * Resolve an AI issue (Accept/Reject/Override)
   * If Accepted/Overridden: Creates a new HUMAN issue and links it.
   * If Rejected: Marks AI issue as rejected.
   */
  async resolveAiIssue(aiIssueId: string, action: 'accept' | 'reject', overrideData?: Partial<Issue>): Promise<void> {
    return mockBackend.resolveAiIssue(aiIssueId, action, overrideData, SecurityKernel.getEffectiveContext());
  }

  // --- ORCHESTRATION ---

  async startAnalysis(inspectionId: string): Promise<Job> {
    return mockBackend.startAnalysisOrchestration(inspectionId, JobType.ANALYZE_INSPECTION, SecurityKernel.getEffectiveContext());
  }
  async startDeepAnalysis(inspectionId: string): Promise<Job> {
    return mockBackend.startAnalysisOrchestration(inspectionId, JobType.DEEP_ANALYSIS, SecurityKernel.getEffectiveContext());
  }
  async generateAudioSummary(inspectionId: string, text: string): Promise<Job> {
    return mockBackend.startAnalysisOrchestration(inspectionId, JobType.TTS_GENERATION, SecurityKernel.getEffectiveContext());
  }
  async generateReport(inspectionId: string): Promise<Job> {
    return mockBackend.startReportOrchestration(inspectionId, SecurityKernel.getEffectiveContext());
  }
  async getJobStatus(inspectionId: string): Promise<Job | null> {
    return mockBackend.getLatestJob(inspectionId, SecurityKernel.getEffectiveContext());
  }

  /**
   * Locks the inspection permanently.
   */
  async finalizeInspection(inspectionId: string): Promise<Inspection> {
    return mockBackend.finalizeInspection(inspectionId, SecurityKernel.getEffectiveContext());
  }

  async sendChatMessage(message: string, history: ChatMessage[]): Promise<ChatMessage> {
     SecurityKernel.authorize('CHAT_INTERACTION', null, SecurityKernel.getEffectiveContext());
     return mockBackend.chat(message, history);
  }
}

export const gatewayService = new GatewayService();

// --- REFERENCE BACKEND ---

const MOCK_DELAY_MS = 400;

// Data Stores
const dbInspections: Inspection[] = [
  {
    inspection_id: 'insp-001', tenant_id: 'tenant-abc', created_by_user_id: 'user-1',
    status: InspectionStatus.IN_PROGRESS, report_status: ReportStatus.NONE,
    inspection_type: InspectionType.ENTRY,
    property_address: { street_1: '123 Highland Ave', street_2: 'Apt 4B', city: 'San Francisco', state: 'CA', postal_code: '94110', country: 'US' },
    analysis_version: 1, created_at: '2023-10-25T09:00:00Z', updated_at: '2023-10-25T10:00:00Z'
  } as any,
];
// ... [dbRooms, dbMedia same as before] ...
const dbRooms: Record<string, Room[]> = { 'insp-001': [{ room_id: 'room-1', inspection_id: 'insp-001', tenant_id: 'tenant-abc', name: 'Living Room', room_type: RoomType.LIVING, sort_order: 1, created_at: '', updated_at: '' }] };
const dbMedia: Record<string, MediaReference[]> = {};
const dbJobs: Record<string, Job[]> = {};

// Updated Component Store with Metadata
const dbComponents: Record<string, Component[]> = {
  'room-1': [
    { 
      component_id: 'comp-1a', room_id: 'room-1', tenant_id: 'tenant-abc', name: 'Flooring', 
      condition: { is_clean: true, is_undamaged: true, is_working: true }, 
      human_edited_metadata: { condition_flags_edited: false, overview_comment_edited: false },
      created_at: '', updated_at: '' 
    },
  ]
};

// Updated Issue Store with Provenance
const dbIssues: Record<string, Issue[]> = {};

const mockBackend = {
  // ... [Standard getters omitted for brevity] ...
  async bootstrap(ctx: SecurityContext): Promise<BootstrapResponse> { 
    return { 
      user: { 
        userId: ctx.userId, 
        email: ctx.email || 'inspector@example.com',
        role: ctx.role,
        firstName: 'System',
        lastName: 'User'
      },
      tenant: {
        tenantId: ctx.tenantId,
        name: 'Acme Property Management',
        branding: {
          primaryColor: '#2563eb'
        }
      },
      entitlements: {
        canUseAiAnalysis: true,
        canUseDeepThinking: true,
        canUseTts: true,
        maxVideoUploadSizeMb: 500
      },
      featureFlags: {
        betaChatbot: true
      }
    };
  },
  async getInspections(ctx: SecurityContext) { return dbInspections.filter(i => i.tenant_id === ctx.tenantId); },
  async getInspection(id: string, ctx: SecurityContext) { return dbInspections.find(i => i.inspection_id === id)!; },
  async getRooms(id: string, ctx: SecurityContext) { return dbRooms[id] || []; },
  async getComponents(id: string, ctx: SecurityContext) { return dbComponents[id] || []; },
  async getIssues(id: string, ctx: SecurityContext) { return dbIssues[id] || []; },
  async getMedia(id: string, ctx: SecurityContext) { return dbMedia[id] || []; },
  
  async initiateUpload(componentId: string, file: File, ctx: SecurityContext) { return { upload_url: 'http://mock', media_id: '1', expires_at: '' }; },
  async completeUpload(componentId: string, mediaId: string, ctx: SecurityContext) { return { url: 'http://mock.img' } as any; },

  async updateComponent(componentId: string, updates: Partial<Component>, ctx: SecurityContext) {
    await delay();
    const roomId = Object.keys(dbComponents).find(rid => dbComponents[rid].find(c => c.component_id === componentId));
    const comp = dbComponents[roomId!]?.find(c => c.component_id === componentId);
    if (!comp) throw new Error("Not Found");

    // Check Lock
    // Find inspection ID by searching for the room in dbRooms
    let inspectionId: string | undefined;
    for (const [inspId, rooms] of Object.entries(dbRooms)) {
      if (rooms.some(r => r.room_id === comp.room_id)) {
        inspectionId = inspId;
        break;
      }
    }
    
    const inspection = dbInspections.find(i => i.inspection_id === inspectionId);
    // Assuming inspection is found and check lock:
    // SecurityKernel.authorize('UPDATE_INSPECTION', inspection, ctx); 

    if (updates.condition) {
      comp.condition = { ...comp.condition, ...updates.condition };
      comp.human_edited_metadata.condition_flags_edited = true;
    }
    if (updates.overview_comment !== undefined) {
      comp.overview_comment = updates.overview_comment;
      comp.human_edited_metadata.overview_comment_edited = true;
    }
    comp.human_edited_metadata.last_human_edit_at = new Date().toISOString();
    return comp;
  },

  async createIssue(componentId: string, issueData: Partial<Issue>, ctx: SecurityContext) {
    await delay();
    const newIssue: Issue = {
       issue_id: `issue-${Date.now()}`,
       component_id: componentId,
       tenant_id: ctx.tenantId,
       type: issueData.type || 'other',
       severity: issueData.severity || IssueSeverity.MINOR,
       source: IssueSource.HUMAN,
       confidence: 1.0,
       notes: issueData.notes || '',
       needs_confirmation: false,
       provenance: issueData.provenance,
       created_at: new Date().toISOString(),
       updated_at: new Date().toISOString()
    };
    if (!dbIssues[componentId]) dbIssues[componentId] = [];
    dbIssues[componentId].push(newIssue);
    return newIssue;
  },

  async resolveAiIssue(aiIssueId: string, action: 'accept' | 'reject', overrideData: Partial<Issue> | undefined, ctx: SecurityContext) {
    await delay();
    // Find Issue
    let foundIssue: Issue | undefined;
    let compId = '';
    for (const cid in dbIssues) {
      foundIssue = dbIssues[cid].find(i => i.issue_id === aiIssueId);
      if (foundIssue) { compId = cid; break; }
    }
    if (!foundIssue) throw new Error("Issue not found");

    if (action === 'reject') {
       foundIssue.ai_resolution = AiIssueResolution.REJECTED;
       foundIssue.provenance = { rejected_by_user_id: ctx.userId };
    } else if (action === 'accept') {
       foundIssue.ai_resolution = overrideData ? AiIssueResolution.OVERRIDDEN : AiIssueResolution.ACCEPTED;
       // Create Copy
       const copy: Issue = {
         ...foundIssue,
         issue_id: `issue-human-${Date.now()}`,
         source: IssueSource.HUMAN,
         confidence: 1.0,
         provenance: { derived_from_issue_id: aiIssueId, accepted_by_user_id: ctx.userId },
         notes: overrideData?.notes || foundIssue.notes,
         severity: overrideData?.severity || foundIssue.severity,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       };
       dbIssues[compId].push(copy);
    }
  },

  async finalizeInspection(inspectionId: string, ctx: SecurityContext) {
    await delay();
    const insp = dbInspections.find(i => i.inspection_id === inspectionId);
    if (!insp) throw new Error("Not Found");
    SecurityKernel.authorize('FINALIZE_REPORT', insp, ctx);
    
    insp.status = InspectionStatus.FINALIZED;
    insp.report_status = ReportStatus.FINALIZED;
    insp.finalized_at = new Date().toISOString();
    return insp;
  },

  async startAnalysisOrchestration(inspectionId: string, type: JobType, ctx: SecurityContext): Promise<Job> {
     // Mock logic same as before, ensures not finalized
     const insp = dbInspections.find(i => i.inspection_id === inspectionId);
     SecurityKernel.authorize('TRIGGER_ANALYSIS', insp || null, ctx);
     
     const job = { job_id: `job-${Date.now()}`, type, status: JobStatus.PENDING, inspection_id: inspectionId, tenant_id: ctx.tenantId, created_at: new Date().toISOString() };
     if (!dbJobs[inspectionId]) dbJobs[inspectionId] = [];
     dbJobs[inspectionId].push(job);
     
     // Simulate completion
     setTimeout(() => {
        job.status = JobStatus.COMPLETED;
        // Inject AI issue if STANDARD analysis
        if (type === JobType.ANALYZE_INSPECTION) {
           const room = dbRooms[inspectionId][0];
           const comp = dbComponents[room.room_id][0];
           const issue: Issue = {
              issue_id: `ai-${Date.now()}`, component_id: comp.component_id, tenant_id: ctx.tenantId,
              type: 'mold', severity: IssueSeverity.MAJOR, source: IssueSource.AI, confidence: 0.88,
              notes: 'Potential mold detected on baseboard', needs_confirmation: true, ai_resolution: AiIssueResolution.PENDING,
              created_at: new Date().toISOString(), updated_at: new Date().toISOString()
           };
           if (!dbIssues[comp.component_id]) dbIssues[comp.component_id] = [];
           dbIssues[comp.component_id].push(issue);
        }
     }, 3000);

     return job;
  },
  
  async startReportOrchestration(inspectionId: string, ctx: SecurityContext): Promise<Job> {
    const insp = dbInspections.find(i => i.inspection_id === inspectionId);
    SecurityKernel.authorize('GENERATE_REPORT', insp || null, ctx);
    const job = { job_id: `job-${Date.now()}`, type: JobType.GENERATE_REPORT, status: JobStatus.PENDING, inspection_id: inspectionId, tenant_id: ctx.tenantId, created_at: new Date().toISOString() };
    if (!dbJobs[inspectionId]) dbJobs[inspectionId] = [];
    dbJobs[inspectionId].push(job);
    return job;
  },

  async getLatestJob(inspectionId: string, ctx: SecurityContext) { return dbJobs[inspectionId]?.[dbJobs[inspectionId].length - 1] || null; },
  async chat(msg: string, history: any) { return { id: '1', role: 'model', text: 'Mock response', timestamp: '' } as any; }
};

const delay = () => new Promise(r => setTimeout(r, MOCK_DELAY_MS));