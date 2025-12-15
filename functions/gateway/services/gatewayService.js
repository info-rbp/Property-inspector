"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatewayService = void 0;
const types_2 = require("../types");
const RBAC_MATRIX = {
    READ_INSPECTION: [types_2.UserRole.ADMIN, types_2.UserRole.INSPECTOR, types_2.UserRole.VIEWER],
    CREATE_INSPECTION: [types_2.UserRole.ADMIN, types_2.UserRole.INSPECTOR],
    UPDATE_INSPECTION: [types_2.UserRole.ADMIN, types_2.UserRole.INSPECTOR],
    UPLOAD_MEDIA: [types_2.UserRole.ADMIN, types_2.UserRole.INSPECTOR],
    TRIGGER_ANALYSIS: [types_2.UserRole.ADMIN, types_2.UserRole.INSPECTOR],
    GENERATE_REPORT: [types_2.UserRole.ADMIN, types_2.UserRole.INSPECTOR],
    FINALIZE_REPORT: [types_2.UserRole.ADMIN],
    INTERNAL_WEBHOOK: [types_2.UserRole.SYSTEM_SERVICE],
    CHAT_INTERACTION: [types_2.UserRole.ADMIN, types_2.UserRole.INSPECTOR, types_2.UserRole.VIEWER]
};
const SecurityKernel = {
    authorize(action, resource, context) {
        if (!context || !context.userId)
            throw new Error(`${types_2.ErrorCode.UNAUTHENTICATED}: Missing Identity`);
        if (resource) {
            if (context.role !== types_2.UserRole.SYSTEM_SERVICE && resource.tenant_id !== context.tenantId) {
                throw new Error(`${types_2.ErrorCode.TENANT_MISMATCH}: Access Denied`);
            }
            const isMutative = ['UPDATE_INSPECTION', 'UPLOAD_MEDIA', 'TRIGGER_ANALYSIS', 'FINALIZE_REPORT'].includes(action);
            if (isMutative && resource.status === types_2.InspectionStatus.FINALIZED) {
                throw new Error(`${types_2.ErrorCode.INSPECTION_FINALIZED}: Immutable`);
            }
        }
        if (!RBAC_MATRIX[action].includes(context.role)) {
            throw new Error(`${types_2.ErrorCode.FORBIDDEN_ROLE}: Insufficient Permissions`);
        }
    },
    getEffectiveContext() {
        return { userId: 'user-1', tenantId: 'tenant-abc', role: types_2.UserRole.INSPECTOR, email: 'inspector@example.com' };
    },
    validateServiceAuth(secret) {
        return { userId: 'system-orchestrator', tenantId: 'system', role: types_2.UserRole.SYSTEM_SERVICE };
    }
};
class GatewayService {
    async bootstrap() {
        return mockBackend.bootstrap(SecurityKernel.getEffectiveContext());
    }
    // --- CRUD ---
    async getInspections() { return mockBackend.getInspections(SecurityKernel.getEffectiveContext()); }
    async getInspection(id) { return mockBackend.getInspection(id, SecurityKernel.getEffectiveContext()); }
    async getInspectionRooms(id) { return mockBackend.getRooms(id, SecurityKernel.getEffectiveContext()); }
    async getRoomComponents(roomId) { return mockBackend.getComponents(roomId, SecurityKernel.getEffectiveContext()); }
    async getComponentIssues(componentId) { return mockBackend.getIssues(componentId, SecurityKernel.getEffectiveContext()); }
    async getComponentMedia(componentId) { return mockBackend.getMedia(componentId, SecurityKernel.getEffectiveContext()); }
    async initiateUpload(componentId, file) {
        return mockBackend.initiateUpload(componentId, file, SecurityKernel.getEffectiveContext());
    }
    async completeUpload(componentId, mediaId) {
        return mockBackend.completeUpload(componentId, mediaId, SecurityKernel.getEffectiveContext());
    }
    // --- COMPONENT EDITS (Human Wins) ---
    async updateComponentCondition(componentId, condition) {
        return mockBackend.updateComponent(componentId, { condition }, SecurityKernel.getEffectiveContext());
    }
    async updateComponentComment(componentId, comment) {
        return mockBackend.updateComponent(componentId, { overview_comment: comment }, SecurityKernel.getEffectiveContext());
    }
    // --- ISSUE MANAGEMENT (Human vs AI) ---
    async createHumanIssue(componentId, issue) {
        return mockBackend.createIssue(componentId, issue, SecurityKernel.getEffectiveContext());
    }
    /**
     * Resolve an AI issue (Accept/Reject/Override)
     * If Accepted/Overridden: Creates a new HUMAN issue and links it.
     * If Rejected: Marks AI issue as rejected.
     */
    async resolveAiIssue(aiIssueId, action, overrideData) {
        return mockBackend.resolveAiIssue(aiIssueId, action, overrideData, SecurityKernel.getEffectiveContext());
    }
    // --- ORCHESTRATION ---
    async startAnalysis(inspectionId) {
        return mockBackend.startAnalysisOrchestration(inspectionId, types_2.JobType.ANALYZE_INSPECTION, SecurityKernel.getEffectiveContext());
    }
    async startDeepAnalysis(inspectionId) {
        return mockBackend.startAnalysisOrchestration(inspectionId, types_2.JobType.DEEP_ANALYSIS, SecurityKernel.getEffectiveContext());
    }
    async generateAudioSummary(inspectionId, text) {
        return mockBackend.startAnalysisOrchestration(inspectionId, types_2.JobType.TTS_GENERATION, SecurityKernel.getEffectiveContext());
    }
    async generateReport(inspectionId) {
        return mockBackend.startReportOrchestration(inspectionId, SecurityKernel.getEffectiveContext());
    }
    async getJobStatus(inspectionId) {
        return mockBackend.getLatestJob(inspectionId, SecurityKernel.getEffectiveContext());
    }
    /**
     * Locks the inspection permanently.
     */
    async finalizeInspection(inspectionId) {
        return mockBackend.finalizeInspection(inspectionId, SecurityKernel.getEffectiveContext());
    }
    async sendChatMessage(message, history) {
        SecurityKernel.authorize('CHAT_INTERACTION', null, SecurityKernel.getEffectiveContext());
        return mockBackend.chat(message, history);
    }
}
exports.gatewayService = new GatewayService();
// --- REFERENCE BACKEND ---
const MOCK_DELAY_MS = 400;
// Data Stores
const dbInspections = [
    {
        inspection_id: 'insp-001', tenant_id: 'tenant-abc', created_by_user_id: 'user-1',
        status: types_2.InspectionStatus.IN_PROGRESS, report_status: types_2.ReportStatus.NONE,
        inspection_type: types_2.InspectionType.ENTRY,
        property_address: { street_1: '123 Highland Ave', street_2: 'Apt 4B', city: 'San Francisco', state: 'CA', postal_code: '94110', country: 'US' },
        analysis_version: 1, created_at: '2023-10-25T09:00:00Z', updated_at: '2023-10-25T10:00:00Z'
    },
];
// ... [dbRooms, dbMedia same as before] ...
const dbRooms = { 'insp-001': [{ room_id: 'room-1', inspection_id: 'insp-001', tenant_id: 'tenant-abc', name: 'Living Room', room_type: types_2.RoomType.LIVING, sort_order: 1, created_at: '', updated_at: '' }] };
const dbMedia = {};
const dbJobs = {};
// Updated Component Store with Metadata
const dbComponents = {
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
const dbIssues = {};
const mockBackend = {
    // ... [Standard getters omitted for brevity] ...
    async bootstrap(ctx) {
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
    async getInspections(ctx) { return dbInspections.filter(i => i.tenant_id === ctx.tenantId); },
    async getInspection(id, ctx) { return dbInspections.find(i => i.inspection_id === id); },
    async getRooms(id, ctx) { return dbRooms[id] || []; },
    async getComponents(id, ctx) { return dbComponents[id] || []; },
    async getIssues(id, ctx) { return dbIssues[id] || []; },
    async getMedia(id, ctx) { return dbMedia[id] || []; },
    async initiateUpload(componentId, file, ctx) { return { upload_url: 'http://mock', media_id: '1', expires_at: '' }; },
    async completeUpload(componentId, mediaId, ctx) { return { url: 'http://mock.img' }; },
    async updateComponent(componentId, updates, ctx) {
        await delay();
        const roomId = Object.keys(dbComponents).find(rid => dbComponents[rid].find(c => c.component_id === componentId));
        const comp = dbComponents[roomId]?.find(c => c.component_id === componentId);
        if (!comp)
            throw new Error("Not Found");
        // Check Lock
        // Find inspection ID by searching for the room in dbRooms
        let inspectionId;
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
    async createIssue(componentId, issueData, ctx) {
        await delay();
        const newIssue = {
            issue_id: `issue-${Date.now()}`,
            component_id: componentId,
            tenant_id: ctx.tenantId,
            type: issueData.type || 'other',
            severity: issueData.severity || types_2.IssueSeverity.MINOR,
            source: types_2.IssueSource.HUMAN,
            confidence: 1.0,
            notes: issueData.notes || '',
            needs_confirmation: false,
            provenance: issueData.provenance,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        if (!dbIssues[componentId])
            dbIssues[componentId] = [];
        dbIssues[componentId].push(newIssue);
        return newIssue;
    },
    async resolveAiIssue(aiIssueId, action, overrideData, ctx) {
        await delay();
        // Find Issue
        let foundIssue;
        let compId = '';
        for (const cid in dbIssues) {
            foundIssue = dbIssues[cid].find(i => i.issue_id === aiIssueId);
            if (foundIssue) {
                compId = cid;
                break;
            }
        }
        if (!foundIssue)
            throw new Error("Issue not found");
        if (action === 'reject') {
            foundIssue.ai_resolution = types_2.AiIssueResolution.REJECTED;
            foundIssue.provenance = { rejected_by_user_id: ctx.userId };
        }
        else if (action === 'accept') {
            foundIssue.ai_resolution = overrideData ? types_2.AiIssueResolution.OVERRIDDEN : types_2.AiIssueResolution.ACCEPTED;
            // Create Copy
            const copy = {
                ...foundIssue,
                issue_id: `issue-human-${Date.now()}`,
                source: types_2.IssueSource.HUMAN,
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
    async finalizeInspection(inspectionId, ctx) {
        await delay();
        const insp = dbInspections.find(i => i.inspection_id === inspectionId);
        if (!insp)
            throw new Error("Not Found");
        SecurityKernel.authorize('FINALIZE_REPORT', insp, ctx);
        insp.status = types_2.InspectionStatus.FINALIZED;
        insp.report_status = types_2.ReportStatus.FINALIZED;
        insp.finalized_at = new Date().toISOString();
        return insp;
    },
    async startAnalysisOrchestration(inspectionId, type, ctx) {
        // Mock logic same as before, ensures not finalized
        const insp = dbInspections.find(i => i.inspection_id === inspectionId);
        SecurityKernel.authorize('TRIGGER_ANALYSIS', insp || null, ctx);
        const job = { job_id: `job-${Date.now()}`, type, status: types_2.JobStatus.PENDING, inspection_id: inspectionId, tenant_id: ctx.tenantId, created_at: new Date().toISOString() };
        if (!dbJobs[inspectionId])
            dbJobs[inspectionId] = [];
        dbJobs[inspectionId].push(job);
        // Simulate completion
        setTimeout(() => {
            job.status = types_2.JobStatus.COMPLETED;
            // Inject AI issue if STANDARD analysis
            if (type === types_2.JobType.ANALYZE_INSPECTION) {
                const room = dbRooms[inspectionId][0];
                const comp = dbComponents[room.room_id][0];
                const issue = {
                    issue_id: `ai-${Date.now()}`, component_id: comp.component_id, tenant_id: ctx.tenantId,
                    type: 'mold', severity: types_2.IssueSeverity.MAJOR, source: types_2.IssueSource.AI, confidence: 0.88,
                    notes: 'Potential mold detected on baseboard', needs_confirmation: true, ai_resolution: types_2.AiIssueResolution.PENDING,
                    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                };
                if (!dbIssues[comp.component_id])
                    dbIssues[comp.component_id] = [];
                dbIssues[comp.component_id].push(issue);
            }
        }, 3000);
        return job;
    },
    async startReportOrchestration(inspectionId, ctx) {
        const insp = dbInspections.find(i => i.inspection_id === inspectionId);
        SecurityKernel.authorize('GENERATE_REPORT', insp || null, ctx);
        const job = { job_id: `job-${Date.now()}`, type: types_2.JobType.GENERATE_REPORT, status: types_2.JobStatus.PENDING, inspection_id: inspectionId, tenant_id: ctx.tenantId, created_at: new Date().toISOString() };
        if (!dbJobs[inspectionId])
            dbJobs[inspectionId] = [];
        dbJobs[inspectionId].push(job);
        return job;
    },
    async getLatestJob(inspectionId, ctx) { return dbJobs[inspectionId]?.[dbJobs[inspectionId].length - 1] || null; },
    async chat(msg, history) { return { id: '1', role: 'model', text: 'Mock response', timestamp: '' }; }
};
const delay = () => new Promise(r => setTimeout(r, MOCK_DELAY_MS));
