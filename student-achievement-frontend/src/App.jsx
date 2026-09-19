import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExamProvider } from './context/ExamContext';
import { Login } from './pages/login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Approvals } from './pages/Approvals';
import { Coordinators } from './pages/Coordinators';
import { SubCoordinators } from './pages/SubCoordinators';
import { Tenants } from './pages/Tenants';
import { AchievementDetail } from './pages/AchievementDetail';
import { StudentAchievements } from './pages/student/Achievements';
import { StudentDetail } from './pages/StudentDetail';
import StudentBiodataDetail from './pages/StudentBiodataDetail.jsx';
import StudentBiodata from './pages/StudentBiodata.jsx';

// Student Exam Pages
import ExamCatalog from './pages/student/exam/ExamCatalog';
import MyExams from './pages/student/exam/MyExams';
import UploadCertificate from './pages/student/exam/UploadCertificate';
import RequestNewExam from './pages/student/exam/RequestNewExam';
import MyRequests from './pages/student/exam/MyRequests';

// Coordinator Exam Pages
import ExamRequests from './pages/coordinator/exam/ExamRequests';
import PendingSubmissions from './pages/coordinator/exam/PendingSubmissions';
import SubmissionDetail from './pages/coordinator/submissions/SubmissionDetail'; // ✅ CORRECT IMPORT
import ExamGroups from './pages/coordinator/exam/ExamGroups';
import ExamGroupStudents from './pages/coordinator/exam/ExamGroupStudents';
import ExamAnalytics from './pages/coordinator/exam/ExamAnalytics';
import StudentProgress from './pages/coordinator/exam/StudentProgress';
import ExamReports from './pages/coordinator/exam/ExamReports';
import NptelDashboard from './pages/coordinator/exam/NptelDashboard';
import ApprovalQueue from './pages/coordinator/exam/ApprovalQueue';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Loading authentication...
      </div>
    );
  }

  return (
    <Routes>
      {/* ==================== AUTH ==================== */}
      <Route path="/login" element={<Login />} />

      {/* ==================== COMMON DASHBOARD ==================== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================== SUPERADMIN ROUTES ==================== */}
      <Route
        path="/superadmin/tenants"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Tenants />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin/coordinators"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Coordinators />
          </ProtectedRoute>
        }
      />

      {/* ==================== COORDINATOR ROUTES ==================== */}
      
      {/* Students Management */}
      <Route
        path="/coordinator/students"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <Students />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/students/:id"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <StudentDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/students/:studentId/biodata"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <StudentBiodataDetail />
          </ProtectedRoute>
        }
      />

      {/* Achievements Management */}
      <Route
        path="/coordinator/achievements"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <Approvals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/achievements/:id"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <AchievementDetail />
          </ProtectedRoute>
        }
      />

      {/* Exam Management */}
      <Route
        path="/coordinator/exam-requests"
        element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <ExamRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/submissions"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <PendingSubmissions />
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Submission Detail Route */}
      <Route
        path="/coordinator/submissions/:registrationId"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <SubmissionDetail />
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Exam Groups Routes */}
      <Route
        path="/coordinator/exam-groups"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <ExamGroups />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/exam-groups/:examName/students"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <ExamGroupStudents />
          </ProtectedRoute>
        }
      />

      {/* Analytics & Reports */}
      <Route
        path="/coordinator/analytics"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <ExamAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/analytics/student/:studentId"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <StudentProgress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/reports"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <ExamReports />
          </ProtectedRoute>
        }
      />

      {/* NPTEL Analytics */}
      <Route
        path="/coordinator/nptel/dashboard"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <NptelDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coordinator/nptel/approval-queue"
        element={
          <ProtectedRoute allowedRoles={['coordinator', 'sub-coordinator']}>
            <ApprovalQueue />
          </ProtectedRoute>
        }
      />

      {/* Sub-Coordinators Management */}
      <Route
        path="/sub-coordinators"
        element={
          <ProtectedRoute allowedRoles={['coordinator']}>
            <SubCoordinators />
          </ProtectedRoute>
        }
      />

      {/* ==================== STUDENT ROUTES ==================== */}

      {/* Achievements */}
      <Route
        path="/student/achievements"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAchievements />
          </ProtectedRoute>
        }
      />

      <Route
        path="/achievements/:id"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AchievementDetail />
          </ProtectedRoute>
        }
      />

      {/* Biodata */}
      <Route
        path="/student/biodata"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentBiodata  />
          </ProtectedRoute>
        }
      />

      {/* Exams */}
      <Route
        path="/student/exam-catalog"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ExamCatalog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/my-exams"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyExams />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/my-exams/:registrationId/upload"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <UploadCertificate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/request-exam"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <RequestNewExam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/my-requests"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyRequests />
          </ProtectedRoute>
        }
      />

      {/* ==================== LEGACY ROUTES (REDIRECT) ==================== */}
      <Route
        path="/students"
        element={<Navigate to="/coordinator/students" replace />}
      />

      <Route
        path="/students/:id"
        element={<Navigate to="/coordinator/students/:id" replace />}
      />

      <Route
        path="/approvals"
        element={<Navigate to="/coordinator/achievements" replace />}
      />

      <Route
        path="/achievements"
        element={<Navigate to="/student/achievements" replace />}
      />

      {/* ==================== DEFAULT REDIRECTS ==================== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExamProvider>
          <AppRoutes />
        </ExamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
