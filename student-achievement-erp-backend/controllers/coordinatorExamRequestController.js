// controllers/coordinatorExamRequestController.js
import { ExamRequest } from '../models/ExamRequest.js';
import { ExamCatalog } from '../models/ExamCatalog.js';
import { ExamRegistration } from '../models/ExamRegistration.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Get all pending exam requests
 * GET /coordinator/exam-requests/pending
 */
export const getPendingExamRequests = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { platform, limit = 50, page = 1 } = req.query;

    const filter = { tenantId, status: 'Pending' };

    if (platform && platform !== 'all') {
      filter.platform = platform;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await ExamRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('studentId', 'name email rollNumber');

    const total = await ExamRequest.countDocuments(filter);

    return res.status(200).json({
      status: 'success',
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching pending exam requests:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam requests',
      error: error.message,
    });
  }
};

/**
 * Get all exam requests (with filters)
 * GET /coordinator/exam-requests
 */
export const getAllExamRequests = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, platform, limit = 50, page = 1 } = req.query;

    const filter = { tenantId };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (platform && platform !== 'all') {
      filter.platform = platform;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await ExamRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('studentId', 'name email rollNumber')
      .populate('reviewedBy', 'name email role')
      .populate('createdExamId', 'examName platform');

    const total = await ExamRequest.countDocuments(filter);

    return res.status(200).json({
      status: 'success',
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching exam requests:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam requests',
      error: error.message,
    });
  }
};

/**
 * Approve exam request (adds to catalog and auto-registers student)
 * PUT /coordinator/exam-requests/:id/approve
 */
export const approveExamRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const { description } = req.body;
    const tenantId = req.tenantId;
    const coordinatorId = req.user.id;

    console.log('\n📋 APPROVE EXAM REQUEST - START');
    console.log('   ID received:', id);
    console.log('   ID type:', typeof id);
    console.log('   ID length:', id?.length);
    console.log('   Tenant ID:', tenantId);
    console.log('   Coordinator ID:', coordinatorId);

    // ✅ Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      logger.error(`❌ Invalid exam request ID: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid exam request ID format',
        debug: {
          receivedId: id,
          type: typeof id,
        }
      });
    }

    console.log('   ✓ ID is valid MongoDB ObjectId');

    // Find request
    console.log('   🔍 Searching for exam request...');
    const examRequest = await ExamRequest.findOne({
      _id: id,
      tenantId,
    }).populate('studentId');

    // Check if request exists
    if (!examRequest) {
      logger.error(`❌ Exam request not found: ${id}`);
      
      // Debug: Check if it exists with different tenant
      const anyRequest = await ExamRequest.findById(id);
      if (anyRequest) {
        logger.error(`   ⚠️ Request exists but belongs to different tenant`);
        logger.error(`      Expected tenant: ${tenantId}`);
        logger.error(`      Actual tenant: ${anyRequest.tenantId}`);
      } else {
        logger.error(`   ⚠️ Request does not exist in database at all`);
      }
      
      return res.status(404).json({
        status: 'error',
        message: 'Exam request not found',
        debug: {
          requestId: id,
          tenantId: tenantId,
          existsInDB: !!anyRequest,
        }
      });
    }

    console.log('   ✓ Exam request found:', examRequest.examName);

    // Check if already processed
    if (examRequest.status !== 'Pending') {
      logger.warn(`⚠️ Exam request already processed: ${examRequest.status}`);
      return res.status(400).json({
        status: 'error',
        message: `Exam request already ${examRequest.status.toLowerCase()}`,
        data: examRequest,
      });
    }

    console.log('   ✓ Status is Pending, proceeding with approval');

    // Check if exam already exists (case-insensitive)
    console.log('   🔍 Checking if exam exists in catalog...');
    const existingExam = await ExamCatalog.findOne({
      tenantId,
      examName: { $regex: `^${examRequest.examName}$`, $options: 'i' },
    });

    let createdExam;

    if (existingExam) {
      createdExam = existingExam;
      console.log('   ♻️ Using existing exam:', existingExam.examName);
    } else {
      console.log('   ➕ Creating new exam in catalog...');
      createdExam = await ExamCatalog.create({
        tenantId,
        examName: examRequest.examName.trim(),
        platform: examRequest.platform.trim(),
        category: examRequest.category || 'Certification',
        description: description || examRequest.justification,
        officialLink: examRequest.officialLink || '',
        examDate: examRequest.examDate,
        examRegisterLastDate: examRequest.examRegisterLastDate,
        examEnterOption: examRequest.examEnterOption,
        examLink: examRequest.examLink || '',
        createdBy: coordinatorId,
        isActive: true,
      });
      console.log('   ✓ New exam created:', createdExam.examName);
    }

    // Auto-register the requesting student
    console.log('   👤 Checking student registration...');
    const existingRegistration = await ExamRegistration.findOne({
      tenantId,
      studentId: examRequest.studentId._id,
      examId: createdExam._id,
    });

    if (!existingRegistration) {
      console.log('   ➕ Auto-registering student...');
      const newRegistration = await ExamRegistration.create({
        tenantId,
        studentId: examRequest.studentId._id,
        studentName: examRequest.studentName,
        rollNumber: examRequest.rollNumber,
        examId: createdExam._id,
        examName: createdExam.examName,
        platform: createdExam.platform,
        status: 'Registered',
        registrationDate: new Date(),
      });
      console.log('   ✓ Student auto-registered:', newRegistration._id);
    } else {
      console.log('   ℹ️ Student already registered for this exam');
    }

    // Update request status
    console.log('   📝 Updating exam request status...');
    const coordinator = await User.findById(coordinatorId);
    examRequest.status = 'Approved';
    examRequest.reviewedBy = coordinatorId;
    examRequest.reviewedByName = coordinator.name;
    examRequest.reviewedByRole = coordinator.role;
    examRequest.reviewedDate = new Date();
    examRequest.createdExamId = createdExam._id;

    await examRequest.save();

    console.log('   ✅ Exam request approved successfully!');
    console.log('📋 APPROVE EXAM REQUEST - END\n');

    logger.info(`🎉 Exam request approved: ${examRequest.examName} by ${coordinator.name}`);

    return res.status(200).json({
      status: 'success',
      message: 'Exam request approved. Exam added to catalog and student auto-registered.',
      data: {
        request: examRequest,
        exam: createdExam,
      },
    });
  } catch (error) {
    console.error('\n❌ ERROR IN APPROVE EXAM REQUEST:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    logger.error('❌ Error approving exam request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to approve exam request',
      error: error.message,
    });
  }
};


/**
 * Reject exam request
 * PUT /coordinator/exam-requests/:id/reject
 */
export const rejectExamRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const tenantId = req.tenantId;
    const coordinatorId = req.user.id;

    // Validation
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'rejectionReason is required',
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid exam request ID format',
      });
    }

    // Find request
    const examRequest = await ExamRequest.findOne({
      _id: id,
      tenantId,
    });

    if (!examRequest) {
      return res.status(404).json({
        status: 'error',
        message: 'Exam request not found',
      });
    }

    if (examRequest.status !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: `Exam request already ${examRequest.status.toLowerCase()}`,
      });
    }

    // Update request status
    const coordinator = await User.findById(coordinatorId);
    examRequest.status = 'Rejected';
    examRequest.reviewedBy = coordinatorId;
    examRequest.reviewedByName = coordinator.name;
    examRequest.reviewedByRole = coordinator.role;
    examRequest.reviewedDate = new Date();
    examRequest.rejectionReason = rejectionReason.trim();

    await examRequest.save();

    logger.info(`❌ Exam request rejected: ${examRequest.examName} by ${coordinator.name}`);
    logger.info(`   Reason: ${rejectionReason}`);

    return res.status(200).json({
      status: 'success',
      message: 'Exam request rejected',
      data: examRequest,
    });
  } catch (error) {
    logger.error('Error rejecting exam request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to reject exam request',
      error: error.message,
    });
  }
};
