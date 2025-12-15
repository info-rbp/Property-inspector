"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBackoff = void 0;
const firestore_1 = require("../lib/firestore");
const date_fns_1 = require("date-fns");
const calculateBackoff = (attempt) => {
    const now = new Date();
    let nextRun;
    // Exponential backoff strategy
    // 1: 10s, 2: 30s, 3: 2m, 4: 10m, 5: 30m
    switch (attempt) {
        case 1:
            nextRun = (0, date_fns_1.addSeconds)(now, 10);
            break;
        case 2:
            nextRun = (0, date_fns_1.addSeconds)(now, 30);
            break;
        case 3:
            nextRun = (0, date_fns_1.addMinutes)(now, 2);
            break;
        case 4:
            nextRun = (0, date_fns_1.addMinutes)(now, 10);
            break;
        case 5:
            nextRun = (0, date_fns_1.addMinutes)(now, 30);
            break;
        default:
            // Cap at 60 mins for attempts > 5 (if maxAttempts allows)
            nextRun = (0, date_fns_1.addMinutes)(now, 60);
            break;
    }
    return firestore_1.Timestamp.fromDate(nextRun);
};
exports.calculateBackoff = calculateBackoff;
