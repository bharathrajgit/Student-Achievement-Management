// src/services/coordinatorExamService.js
import api from './api';

// ===== EXAM REQUESTS =====
export const getPendingExamRequests = async (params = {}) => {
  try {
    const response = await api.get('/coordinator/exam-requests/pending', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch exam requests' 
    };
  }
};

export const approveExamRequest = async (requestId, description) => {
  try {
    const response = await api.put(
      `/coordinator/exam-requests/${requestId}/approve`,
      { description }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to approve exam request' 
    };
  }
};

export const rejectExamRequest = async (requestId, rejectionReason) => {
  try {
    const response = await api.put(
      `/coordinator/exam-requests/${requestId}/reject`,
      { rejectionReason }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to reject exam request' 
    };
  }
};

// ===== CERTIFICATE SUBMISSIONS =====
export const getPendingSubmissions = async (params = {}) => {
  try {
    const response = await api.get('/coordinator/submissions/pending', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch pending submissions' 
    };
  }
};

export const getSubmissionDetails = async (registrationId) => {
  try {
    const response = await api.get(`/coordinator/submissions/${registrationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch submission details' 
    };
  }
};

export const approveSubmission = async (registrationId, feedback) => {
  try {
    const response = await api.put(
      `/coordinator/submissions/${registrationId}/approve`,
      { feedback }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to approve submission' 
    };
  }
};

export const rejectSubmission = async (registrationId, feedback) => {
  try {
    const response = await api.put(
      `/coordinator/submissions/${registrationId}/reject`,
      { feedback }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to reject submission' 
    };
  }
};

export const bulkApproveSubmissions = async (registrationIds, feedback) => {
  try {
    const response = await api.post('/coordinator/submissions/bulk-approve', {
      registrationIds,
      feedback,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to bulk approve' 
    };
  }
};

export const getVerificationHistory = async (registrationId) => {
  try {
    const response = await api.get(`/coordinator/submissions/${registrationId}/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch verification history' 
    };
  }
};

// ===== ANALYTICS =====
export const getDashboardOverview = async () => {
  try {
    const response = await api.get('/coordinator/analytics/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch dashboard overview' 
    };
  }
};

export const getExamGroups = async () => {
  try {
    const response = await api.get('/coordinator/analytics/exam-groups');
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch exam groups' 
    };
  }
};

export const getExamGroupStudents = async (examName) => {
  try {
    const response = await api.get(
      `/coordinator/analytics/exam-groups/${encodeURIComponent(examName)}/students`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch exam group students' 
    };
  }
};

export const getExamAnalytics = async (examName) => {
  try {
    const response = await api.get(
      `/coordinator/analytics/exam/${encodeURIComponent(examName)}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch exam analytics' 
    };
  }
};

export const getStudentProgress = async (studentId) => {
  try {
    const response = await api.get(`/coordinator/analytics/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch student progress' 
    };
  }
};

export const getOverdueExams = async () => {
  try {
    const response = await api.get('/coordinator/analytics/overdue');
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch overdue exams' 
    };
  }
};

export const getLowEnrollment = async () => {
  try {
    const response = await api.get('/coordinator/analytics/low-enrollment');
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch low enrollment exams' 
    };
  }
};

// ===== REPORTS =====
export const exportAllRegistrations = async (params = {}) => {
  try {
    const { format = 'xlsx', ...otherParams } = params;
    
    // PDF needs blob, CSV needs text, Excel needs blob
    const responseType = format === 'csv' ? 'text' : 'blob';
    
    const response = await api.get('/coordinator/reports/export-registrations', {
      params: { format, ...otherParams },
      responseType,
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to export registrations' 
    };
  }
};


export const exportExamGroup = async (examName) => {
  try {
    const response = await api.get(
      `/coordinator/reports/export-group/${encodeURIComponent(examName)}`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to export exam group' 
    };
  }
};

export const exportStudentHistory = async (studentId) => {
  try {
    const response = await api.get(
      `/coordinator/reports/student/${studentId}/export`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to export student history' 
    };
  }
};

export const buildCustomReport = async (filters, format = 'xlsx') => {
  try {
    const response = await api.post(
      '/coordinator/reports/custom',
      { filters, format },
      { responseType: format === 'csv' ? 'text' : 'blob' }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to build custom report' 
    };
  }
};

// ===== NPTEL ANALYTICS =====
export const getNptelDashboard = async () => {
  try {
    const response = await api.get('/coordinator/nptel/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch NPTEL dashboard' 
    };
  }
};

export const getNptelCourseDetails = async (examName) => {
  try {
    const response = await api.get(`/coordinator/nptel/course/${encodeURIComponent(examName)}/details`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch course details' 
    };
  }
};

export const getNptelStudentProgress = async (studentId) => {
  try {
    const response = await api.get(`/coordinator/nptel/student/${studentId}/progress`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch student progress' 
    };
  }
};

// ===== NPTEL BULK OPERATIONS =====
export const bulkUploadMarks = async (records) => {
  try {
    const response = await api.post('/coordinator/nptel/bulk-upload-marks', { records });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to bulk upload marks' 
    };
  }
};

export const batchApproveRequests = async (registrationIds) => {
  try {
    const response = await api.post('/coordinator/nptel/batch-approve-requests', { 
      registrationIds 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to batch approve requests' 
    };
  }
};

// ===== NPTEL EXPORTS =====
export const exportNptelCourse = async (examName) => {
  try {
    const response = await api.get(`/coordinator/nptel/export/course/${encodeURIComponent(examName)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to export course data' 
    };
  }
};

export const exportAllNptelExams = async (startDate, endDate) => {
  try {
    const response = await api.get('/coordinator/nptel/export/all-exams', {
      params: { 
        ...(startDate && { startDate }), 
        ...(endDate && { endDate }) 
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to export all exams' 
    };
  }
};

export const exportStudentTranscript = async (studentId) => {
  try {
    const response = await api.get(`/coordinator/nptel/export/student-transcript/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to export student transcript' 
    };
  }
};

export const getSampleCsvTemplate = async () => {
  try {
    const response = await api.get('/coordinator/nptel/export/sample-csv', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to download CSV template' 
    };
  }
};

// ===== NOTIFICATIONS =====
export const getNotifications = async (unreadOnly = false) => {
  try {
    const response = await api.get('/coordinator/nptel/notifications', {
      params: { unreadOnly }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch notifications' 
    };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(
      `/coordinator/nptel/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to mark notification as read' 
    };
  }
};

// ===== APPROVAL QUEUE =====
export const getApprovalQueue = async () => {
  try {
    const response = await api.get('/coordinator/nptel/approval-queue');
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch approval queue' 
    };
  }
};


