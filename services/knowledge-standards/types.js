"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardStatus = exports.StandardType = void 0;
// Core Domain Enums
var StandardType;
(function (StandardType) {
    StandardType["DEFECT"] = "defect_taxonomy";
    StandardType["SEVERITY"] = "severity_rules";
    StandardType["ROOM"] = "room_standards";
    StandardType["PHRASING"] = "phrasing_rules";
    StandardType["GUARDRAIL"] = "analysis_guardrails";
})(StandardType || (exports.StandardType = StandardType = {}));
var StandardStatus;
(function (StandardStatus) {
    StandardStatus["ACTIVE"] = "active";
    StandardStatus["DEPRECATED"] = "deprecated";
    StandardStatus["DRAFT"] = "draft";
})(StandardStatus || (exports.StandardStatus = StandardStatus = {}));
