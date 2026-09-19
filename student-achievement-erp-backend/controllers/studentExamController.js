// controllers/studentExamController.js
import { ExamCatalog } from '../models/ExamCatalog.js';
import { ExamRegistration } from '../models/ExamRegistration.js';
import { ExamRequest } from '../models/ExamRequest.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';  // ✅ ADD THIS

/**
 * Browse exam catalog (student view)
 * GET /student/exams/catalog
 */
export const browseExamCatalog = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { platform, category, search, limit = 50, page = 1 } = req.query;

    const filter = { tenantId, isActive: true };

    if (platform && platform !== 'all') {
      filter.platform = platform;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.examName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const exams = await ExamCatalog.find(filter)
      .sort({ examName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const examsWithCounts = await Promise.all(
      exams.map(async (exam) => {
        const registrationCount = await ExamRegistration.countDocuments({
          tenantId,
          examId: exam._id,
        });

        return {
          ...exam.toObject(),
          registrationCount,
        };
      })
    );

    const total = await ExamCatalog.countDocuments(filter);

    return res.status(200).json({
      status: 'success',
      data: examsWithCounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error browsing exam catalog:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam catalog',
      error: error.message,
    });
  }
};

/**
 * Register for an exam
 * POST /student/exams/register
 */
export const registerForExam = async (req, res) => {
  try {
    const { examId, expectedCompletionDate } = req.body;
    const tenantId = req.tenantId;
    const studentId = req.user.id;

    console.log('📝 REGISTER FOR EXAM');
    console.log('   examId:', examId);
    console.log('   expectedCompletionDate:', expectedCompletionDate);

    if (!examId) {
      return res.status(400).json({
        status: 'error',
        message: 'examId is required',
      });
    }

    // ✅ VALIDATE examId format
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid examId format',
      });
    }

    const exam = await ExamCatalog.findOne({
      _id: examId,
      tenantId,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Exam not found or inactive',
      });
    }

    const existingRegistration = await ExamRegistration.findOne({
      tenantId,
      studentId,
      examId,
      status: { $in: ['Registered', 'Submitted'] },
    });

    if (existingRegistration) {
      return res.status(409).json({
        status: 'error',
        message: 'You are already registered for this exam',
        data: existingRegistration,
      });
    }

    const student = await User.findById(studentId);

    // ✅ ENSURE examId IS SET
    const registration = await ExamRegistration.create({
      tenantId,
      studentId,
      studentName: student.name,
      rollNumber: student.rollNumber || student.email,
      examId: exam._id,  // ✅ MUST BE SET
      examName: exam.examName,
      platform: exam.platform,
      registrationDate: new Date(),
      expectedCompletionDate: expectedCompletionDate || null,
      status: 'Registered',
    });

    console.log('✅ Registration created:', registration._id);
    console.log('   examId:', registration.examId);

    logger.info(`Student ${student.name} registered for ${exam.examName}`);

    return res.status(201).json({
      status: 'success',
      message: 'Successfully registered for exam',
      data: registration,
    });
  } catch (error) {
    logger.error('Error registering for exam:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to register for exam',
      error: error.message,
    });
  }
};


/**
 * View my registered exams
 * GET /student/exams/my-exams
 */
export const getMyExams = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const studentId = req.user.id;
    const { status } = req.query;

    const filter = { tenantId, studentId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const registrations = await ExamRegistration.find(filter)
      .sort({ createdAt: -1 })
      .populate('examId', 'examName platform category description officialLink');

    return res.status(200).json({
      status: 'success',
      data: registrations,
    });
  } catch (error) {
    logger.error('Error fetching student exams:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your exams',
      error: error.message,
    });
  }
};

/**
 * Get single registration details
 * GET /student/exams/:registrationId
 */
export const getRegistrationDetails = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const tenantId = req.tenantId;
    const studentId = req.user.id;

    const registration = await ExamRegistration.findOne({
      _id: registrationId,
      tenantId,
      studentId,
    }).populate('examId verifiedBy');

    if (!registration) {
      return res.status(404).json({
        status: 'error',
        message: 'Registration not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: registration,
    });
  } catch (error) {
    logger.error('Error fetching registration details:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch registration details',
      error: error.message,
    });
  }
};

/**
 * Upload certificate
 * POST /student/exams/:registrationId/upload-certificate
 */
export const uploadCertificate = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { certificateLink, marksObtained, totalMarks, examCompletionDate } =
      req.body;
    const tenantId = req.tenantId;
    const studentId = req.user.id;

    if (!certificateLink || !examCompletionDate) {
      return res.status(400).json({
        status: 'error',
        message: 'certificateLink and examCompletionDate are required',
      });
    }

    if (!certificateLink.includes('drive.google.com')) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid Google Drive shareable link',
      });
    }

    if (marksObtained && totalMarks && marksObtained > totalMarks) {
      return res.status(400).json({
        status: 'error',
        message: 'Marks obtained cannot exceed total marks',
      });
    }

    const registration = await ExamRegistration.findOne({
      _id: registrationId,
      tenantId,
      studentId,
    });

    if (!registration) {
      return res.status(404).json({
        status: 'error',
        message: 'Registration not found',
      });
    }

    if (registration.status === 'Passed') {
      return res.status(400).json({
        status: 'error',
        message: 'Certificate already verified and approved',
      });
    }

    registration.certificateLink = certificateLink.trim();
    registration.marksObtained = marksObtained || null;
    registration.totalMarks = totalMarks || null;
    registration.examCompletionDate = new Date(examCompletionDate);
    registration.submittedDate = new Date();
    registration.status = 'Submitted';

    await registration.save();

    logger.info(
      `Certificate uploaded for registration ${registrationId}`
    );

    return res.status(200).json({
      status: 'success',
      message: 'Certificate uploaded successfully. Awaiting verification.',
      data: registration,
    });
  } catch (error) {
    logger.error('Error uploading certificate:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to upload certificate',
      error: error.message,
    });
  }
};

/**
 * Resubmit certificate after rejection
 * PUT /student/exams/:registrationId/resubmit
 */
export const resubmitCertificate = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { certificateLink, marksObtained, totalMarks, examCompletionDate } =
      req.body;
    const tenantId = req.tenantId;
    const studentId = req.user.id;

    if (!certificateLink || !examCompletionDate) {
      return res.status(400).json({
        status: 'error',
        message: 'certificateLink and examCompletionDate are required',
      });
    }

    const registration = await ExamRegistration.findOne({
      _id: registrationId,
      tenantId,
      studentId,
    });

    if (!registration) {
      return res.status(404).json({
        status: 'error',
        message: 'Registration not found',
      });
    }

    if (registration.status !== 'Failed') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only resubmit rejected certificates',
      });
    }

    registration.previousAttempts.push({
      attemptNumber: registration.attemptNumber,
      certificateLink: registration.certificateLink,
      marksObtained: registration.marksObtained,
      submittedDate: registration.submittedDate,
      rejectionReason: registration.feedback,
      rejectedDate: registration.verificationDate,
    });

    registration.attemptNumber += 1;
    registration.certificateLink = certificateLink.trim();
    registration.marksObtained = marksObtained || null;
    registration.totalMarks = totalMarks || null;
    registration.examCompletionDate = new Date(examCompletionDate);
    registration.submittedDate = new Date();
    registration.status = 'Submitted';
    registration.feedback = null;
    registration.verifiedBy = null;
    registration.verifiedByName = null;
    registration.verifiedByRole = null;
    registration.verificationDate = null;

    await registration.save();

    logger.info(
      `Certificate resubmitted (attempt ${registration.attemptNumber}) for registration ${registrationId}`
    );

    return res.status(200).json({
      status: 'success',
      message: `Certificate resubmitted (Attempt ${registration.attemptNumber}). Awaiting verification.`,
      data: registration,
    });
  } catch (error) {
    logger.error('Error resubmitting certificate:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to resubmit certificate',
      error: error.message,
    });
  }
};

/**
 * Request new exam to be added to catalog
 * POST /student/exams/request-new
 */
export const requestNewExam = async (req, res) => {
  try {
    const {
      examName,
      platform,
      category,
      officialLink,
      justification,
      examDate,
      examRegisterLastDate,
      examEnterOption,
      examLink,
    } = req.body;
    const tenantId = req.tenantId;
    const studentId = req.user.id;

    // Validation
    if (!examName || !platform || !justification) {
      return res.status(400).json({
        status: 'error',
        message: 'examName, platform, and justification are required',
      });
    }

    if (!examDate || !examRegisterLastDate || !examEnterOption) {
      return res.status(400).json({
        status: 'error',
        message: 'examDate, examRegisterLastDate, and examEnterOption are required',
      });
    }

    if (justification.length < 20) {
      return res.status(400).json({
        status: 'error',
        message: 'Justification must be at least 20 characters',
      });
    }

    // Check if exam already exists in catalog
    const existingExam = await ExamCatalog.findOne({
      tenantId,
      examName: { $regex: `^${examName}$`, $options: 'i' },
      isActive: true,
    });

    if (existingExam) {
      return res.status(409).json({
        status: 'error',
        message: `Exam "${examName}" already exists in catalog. You can register directly.`,
        data: existingExam,
      });
    }

    // Check if student already requested this exam (pending)
    const existingRequest = await ExamRequest.findOne({
      tenantId,
      studentId,
      examName: { $regex: `^${examName}$`, $options: 'i' },
      status: 'Pending',
    });

    if (existingRequest) {
      return res.status(409).json({
        status: 'error',
        message: 'You already have a pending request for this exam',
        data: existingRequest,
      });
    }

    // Get student details
    const student = await User.findById(studentId);

    // Create exam request
    const examRequest = await ExamRequest.create({
      tenantId,
      studentId,
      studentName: student.name,
      rollNumber: student.rollNumber || student.email,
      examName: examName.trim(),
      platform: platform.trim(),
      category: category ? category.trim() : 'Certification',
      officialLink: officialLink ? officialLink.trim() : '',
      justification: justification.trim(),
      examDate: new Date(examDate),
      examRegisterLastDate: new Date(examRegisterLastDate),
      examEnterOption: examEnterOption,
      examLink: examLink ? examLink.trim() : '',
      status: 'Pending',
    });

    logger.info(
      `Exam request created: ${examName} by ${student.name}`
    );

    return res.status(201).json({
      status: 'success',
      message: 'Exam request submitted successfully. Awaiting coordinator approval.',
      data: examRequest,
    });
  } catch (error) {
    logger.error('Error requesting new exam:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit exam request',
      error: error.message,
    });
  }
};

/**
 * View my exam requests
 * GET /student/exams/my-requests
 */
export const getMyExamRequests = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const studentId = req.user.id;
    const { status } = req.query;

    const filter = { tenantId, studentId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await ExamRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email role')
      .populate('createdExamId', 'examName platform');

    return res.status(200).json({
      status: 'success',
      data: requests,
    });
  } catch (error) {
    logger.error('Error fetching student exam requests:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your exam requests',
      error: error.message,
    });
  }
};
