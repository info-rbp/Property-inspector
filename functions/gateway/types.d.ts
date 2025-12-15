export interface Address {
    street_1: string;
    street_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}
export declare enum InspectionStatus {
    DRAFT = "draft",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FINALIZED = "finalized"
}
export declare enum ReportStatus {
    NONE = "none",
    DRAFT = "draft",
    FINALIZED = "finalized"
}
export declare enum InspectionType {
    ENTRY = "entry",
    ROUTINE = "routine",
    EXIT = "exit"
}
export declare enum RoomType {
    BEDROOM = "bedroom",
    BATHROOM = "bathroom",
    KITCHEN = "kitchen",
    LIVING = "living",
    DINING = "dining",
    EXTERIOR = "exterior",
    HALLWAY = "hallway",
    OTHER = "other"
}
export declare enum IssueSeverity {
    MINOR = "minor",
    MODERATE = "moderate",
    MAJOR = "major",
    CRITICAL = "critical"
}
export declare enum IssueSource {
    AI = "ai",
    HUMAN = "human"
}
export declare enum AiIssueResolution {
    PENDING = "pending",
    ACCEPTED = "accepted",// Converted to human issue
    REJECTED = "rejected",// Dismissed by human
    OVERRIDDEN = "overridden"
}
export declare enum MediaType {
    IMAGE = "image",
    VIDEO = "video"
}
export declare enum MediaLabel {
    WIDE = "wide",
    CLOSEUP = "closeup",
    DAMAGE = "damage",
    OVERVIEW = "overview"
}
export declare enum JobType {
    ANALYZE_INSPECTION = "ANALYZE_INSPECTION",
    GENERATE_REPORT = "GENERATE_REPORT",
    DEEP_ANALYSIS = "DEEP_ANALYSIS",
    TTS_GENERATION = "TTS_GENERATION"
}
export declare enum JobStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum ErrorCode {
    UNAUTHENTICATED = "UNAUTHENTICATED",
    FORBIDDEN_ROLE = "FORBIDDEN_ROLE",
    TENANT_MISMATCH = "TENANT_MISMATCH",
    INSPECTION_NOT_FOUND = "INSPECTION_NOT_FOUND",
    INSPECTION_FINALIZED = "INSPECTION_FINALIZED",
    INSUFFICIENT_MEDIA = "INSUFFICIENT_MEDIA",
    BILLING_QUOTA_EXCEEDED = "BILLING_QUOTA_EXCEEDED",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    INVALID_STATE = "INVALID_STATE"
}
export declare enum UserRole {
    INSPECTOR = "INSPECTOR",
    VIEWER = "VIEWER",
    ADMIN = "ADMIN",
    SYSTEM_SERVICE = "SYSTEM_SERVICE"
}
export interface SecurityContext {
    userId: string;
    tenantId: string;
    role: UserRole;
    email?: string;
}
export type ServiceStatus = 'ready' | 'degraded' | 'not_ready' | 'unknown';
export type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip';
export interface ServiceHealth {
    status: 'ok' | 'error';
    service: string;
    version: string;
    commitSha: string;
    buildTime: string;
    latencyMs: number;
}
export interface CheckResult {
    name: string;
    status: CheckStatus;
    latencyMs: number;
    details?: any;
}
export interface ServiceReady {
    status: ServiceStatus;
    checks: CheckResult[];
    dependencies: {
        criticalFailures: number;
        warnings: number;
    };
    latencyMs: number;
}
export interface ServiceCardData {
    name: string;
    baseUrl: string;
    health: ServiceHealth | null;
    ready: ServiceReady | null;
    lastCheckedAt: string;
    isLoading: boolean;
}
export type SyntheticTestType = 'FULL_WORKFLOW' | 'MEDIA_CONTRACT' | 'BILLING_CHECK' | 'REPORT_CYCLE';
export interface TestStep {
    name: string;
    status: 'pending' | 'running' | 'pass' | 'fail';
    latencyMs: number;
    requestId: string;
    details?: string;
    rawResponse?: any;
}
export interface TestRun {
    id: string;
    testType: SyntheticTestType;
    environment: string;
    startTime: string;
    endTime?: string;
    status: 'running' | 'pass' | 'fail';
    steps: TestStep[];
    correlationId: string;
}
export interface TenantDetail {
    tenantId: string;
    name: string;
    plan: string;
    status: 'active' | 'suspended';
    featureFlags: Record<string, boolean>;
    brandingVersion: string;
}
export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: string;
    groundingMetadata?: {
        searchQuery?: string;
        sources: string[];
    };
}
export interface BootstrapResponse {
    user: {
        userId: string;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
    };
    tenant: {
        tenantId: string;
        name: string;
        branding: {
            primaryColor: string;
            logoUrl?: string;
        };
    };
    entitlements: {
        canUseAiAnalysis: boolean;
        canUseDeepThinking: boolean;
        canUseTts: boolean;
        maxVideoUploadSizeMb: number;
    };
    featureFlags: {
        betaChatbot: boolean;
    };
}
export interface Inspection {
    inspection_id: string;
    tenant_id: string;
    created_by_user_id: string;
    inspection_type: InspectionType;
    property_address: Address;
    status: InspectionStatus;
    report_status: ReportStatus;
    analysis_version: number;
    created_at: string;
    updated_at: string;
    finalized_at?: string;
}
export interface Room {
    room_id: string;
    inspection_id: string;
    tenant_id: string;
    name: string;
    room_type: RoomType;
    sort_order: number;
    created_at: string;
    updated_at: string;
}
export interface Component {
    component_id: string;
    room_id: string;
    tenant_id: string;
    name: string;
    condition: {
        is_clean: boolean | null;
        is_undamaged: boolean | null;
        is_working: boolean | null;
    };
    overview_comment?: string;
    human_edited_metadata: {
        condition_flags_edited: boolean;
        overview_comment_edited: boolean;
        last_human_edit_at?: string;
    };
    last_reviewed_by?: string;
    created_at: string;
    updated_at: string;
}
export interface Issue {
    issue_id: string;
    component_id: string;
    tenant_id: string;
    type: string;
    severity: IssueSeverity;
    source: IssueSource;
    confidence: number;
    analysis_run_id?: string;
    ai_resolution?: AiIssueResolution;
    provenance?: {
        derived_from_issue_id?: string;
        rejected_by_user_id?: string;
        accepted_by_user_id?: string;
    };
    notes: string;
    needs_confirmation: boolean;
    created_at: string;
    updated_at: string;
}
export interface MediaReference {
    media_ref_id: string;
    tenant_id: string;
    inspection_id: string;
    room_id?: string;
    component_id?: string;
    media_id: string;
    url: string;
    label: MediaLabel;
    caption?: string;
    created_at: string;
}
export interface Job {
    job_id: string;
    inspection_id: string;
    tenant_id: string;
    type: JobType;
    status: JobStatus;
    idempotency_key?: string;
    result_summary?: string;
    created_at: string;
    completed_at?: string;
    result_payload?: any;
}
export interface UploadInitiationResponse {
    upload_url: string;
    media_id: string;
    expires_at: string;
}
export type ViewState = 'dashboard' | 'service_detail' | 'tests' | 'tenants' | 'ops';
