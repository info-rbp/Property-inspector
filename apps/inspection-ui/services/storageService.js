"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReportFromDB = exports.loadReportFromDB = exports.getAllSavedReports = exports.saveReportToDB = void 0;
// Save report to backend
const saveReportToDB = async (report) => {
    try {
        const response = await fetch('/api/reports/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(report)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save report');
        }
    }
    catch (error) {
        console.error('Save report error:', error);
        throw error;
    }
};
exports.saveReportToDB = saveReportToDB;
// Get all saved reports from backend
const getAllSavedReports = async () => {
    try {
        const response = await fetch('/api/reports');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch reports');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Fetch reports error:', error);
        throw error;
    }
};
exports.getAllSavedReports = getAllSavedReports;
// Load a specific report from backend
const loadReportFromDB = async (id) => {
    try {
        const response = await fetch(`/api/reports/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            const error = await response.json();
            throw new Error(error.error || 'Failed to load report');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Load report error:', error);
        throw error;
    }
};
exports.loadReportFromDB = loadReportFromDB;
// Delete a report from backend
const deleteReportFromDB = async (id) => {
    try {
        const response = await fetch(`/api/reports/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete report');
        }
    }
    catch (error) {
        console.error('Delete report error:', error);
        throw error;
    }
};
exports.deleteReportFromDB = deleteReportFromDB;
