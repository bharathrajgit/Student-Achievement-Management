// routes/studentBiodataRoutes.js
import express from 'express';
import { getMyBiodata, upsertMyBiodata } from '../controllers/studentBiodataController.js';
import { authMiddleware, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes below are for logged-in students only
router.use(authMiddleware);
router.use(authorizeRole('student'));

// GET my biodata
router.get('/biodata', getMyBiodata);

// CREATE/UPDATE my biodata  
router.post('/biodata', upsertMyBiodata);

// ✅ ADD THIS LINE - EXPORT DEFAULT
export default router;
