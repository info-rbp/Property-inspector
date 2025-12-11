import { ReportData } from '../types';

// Save report to backend
export const saveReportToDB = async (report: ReportData): Promise<void> => {
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
  } catch (error) {
    console.error('Save report error:', error);
    throw error;
  }
};

// Get all saved reports from backend
export const getAllSavedReports = async (): Promise<ReportData[]> => {
  try {
    const response = await fetch('/api/reports');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch reports');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch reports error:', error);
    throw error;
  }
};

// Load a specific report from backend
export const loadReportFromDB = async (id: string): Promise<ReportData | null> => {
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
  } catch (error) {
    console.error('Load report error:', error);
    throw error;
  }
};

// Delete a report from backend
export const deleteReportFromDB = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/reports/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete report');
    }
  } catch (error) {
    console.error('Delete report error:', error);
    throw error;
  }
};