// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { tenantMiddleware } from './middlewares/tenantMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import superadminRoutes from './routes/superadminRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import studentBiodataRoutes from './routes/studentBiodataRoutes.js';
import examCatalogRoutes from './routes/examCatalogRoutes.js';
import studentExamRoutes from './routes/studentExamRoutes.js';
import coordinatorExamRoutes from './routes/coordinatorExamRoutes.js';
import coordinatorSubmissionRoutes from './routes/coordinatorSubmissionRoutes.js';
import analyticRoutes from './routes/analyticRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import nptelRoutes from './routes/nptelRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(helmet());
app.use(cors({ 
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(tenantMiddleware);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server running', 
    timestamp: new Date().toISOString() 
  });
});

console.log('\n🔗 =============================================');
console.log('🔗 REGISTERING ALL ROUTES');
console.log('🔗 =============================================\n');

// ==========================================
// AUTH ROUTES
// ==========================================

console.log('📍 Registering /api/auth routes');
app.use('/api/auth', authRoutes);

// ==========================================
// ADMIN ROUTES
// ==========================================

console.log('📍 Registering /api/admin routes');
app.use('/api/admin', adminRoutes);

console.log('📍 Registering /api/superadmin routes');
app.use('/api/superadmin', superadminRoutes);

// ==========================================
// STATS ROUTES
// ==========================================

console.log('📍 Registering /api/stats routes');
app.use('/api/stats', statsRoutes);

// ==========================================
// COORDINATOR ROUTES
// ⚠️ ORDER MATTERS: Specific routes BEFORE general routes
// ==========================================

// 1. Analytics routes FIRST (most specific)
console.log('📍 Registering /api/coordinator/analytics routes');
app.use('/api/coordinator/analytics', analyticRoutes);

// 1.5. NPTEL routes (NEW - Phase 1 & 2 enhancements)
console.log('📍 Registering /api/coordinator/nptel routes');
app.use('/api/coordinator/nptel', nptelRoutes);

// 2. Reports routes
console.log('📍 Registering /api/coordinator/reports routes');
app.use('/api/coordinator/reports', reportRoutes);

// 3. Exam catalog routes
console.log('📍 Registering /api/coordinator/exam-catalog routes');
app.use('/api/coordinator/exam-catalog', examCatalogRoutes);

// 4. Exam requests routes
console.log('📍 Registering /api/coordinator/exam-requests routes');
app.use('/api/coordinator/exam-requests', coordinatorExamRoutes);

// 5. Submissions routes
console.log('📍 Registering /api/coordinator/submissions routes');
app.use('/api/coordinator/submissions', coordinatorSubmissionRoutes);

// 6. General coordinator routes LAST
console.log('📍 Registering /api/coordinator routes (general)');
app.use('/api/coordinator', coordinatorRoutes);

// ==========================================
// STUDENT ROUTES
// ⚠️ ORDER MATTERS: Specific routes BEFORE general routes
// ==========================================

// 1. Biodata routes FIRST (most specific)
console.log('📍 Registering /api/student/biodata routes');
app.use('/api/student', studentBiodataRoutes);

// 2. Exams routes
console.log('📍 Registering /api/student/exams routes');
app.use('/api/student/exams', studentExamRoutes);

// 3. General student routes LAST
console.log('📍 Registering /api/student routes (general)');
app.use('/api/student', studentRoutes);

console.log('\n✅ =============================================');
console.log('✅ ALL ROUTES REGISTERED SUCCESSFULLY');
console.log('✅ =============================================\n');

// ==========================================
// ERROR HANDLERS (MUST BE LAST)
// ==========================================

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    status: 'error', 
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    logger.info('✓ Database connected');
    
    app.listen(PORT, () => {
      logger.info(`✓ Server running on http://localhost:${PORT}`);
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    logger.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;
