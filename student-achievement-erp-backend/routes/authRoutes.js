import express from 'express';
import Joi from 'joi';
import { validateDTO } from '../middlewares/validateDTO.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  registerSuperAdmin,
  registerCoordinator,
  registerStudent,
  login,
  refreshAccessToken,
} from '../controllers/authController.js';

const router = express.Router();

import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow 100 requests per 15 minutes (increased from default 5)
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const superAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const coordinatorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  tenantId: Joi.string().required(),
});

const studentSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rollNumber: Joi.string().required(),
  batch: Joi.string().required(),
  section: Joi.string().required(),
  tenantId: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

router.post('/register/superadmin', validateDTO(superAdminSchema), registerSuperAdmin);
router.post('/register/coordinator', validateDTO(coordinatorSchema), registerCoordinator);
router.post('/register/student', validateDTO(studentSchema), registerStudent);
router.post('/login',loginLimiter, validateDTO(loginSchema), login);
router.post('/refresh-token', validateDTO(refreshSchema), refreshAccessToken);
router.get('/me', authMiddleware, (req, res) => {
  res.json({ status: 'success', data: req.user });
});

export default router;
