import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { canManageExams } from '../middlewares/examAuthMiddleware.js';
import {
  getNptelDashboard,
  getCourseDetails,
  getStudentNptelProgress,
} from '../controllers/nptelAnalyticsController.js';
import {
  bulkUploadMarks,
  batchApproveRequests,
} from '../controllers/nptelBulkController.js';
import {
  exportCourseData,
  exportAllExams,
  exportStudentTranscript,
  getSampleCsvTemplate,
} from '../controllers/nptelExportController.js';
import {
  getNotifications,
  markNotificationAsRead,
  getApprovalQueue,
} from '../controllers/notificationController.js';

const router = express.Router();

console.log('✅ nptelRoutes.js loaded');

// All routes require auth and coordinator role
router.use(authMiddleware, canManageExams);

// ==================== ANALYTICS ====================

/**
 * GET /api/coordinator/nptel/dashboard
 * Comprehensive NPTEL dashboard with all metrics
 */
router.get('/dashboard', getNptelDashboard);

/**
 * GET /api/coordinator/nptel/course/:examName/details
 * Get detailed breakdown for a specific course
 */
router.get('/course/:examName/details', getCourseDetails);

/**
 * GET /api/coordinator/nptel/student/:studentId/progress
 * Get student's NPTEL exam progress
 */
router.get('/student/:studentId/progress', getStudentNptelProgress);

// ==================== BULK OPERATIONS ====================

/**
 * POST /api/coordinator/nptel/bulk-upload-marks
 * Bulk upload marks from CSV
 */
router.post('/bulk-upload-marks', bulkUploadMarks);

/**
 * POST /api/coordinator/nptel/batch-approve-requests
 * Approve multiple exam requests at once
 */
router.post('/batch-approve-requests', batchApproveRequests);

// ==================== EXPORTS ====================

/**
 * GET /api/coordinator/nptel/export/course/:examName
 * Export specific course data
 */
router.get('/export/course/:examName', exportCourseData);

/**
 * GET /api/coordinator/nptel/export/all-exams
 * Export all exam records
 */
router.get('/export/all-exams', exportAllExams);

/**
 * GET /api/coordinator/nptel/export/student-transcript/:studentId
 * Export student transcript
 */
router.get('/export/student-transcript/:studentId', exportStudentTranscript);

/**
 * GET /api/coordinator/nptel/export/sample-csv
 * Download sample CSV template for bulk upload
 */
router.get('/export/sample-csv', getSampleCsvTemplate);

// ==================== NOTIFICATIONS & APPROVAL QUEUE ====================

/**
 * GET /api/coordinator/nptel/notifications
 * Get coordinator's notifications
 */
router.get('/notifications', getNotifications);

/**
 * PUT /api/coordinator/nptel/notifications/:notificationId/read
 * Mark notification as read
 */
router.put('/notifications/:notificationId/read', markNotificationAsRead);

/**
 * GET /api/coordinator/nptel/approval-queue
 * Get pending approvals queue with SLA metrics
 */
router.get('/approval-queue', getApprovalQueue);

/**
 * POST /api/coordinator/nptel/fix-registration-dates
 * Fix registration dates for existing records (admin only)
 */
router.post('/fix-registration-dates', async (req, res) => {
  try {
    const { ExamRegistration } = await import('../models/ExamRegistration.js');
    
    const registrations = await ExamRegistration.find({
      $or: [
        { registrationDate: null },
        { registrationDate: { $exists: false } },
      ]
    });

    let updated = 0;
    for (const reg of registrations) {
      await ExamRegistration.updateOne(
        { _id: reg._id },
        { $set: { registrationDate: reg.createdAt } }
      );
      updated++;
    }

    res.status(200).json({
      status: 'success',
      message: `Fixed ${updated} registration dates`,
      data: { updated }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fix registration dates',
      details: error.message
    });
  }
});

export default router;
