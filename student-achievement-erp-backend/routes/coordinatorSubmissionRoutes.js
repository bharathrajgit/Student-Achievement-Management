// routes/coordinatorSubmissionRoutes.js
import express from 'express';
import {
  getPendingSubmissions,
  getSubmissionForVerification,
  approveSubmission,
  rejectSubmission,
  bulkApproveSubmissions,
  getVerificationHistory,
  getVerifiedSubmissions,
} from '../controllers/coordinatorExamController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { canManageExams } from '../middlewares/examAuthMiddleware.js';

const router = express.Router();

console.log('✅ coordinatorSubmissionRoutes.js loaded');

router.use(authMiddleware, canManageExams);

// GET /api/coordinator/submissions/pending
router.get('/pending', getPendingSubmissions);

// GET /api/coordinator/submissions/verified
router.get('/verified', getVerifiedSubmissions);

// GET /api/coordinator/submissions/:registrationId
router.get('/:registrationId', getSubmissionForVerification);

// GET /api/coordinator/submissions/:registrationId/history
router.get('/:registrationId/history', getVerificationHistory);

// PUT /api/coordinator/submissions/:registrationId/approve
router.put('/:registrationId/approve', approveSubmission);

// PUT /api/coordinator/submissions/:registrationId/reject
router.put('/:registrationId/reject', rejectSubmission);

// POST /api/coordinator/submissions/bulk-approve
router.post('/bulk-approve', bulkApproveSubmissions);

export default router; // ✅ MUST HAVE THIS!
