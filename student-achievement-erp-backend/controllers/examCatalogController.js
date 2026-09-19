// controllers/examCatalogController.js
import { ExamCatalog } from '../models/ExamCatalog.js';
import {logger} from '../utils/logger.js';

/**
 * Create a new exam in the catalog
 * POST /coordinator/exam-catalog
 */
export const createExam = async (req, res) => {
  try {
    const { examName, platform, category, description, officialLink } = req.body;
    const tenantId = req.tenantId;
    const userId = req.user.id;

    // Validation
    if (!examName || !platform) {
      return res.status(400).json({
        status: 'error',
        message: 'examName and platform are required',
      });
    }

    // Check if exam with same name already exists in this tenant
    const existingExam = await ExamCatalog.findOne({
      tenantId,
      examName: { $regex: `^${examName}$`, $options: 'i' }, // case-insensitive
    });

    if (existingExam) {
      return res.status(409).json({
        status: 'error',
        message: `Exam "${examName}" already exists in your catalog`,
      });
    }

    const newExam = await ExamCatalog.create({
      tenantId,
      examName: examName.trim(),
      platform,
      category: category || 'Certification',
      description: description ? description.trim() : '',
      officialLink: officialLink ? officialLink.trim() : '',
      createdBy: userId,
    });

    logger.info(
      `Exam created: ${newExam.examName} (${newExam._id}) by user ${userId}`
    );

    return res.status(201).json({
      status: 'success',
      message: 'Exam added to catalog successfully',
      data: newExam,
    });
  } catch (error) {
    logger.error('Error creating exam:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create exam',
      error: error.message,
    });
  }
};

/**
 * Get all exams in catalog for this tenant
 * GET /coordinator/exam-catalog
 * Query params: ?isActive=true&platform=NPTEL&limit=50&page=1
 */
export const getAllExams = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { isActive = true, platform, limit = 50, page = 1 } = req.query;

    const filter = { tenantId };

    // Apply filters
    if (isActive !== 'all') {
      filter.isActive = isActive === 'true';
    }
    if (platform && platform !== 'all') {
      filter.platform = platform;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const exams = await ExamCatalog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email role'); // Get coordinator info

    const total = await ExamCatalog.countDocuments(filter);

    return res.status(200).json({
      status: 'success',
      data: exams,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching exams:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exams',
      error: error.message,
    });
  }
};

/**
 * Get single exam by ID
 * GET /coordinator/exam-catalog/:id
 */
export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const exam = await ExamCatalog.findOne({
      _id: id,
      tenantId,
    }).populate('createdBy', 'name email role');

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Exam not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: exam,
    });
  } catch (error) {
    logger.error('Error fetching exam:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam',
      error: error.message,
    });
  }
};

/**
 * Update exam details
 * PUT /coordinator/exam-catalog/:id
 */
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const { examName, platform, category, description, officialLink, isActive } =
      req.body;

    // Check if exam exists
    const exam = await ExamCatalog.findOne({ _id: id, tenantId });

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Exam not found',
      });
    }

    // If changing name, check for duplicates
    if (examName && examName.toLowerCase() !== exam.examName.toLowerCase()) {
      const duplicate = await ExamCatalog.findOne({
        tenantId,
        examName: { $regex: `^${examName}$`, $options: 'i' },
      });

      if (duplicate) {
        return res.status(409).json({
          status: 'error',
          message: `Exam "${examName}" already exists`,
        });
      }
    }

    // Update allowed fields
    if (examName) exam.examName = examName.trim();
    if (platform) exam.platform = platform;
    if (category) exam.category = category;
    if (description !== undefined) exam.description = description.trim();
    if (officialLink !== undefined) exam.officialLink = officialLink.trim();
    if (isActive !== undefined) exam.isActive = isActive;

    await exam.save();

    logger.info(`Exam updated: ${exam.examName} (${exam._id})`);

    return res.status(200).json({
      status: 'success',
      message: 'Exam updated successfully',
      data: exam,
    });
  } catch (error) {
    logger.error('Error updating exam:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update exam',
      error: error.message,
    });
  }
};

/**
 * Archive exam (soft delete - set isActive to false)
 * DELETE /coordinator/exam-catalog/:id
 */
export const archiveExam = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const exam = await ExamCatalog.findOne({ _id: id, tenantId });

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Exam not found',
      });
    }

    exam.isActive = false;
    await exam.save();

    logger.info(`Exam archived: ${exam.examName} (${exam._id})`);

    return res.status(200).json({
      status: 'success',
      message: 'Exam archived successfully',
      data: exam,
    });
  } catch (error) {
    logger.error('Error archiving exam:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to archive exam',
      error: error.message,
    });
  }
};

/**
 * Restore archived exam
 * PATCH /coordinator/exam-catalog/:id/restore
 */
export const restoreExam = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const exam = await ExamCatalog.findOne({ _id: id, tenantId });

    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Exam not found',
      });
    }

    exam.isActive = true;
    await exam.save();

    logger.info(`Exam restored: ${exam.examName} (${exam._id})`);

    return res.status(200).json({
      status: 'success',
      message: 'Exam restored successfully',
      data: exam,
    });
  } catch (error) {
    logger.error('Error restoring exam:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to restore exam',
      error: error.message,
    });
  }
};
