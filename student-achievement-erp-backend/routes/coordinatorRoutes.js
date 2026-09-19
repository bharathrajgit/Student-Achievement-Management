// routes/coordinatorRoutes.js
import express from 'express';
import Joi from 'joi';
import { authMiddleware, authorizeRole } from '../middlewares/authMiddleware.js';
import { validateDTO } from '../middlewares/validateDTO.js';
import {
  createSubCoordinator,
  getSubCoordinators,
  deleteSubCoordinator,
} from '../controllers/coordinatorController.js';
import { getStudentBiodataById } from '../controllers/adminBiodataController.js';
import { getStudentAchievements } from '../controllers/coordinatorExamController.js';

const router = express.Router();

console.log('✅ coordinatorRoutes.js loaded');

// All routes here require coordinator or sub-coordinator
router.use(authMiddleware, authorizeRole('coordinator', 'sub-coordinator'));

// Validation schema
const createSubCoordinatorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// ==========================================
// STUDENT MANAGEMENT ROUTES
// ==========================================

// View a student's biodata (coordinator only)
router.get('/students/:studentId/biodata', getStudentBiodataById);

router.get('/students/:studentId/achievements', getStudentAchievements);

// ==========================================
// SUB-COORDINATOR ROUTES (coordinator only)
// ==========================================

// Create sub-coordinator (only main coordinator)
router.post(
  '/sub-coordinators',
  authorizeRole('coordinator'), // Only coordinator can create
  validateDTO(createSubCoordinatorSchema),
  createSubCoordinator
);

// Get all sub-coordinators
router.get('/sub-coordinators', getSubCoordinators);

// Delete sub-coordinator (only main coordinator)
router.delete(
  '/sub-coordinators/:id',
  authorizeRole('coordinator'), // Only coordinator can delete
  deleteSubCoordinator
);

export default router; // ✅ MUST HAVE THIS!
