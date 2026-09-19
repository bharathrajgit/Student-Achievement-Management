// routes/reportRoutes.js
import express from 'express';
import {
  exportAllRegistrations,      // ✅ Changed from generateStudentReport
  exportExamGroup,              // ✅ Changed from generateExamReport
  exportStudentExamHistory,     // ✅ Changed from generateOverallReport
  buildCustomReport,            // ✅ Added new function
} from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { canManageExams } from '../middlewares/examAuthMiddleware.js';

const router = express.Router();

console.log('✅ reportRoutes.js loaded');

// Authentication & Authorization
router.use(authMiddleware, canManageExams);

// ==========================================
// REPORT ROUTES
// ==========================================

/**
 * GET /api/coordinator/reports/export-registrations
 * Export all registrations to Excel
 * Query params: ?examName=AWS&status=Passed&platform=AWS
 */
router.get('/export-registrations', exportAllRegistrations);

/**
 * GET /api/coordinator/reports/export-group/:examName
 * Export exam group report to Excel
 */
router.get('/export-group/:examName', exportExamGroup);

/**
 * GET /api/coordinator/reports/student/:studentId/export
 * Export student exam history to Excel
 */
router.get('/student/:studentId/export', exportStudentExamHistory);

/**
 * POST /api/coordinator/reports/custom
 * Build custom report with filters
 * Body: { filters: { platform, status, examName, dateRange }, format: 'xlsx' | 'csv' }
 */
router.post('/custom', buildCustomReport);

export default router; // ✅ MUST HAVE THIS!
