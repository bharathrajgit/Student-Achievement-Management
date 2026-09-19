import express from 'express';
import Joi from 'joi';
import { authMiddleware, authorizeRole } from '../middlewares/authMiddleware.js';
import { validateDTO } from '../middlewares/validateDTO.js';
import {
  createTenant,
  getAllTenants,
  getTenantUsageReport,
  createCoordinator,
  getAllCoordinators,
  deleteCoordinator,
} from '../controllers/superadminController.js';

const router = express.Router();

// Middleware: Only superadmin
router.use(authMiddleware, authorizeRole('superadmin'));

// Validation schemas
const createTenantSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
});

const createCoordinatorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  tenantId: Joi.string().required(),
});

// Tenant Routes
router.post('/tenants', validateDTO(createTenantSchema), createTenant);
router.get('/tenants', getAllTenants);
router.get('/tenants/:tenantId/report', getTenantUsageReport);

// Coordinator Routes
router.post('/coordinators', validateDTO(createCoordinatorSchema), createCoordinator);
router.get('/coordinators', getAllCoordinators);
router.delete('/coordinators/:id', deleteCoordinator);

export default router;
