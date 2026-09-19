// routes/coordinatorExamRoutes.js
import express from 'express';
import {
  getPendingExamRequests,
  getAllExamRequests,
  approveExamRequest,
  rejectExamRequest,
} from '../controllers/coordinatorExamRequestController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { canManageExams } from '../middlewares/examAuthMiddleware.js';

const router = express.Router();

console.log('✅ coordinatorExamRoutes.js loaded');

// Apply middleware to all routes
router.use(authMiddleware, canManageExams);

// ==========================================
// SPECIFIC ROUTES FIRST (BEFORE :id)
// ==========================================

console.log('  → GET /pending');
router.get('/pending', getPendingExamRequests);

console.log('  → GET / (all requests)');
router.get('/', getAllExamRequests);

// ==========================================
// PARAMETERIZED ROUTES LAST
// ==========================================

console.log('  → PUT /:id/approve');
router.put('/:id/approve', (req, res, next) => {
  console.log(`\n🎯 APPROVE ROUTE HIT`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Base URL: ${req.baseUrl}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Full URL: ${req.baseUrl}${req.path}`);
  console.log(`   Params:`, req.params);
  console.log(`   ID: ${req.params.id}`);
  console.log(`   Body:`, req.body);
  approveExamRequest(req, res, next);
});

console.log('  → PUT /:id/reject');
router.put('/:id/reject', (req, res, next) => {
  console.log(`\n🎯 REJECT ROUTE HIT`);
  console.log(`   ID: ${req.params.id}`);
  rejectExamRequest(req, res, next);
});

console.log('📚 coordinatorExamRoutes.js registered successfully\n');

export default router;
