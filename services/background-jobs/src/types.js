"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJobSchema = exports.AnalysisMode = exports.JobStatus = exports.JobType = void 0;
const zod_1 = require("zod");
var JobType;
(function (JobType) {
    JobType["ANALYZE_ROOM"] = "ANALYZE_ROOM";
    JobType["ANALYZE_INSPECTION"] = "ANALYZE_INSPECTION";
    JobType["GENERATE_REPORT"] = "GENERATE_REPORT";
    JobType["FINALIZE_REPORT"] = "FINALIZE_REPORT";
})(JobType || (exports.JobType = JobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["QUEUED"] = "QUEUED";
    JobStatus["RUNNING"] = "RUNNING";
    JobStatus["SUCCEEDED"] = "SUCCEEDED";
    JobStatus["FAILED"] = "FAILED";
    JobStatus["CANCELLED"] = "CANCELLED";
    JobStatus["DEAD_LETTER"] = "DEAD_LETTER";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var AnalysisMode;
(function (AnalysisMode) {
    AnalysisMode["FAST"] = "FAST";
    AnalysisMode["STANDARD"] = "STANDARD";
    AnalysisMode["DEEP"] = "DEEP";
})(AnalysisMode || (exports.AnalysisMode = AnalysisMode = {}));
// Zod Schema for Creating a Job
exports.CreateJobSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(JobType),
    tenantId: zod_1.z.string().min(1),
    inspectionId: zod_1.z.string().min(1),
    createdByUserId: zod_1.z.string().optional(),
    input: zod_1.z.object({
        roomIds: zod_1.z.array(zod_1.z.string()).optional(),
        roomId: zod_1.z.string().optional(),
        mediaIds: zod_1.z.array(zod_1.z.string()).optional(),
        imageUrls: zod_1.z.array(zod_1.z.string().url()).optional(),
        analysisMode: zod_1.z.nativeEnum(AnalysisMode).default(AnalysisMode.STANDARD),
        reportTemplateId: zod_1.z.string().optional(),
        priority: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
    }).passthrough(),
});
