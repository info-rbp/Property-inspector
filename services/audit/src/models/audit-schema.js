"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEventInputSchema = exports.EventType = exports.SourceService = exports.ActorType = exports.EntityType = void 0;
const zod_1 = require("zod");
// --- ENUMS ---
var EntityType;
(function (EntityType) {
    EntityType["INSPECTION"] = "inspection";
    EntityType["ROOM"] = "room";
    EntityType["COMPONENT"] = "component";
    EntityType["PHOTO"] = "photo";
    EntityType["ANALYSIS"] = "analysis";
    EntityType["REPORT"] = "report";
})(EntityType || (exports.EntityType = EntityType = {}));
var ActorType;
(function (ActorType) {
    ActorType["USER"] = "user";
    ActorType["SYSTEM"] = "system";
    ActorType["AI"] = "ai";
})(ActorType || (exports.ActorType = ActorType = {}));
var SourceService;
(function (SourceService) {
    SourceService["INSPECTION_APP"] = "inspection-app";
    SourceService["ANALYSIS_APP"] = "analysis-app";
    SourceService["REPORT_APP"] = "report-app";
    SourceService["JOBS"] = "jobs";
})(SourceService || (exports.SourceService = SourceService = {}));
var EventType;
(function (EventType) {
    // Photo & Evidence
    EventType["PHOTO_UPLOADED"] = "PHOTO_UPLOADED";
    EventType["PHOTO_ATTACHED_TO_COMPONENT"] = "PHOTO_ATTACHED_TO_COMPONENT";
    EventType["PHOTO_USED_IN_ANALYSIS"] = "PHOTO_USED_IN_ANALYSIS";
    // AI Analysis
    EventType["AI_ANALYSIS_REQUESTED"] = "AI_ANALYSIS_REQUESTED";
    EventType["AI_MODEL_SELECTED"] = "AI_MODEL_SELECTED";
    EventType["AI_PROMPT_VERSION_USED"] = "AI_PROMPT_VERSION_USED";
    EventType["AI_ANALYSIS_COMPLETED"] = "AI_ANALYSIS_COMPLETED";
    EventType["AI_ANALYSIS_FAILED"] = "AI_ANALYSIS_FAILED";
    // Human Interaction
    EventType["AI_SUGGESTION_ACCEPTED"] = "AI_SUGGESTION_ACCEPTED";
    EventType["AI_SUGGESTION_EDITED"] = "AI_SUGGESTION_EDITED";
    EventType["AI_SUGGESTION_REJECTED"] = "AI_SUGGESTION_REJECTED";
    EventType["COMPONENT_STATUS_CHANGED"] = "COMPONENT_STATUS_CHANGED";
    EventType["COMMENT_EDITED_MANUALLY"] = "COMMENT_EDITED_MANUALLY";
    // Report Lifecycle
    EventType["REPORT_GENERATION_REQUESTED"] = "REPORT_GENERATION_REQUESTED";
    EventType["REPORT_GENERATED"] = "REPORT_GENERATED";
    EventType["REPORT_FINALIZED"] = "REPORT_FINALIZED";
    EventType["REPORT_DOWNLOADED"] = "REPORT_DOWNLOADED";
    EventType["REPORT_REGENERATE_BLOCKED"] = "REPORT_REGENERATE_BLOCKED";
})(EventType || (exports.EventType = EventType = {}));
// --- SCHEMAS ---
exports.AuditEventInputSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    entityType: zod_1.z.nativeEnum(EntityType),
    entityId: zod_1.z.string().min(1),
    eventType: zod_1.z.nativeEnum(EventType),
    actorType: zod_1.z.nativeEnum(ActorType),
    actorId: zod_1.z.string().min(1),
    sourceService: zod_1.z.nativeEnum(SourceService),
    correlationId: zod_1.z.string().optional(),
    payload: zod_1.z.record(zod_1.z.any()), // The actual data
});
