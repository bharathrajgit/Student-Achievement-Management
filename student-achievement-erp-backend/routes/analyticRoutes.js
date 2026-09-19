// routes/analyticRoutes.js
import express from 'express';
import {
  getDashboardOverview,
} from '../controllers/coordinatorExamController.js'; // ✅ CORRECT IMPORT!
import {
  getExamGroups,
  getExamGroupStudents,
  getExamAnalytics,
  getStudentProgress,
  getOverdueExams,
  getLowEnrollment,
} from '../controllers/analyticController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { canManageExams } from '../middlewares/examAuthMiddleware.js';

const router = express.Router();

console.log('✅ analyticRoutes.js loaded');

// All routes require auth and coordinator role
router.use(authMiddleware, canManageExams);

/**
 * GET /api/coordinator/analytics/overview
 * Get dashboard overview statistics
 */
router.get('/overview', getDashboardOverview);

/**
 * GET /api/coordinator/analytics/exam-groups
 * Get all exam groups (auto-grouped)
 */
router.get('/exam-groups', getExamGroups);

/**
 * GET /api/coordinator/analytics/exam-groups/:examName/students
 * Get students in a specific exam group
 */
router.get('/exam-groups/:examName/students', getExamGroupStudents);

/**
 * GET /api/coordinator/analytics/exam/:examName
 * Get exam-specific analytics
 */
router.get('/exam/:examName', getExamAnalytics);

/**
 * GET /api/coordinator/analytics/student/:studentId
 * Get student progress tracking
 */
router.get('/student/:studentId', getStudentProgress);

/**
 * GET /api/coordinator/analytics/overdue
 * Get overdue exams
 */
router.get('/overdue', getOverdueExams);

/**
 * GET /api/coordinator/analytics/low-enrollment
 * Get low enrollment exams
 */
router.get('/low-enrollment', getLowEnrollment);

export default router;
