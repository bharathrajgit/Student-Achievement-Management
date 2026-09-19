// routes/studentExamRoutes.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { tenantMiddleware } from '../middlewares/tenantMiddleware.js';
import { canRegisterForExam } from '../middlewares/examAuthMiddleware.js';
import {
  browseExamCatalog,
  registerForExam,
  getMyExams,
  getRegistrationDetails,
  uploadCertificate,
  resubmitCertificate,
  requestNewExam,
  getMyExamRequests,
} from '../controllers/studentExamController.js';

const router = express.Router();

console.log('\n📚 ==================== STUDENT EXAM ROUTES ====================');
console.log('📚 Loading studentExamRoutes.js');

// Apply middleware
router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(canRegisterForExam);

console.log('📚 Middleware applied: authMiddleware, tenantMiddleware, canRegisterForExam');

// ========================================
// CRITICAL: ORDER MATTERS!
// All specific named routes MUST be before parameterized routes
// ========================================

console.log('📚 Registering routes in CRITICAL ORDER:');

// 1. GET ROUTES (specific paths)
console.log('  → GET /catalog');
router.get('/catalog', (req, res, next) => {
  console.log('  ✓ GET /catalog hit');
  browseExamCatalog(req, res, next);
});

console.log('  → GET /my-exams');
router.get('/my-exams', (req, res, next) => {
  console.log('  ✓ GET /my-exams hit');
  getMyExams(req, res, next);
});

console.log('  → GET /my-requests');
router.get('/my-requests', (req, res, next) => {
  console.log('  ✓ GET /my-requests hit');
  getMyExamRequests(req, res, next);
});

// 2. POST ROUTES (specific paths - BEFORE :id routes)
console.log('  → POST /register');
router.post('/register', (req, res, next) => {
  console.log('  ✓ POST /register hit');
  console.log('  Body:', req.body);
  registerForExam(req, res, next);
});

console.log('  → POST /request-new');
router.post('/request-new', (req, res, next) => {
  console.log('  ✓ POST /request-new hit');
  requestNewExam(req, res, next);
});

// 3. PARAMETERIZED POST ROUTES (with :id)
console.log('  → POST /:registrationId/upload-certificate');
router.post('/:registrationId/upload-certificate', (req, res, next) => {
  console.log(`  ✓ POST /:registrationId/upload-certificate hit with ID: ${req.params.registrationId}`);
  uploadCertificate(req, res, next);
});

// 4. PUT ROUTES (with :id)
console.log('  → PUT /:registrationId/resubmit');
router.put('/:registrationId/resubmit', (req, res, next) => {
  console.log(`  ✓ PUT /:registrationId/resubmit hit with ID: ${req.params.registrationId}`);
  resubmitCertificate(req, res, next);
});

// 5. GET ROUTES WITH PARAMS (MUST BE LAST!)
console.log('  → GET /:registrationId (WILDCARD - LAST)');
router.get('/:registrationId', (req, res, next) => {
  console.log(`  ✓ GET /:registrationId hit with ID: ${req.params.registrationId}`);
  getRegistrationDetails(req, res, next);
});

console.log('📚 ============================================================\n');

export default router;
