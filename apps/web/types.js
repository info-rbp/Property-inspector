"use strict";
// A simplified, unified set of types for the application.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteInspectionStatus = void 0;
var RemoteInspectionStatus;
(function (RemoteInspectionStatus) {
    RemoteInspectionStatus["PENDING"] = "pending";
    RemoteInspectionStatus["IN_PROGRESS"] = "in_progress";
    RemoteInspectionStatus["SUBMITTED"] = "submitted";
    RemoteInspectionStatus["REVIEWED"] = "reviewed";
    RemoteInspectionStatus["CANCELLED"] = "cancelled";
    RemoteInspectionStatus["SENT"] = "sent";
})(RemoteInspectionStatus || (exports.RemoteInspectionStatus = RemoteInspectionStatus = {}));
