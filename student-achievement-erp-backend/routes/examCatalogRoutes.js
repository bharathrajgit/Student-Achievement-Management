// routes/examCatalogRoutes.js
import express from 'express';
import {
  createExam,        // ✅ Changed from addExamToCatalog
  getAllExams,
  getExamById,
  updateExam,
  archiveExam,       // ✅ Changed from deleteExam
  restoreExam,       // ✅ Added new function
} from '../controllers/examCatalogController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { canManageExams } from '../middlewares/examAuthMiddleware.js';

const router = express.Router();

console.log('✅ examCatalogRoutes.js loaded');

// Authentication & Authorization
router.use(authMiddleware, canManageExams);

// ==========================================
// EXAM CATALOG ROUTES
// ==========================================

// GET /api/coordinator/exam-catalog
router.get('/', getAllExams);

// GET /api/coordinator/exam-catalog/:id
router.get('/:id', getExamById);

// POST /api/coordinator/exam-catalog
router.post('/', createExam);

// PUT /api/coordinator/exam-catalog/:id
router.put('/:id', updateExam);

// DELETE /api/coordinator/exam-catalog/:id (archive)
router.delete('/:id', archiveExam);

// PATCH /api/coordinator/exam-catalog/:id/restore
router.patch('/:id/restore', restoreExam);

export default router; // ✅ MUST HAVE THIS!
