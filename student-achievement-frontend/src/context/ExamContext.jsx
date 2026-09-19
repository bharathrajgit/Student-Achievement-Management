// src/context/ExamContext.jsx
import React, { createContext, useState, useCallback, useContext } from 'react';

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [exams, setExams] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [examGroups, setExamGroups] = useState([]);
  const [examRequests, setExamRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Clear messages
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  // Set error message with auto-clear
  const setErrorMessage = useCallback((message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  // Set success message with auto-clear
  const setSuccessMessage = useCallback((message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 4000);
  }, []);

  // Add exam to catalog
  const addExam = useCallback((exam) => {
    setExams(prev => [...prev, exam]);
  }, []);

  // Update exam in catalog
  const updateExam = useCallback((examId, updatedData) => {
    setExams(prev => prev.map(exam => 
      exam._id === examId ? { ...exam, ...updatedData } : exam
    ));
  }, []);

  // Remove exam from catalog
  const removeExam = useCallback((examId) => {
    setExams(prev => prev.filter(exam => exam._id !== examId));
  }, []);

  // Add my exam registration
  const addMyExam = useCallback((registration) => {
    setMyExams(prev => [...prev, registration]);
  }, []);

  // Update my exam registration
  const updateMyExam = useCallback((registrationId, updatedData) => {
    setMyExams(prev => prev.map(reg => 
      reg._id === registrationId ? { ...reg, ...updatedData } : reg
    ));
  }, []);

  // Add submission
  const addSubmission = useCallback((submission) => {
    setSubmissions(prev => [...prev, submission]);
  }, []);

  // Update submission
  const updateSubmission = useCallback((submissionId, updatedData) => {
    setSubmissions(prev => prev.map(sub => 
      sub._id === submissionId ? { ...sub, ...updatedData } : sub
    ));
  }, []);

  // Remove submission
  const removeSubmission = useCallback((submissionId) => {
    setSubmissions(prev => prev.filter(sub => sub._id !== submissionId));
  }, []);

  // Add exam request
  const addExamRequest = useCallback((request) => {
    setExamRequests(prev => [...prev, request]);
  }, []);

  // Update exam request
  const updateExamRequest = useCallback((requestId, updatedData) => {
    setExamRequests(prev => prev.map(req => 
      req._id === requestId ? { ...req, ...updatedData } : req
    ));
  }, []);

  // Clear all data (for logout)
  const clearAllData = useCallback(() => {
    setExams([]);
    setMyExams([]);
    setSubmissions([]);
    setExamGroups([]);
    setExamRequests([]);
    setError(null);
    setSuccess(null);
  }, []);

  const value = {
    // State
    exams,
    myExams,
    submissions,
    examGroups,
    examRequests,
    loading,
    error,
    success,

    // Setters
    setExams,
    setMyExams,
    setSubmissions,
    setExamGroups,
    setExamRequests,
    setLoading,
    setError,
    setSuccess,

    // Methods
    clearError,
    clearSuccess,
    setErrorMessage,
    setSuccessMessage,
    addExam,
    updateExam,
    removeExam,
    addMyExam,
    updateMyExam,
    addSubmission,
    updateSubmission,
    removeSubmission,
    addExamRequest,
    updateExamRequest,
    clearAllData,
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};

// Custom hook to use ExamContext
export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within ExamProvider');
  }
  return context;
};

export default ExamContext;
