// src/services/studentExamService.js
import api from './api';

// ===== EXAM CATALOG =====
export const browseExamCatalog = async (params = {}) => {
  try {
    const response = await api.get('/student/exams/catalog', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch exam catalog' 
    };
  }
};

// ===== REGISTER FOR EXAM =====
export const registerForExam = async (examId, expectedCompletionDate) => {
  try {
    const response = await api.post('/student/exams/register', {
      examId,
      expectedCompletionDate,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to register for exam' 
    };
  }
};

// ===== GET MY REGISTERED EXAMS =====
export const getMyExams = async (params = {}) => {
  try {
    const response = await api.get('/student/exams/my-exams', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch your exams' 
    };
  }
};

// ===== GET REGISTRATION DETAILS =====
export const getRegistrationDetails = async (registrationId) => {
  try {
    const response = await api.get(`/student/exams/${registrationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch registration details' 
    };
  }
};

// ===== UPLOAD CERTIFICATE =====
export const uploadCertificate = async (registrationId, certificateData) => {
  try {
    const response = await api.post(
      `/student/exams/${registrationId}/upload-certificate`,
      certificateData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to upload certificate' 
    };
  }
};

// ===== RESUBMIT CERTIFICATE =====
export const resubmitCertificate = async (registrationId, certificateData) => {
  try {
    const response = await api.put(
      `/student/exams/${registrationId}/resubmit`,
      certificateData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to resubmit certificate' 
    };
  }
};

// ===== REQUEST NEW EXAM =====
export const requestNewExam = async (examData) => {
  try {
    const response = await api.post('/student/exams/request-new', examData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to request new exam' 
    };
  }
};

// ===== GET MY EXAM REQUESTS =====
export const getMyExamRequests = async (params = {}) => {
  try {
    const response = await api.get('/student/exams/my-requests', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      status: 'error', 
      message: 'Failed to fetch your requests' 
    };
  }
};
