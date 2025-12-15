"use strict";
// CANONICAL DOMAIN MODEL - CORE INSPECTION GATEWAY
// SYSTEM OF RECORD AUTHORITY
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.ErrorCode = exports.JobStatus = exports.JobType = exports.MediaLabel = exports.MediaType = exports.AiIssueResolution = exports.IssueSource = exports.IssueSeverity = exports.RoomType = exports.InspectionType = exports.ReportStatus = exports.InspectionStatus = void 0;
// --- Enums ---
var InspectionStatus;
(function (InspectionStatus) {
    InspectionStatus["DRAFT"] = "draft";
    InspectionStatus["IN_PROGRESS"] = "in_progress";
    InspectionStatus["COMPLETED"] = "completed";
    InspectionStatus["FINALIZED"] = "finalized";
})(InspectionStatus || (exports.InspectionStatus = InspectionStatus = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["NONE"] = "none";
    ReportStatus["DRAFT"] = "draft";
    ReportStatus["FINALIZED"] = "finalized";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var InspectionType;
(function (InspectionType) {
    InspectionType["ENTRY"] = "entry";
    InspectionType["ROUTINE"] = "routine";
    InspectionType["EXIT"] = "exit";
})(InspectionType || (exports.InspectionType = InspectionType = {}));
var RoomType;
(function (RoomType) {
    RoomType["BEDROOM"] = "bedroom";
    RoomType["BATHROOM"] = "bathroom";
    RoomType["KITCHEN"] = "kitchen";
    RoomType["LIVING"] = "living";
    RoomType["DINING"] = "dining";
    RoomType["EXTERIOR"] = "exterior";
    RoomType["HALLWAY"] = "hallway";
    RoomType["OTHER"] = "other";
})(RoomType || (exports.RoomType = RoomType = {}));
var IssueSeverity;
(function (IssueSeverity) {
    IssueSeverity["MINOR"] = "minor";
    IssueSeverity["MODERATE"] = "moderate";
    IssueSeverity["MAJOR"] = "major";
    IssueSeverity["CRITICAL"] = "critical";
})(IssueSeverity || (exports.IssueSeverity = IssueSeverity = {}));
var IssueSource;
(function (IssueSource) {
    IssueSource["AI"] = "ai";
    IssueSource["HUMAN"] = "human";
})(IssueSource || (exports.IssueSource = IssueSource = {}));
var AiIssueResolution;
(function (AiIssueResolution) {
    AiIssueResolution["PENDING"] = "pending";
    AiIssueResolution["ACCEPTED"] = "accepted";
    AiIssueResolution["REJECTED"] = "rejected";
    AiIssueResolution["OVERRIDDEN"] = "overridden"; // Edited and converted
})(AiIssueResolution || (exports.AiIssueResolution = AiIssueResolution = {}));
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
})(MediaType || (exports.MediaType = MediaType = {}));
var MediaLabel;
(function (MediaLabel) {
    MediaLabel["WIDE"] = "wide";
    MediaLabel["CLOSEUP"] = "closeup";
    MediaLabel["DAMAGE"] = "damage";
    MediaLabel["OVERVIEW"] = "overview";
})(MediaLabel || (exports.MediaLabel = MediaLabel = {}));
var JobType;
(function (JobType) {
    JobType["ANALYZE_INSPECTION"] = "ANALYZE_INSPECTION";
    JobType["GENERATE_REPORT"] = "GENERATE_REPORT";
    JobType["DEEP_ANALYSIS"] = "DEEP_ANALYSIS";
    JobType["TTS_GENERATION"] = "TTS_GENERATION";
})(JobType || (exports.JobType = JobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["PENDING"] = "pending";
    JobStatus["RUNNING"] = "running";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNAUTHENTICATED"] = "UNAUTHENTICATED";
    ErrorCode["FORBIDDEN_ROLE"] = "FORBIDDEN_ROLE";
    ErrorCode["TENANT_MISMATCH"] = "TENANT_MISMATCH";
    ErrorCode["INSPECTION_NOT_FOUND"] = "INSPECTION_NOT_FOUND";
    ErrorCode["INSPECTION_FINALIZED"] = "INSPECTION_FINALIZED";
    ErrorCode["INSUFFICIENT_MEDIA"] = "INSUFFICIENT_MEDIA";
    ErrorCode["BILLING_QUOTA_EXCEEDED"] = "BILLING_QUOTA_EXCEEDED";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCode["INVALID_STATE"] = "INVALID_STATE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
// --- Security ---
var UserRole;
(function (UserRole) {
    UserRole["INSPECTOR"] = "INSPECTOR";
    UserRole["VIEWER"] = "VIEWER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SYSTEM_SERVICE"] = "SYSTEM_SERVICE";
})(UserRole || (exports.UserRole = UserRole = {}));
