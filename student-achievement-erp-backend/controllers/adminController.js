import { User } from '../models/User.js';
import { Achievement } from '../models/Achievement.js';
import { logger } from '../utils/logger.js';

// Create Student (Coordinator only)
export const createStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, batch, section } = req.validatedBody;

    // Check if roll number already exists
    const existingRoll = await User.findOne({rollNumber});
    if (existingRoll) {
      return res.status(409).json({
        status: 'error',
        message: 'Roll number already exists',
      });
    }

    // Create student
    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      rollNumber,
      batch,
      section,
      isActive: true,
    });

    logger.info(`Student created: ${email}`);

    res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: { user: student.toJSON() },
    });
  } catch (error) {
    logger.error('Create student error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create student',
      details: error.message,
    });
  }
};

// Verify Achievement
export const verifyAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { status } = req.validatedBody;

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be Verified or Rejected',
      });
    }

    // Find and update achievement
    const achievement = await Achievement.findOne({
      _id: achievementId,
    });

    if (!achievement) {
      return res.status(404).json({
        status: 'error',
        message: 'Achievement not found',
      });
    }

    achievement.status = status;
    achievement.verifiedBy = req.user.userId;
    achievement.verificationDate = new Date();

    await achievement.save();

    // Update student's profile score if verified
    if (status === 'Verified') {
      const points = achievement.pointsAwarded || 10;
      await User.findByIdAndUpdate(achievement.studentId, {
        $inc: {
          'profileStats.totalAchievements': 1,
          'profileStats.profileScore': points,
        },
      });
    }

    logger.info(`Achievement ${status}: ${achievementId}`);

    res.status(200).json({
      status: 'success',
      message: `Achievement ${status}`,
      data: { achievement },
    });
  } catch (error) {
    logger.error('Verify achievement error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify achievement',
      details: error.message,
    });
  }
};

// Get Student Folder (Aggregation Pipeline)
export const getStudentFolder = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify student exists and belongs to tenant
    const student = await User.findOne({
      _id: studentId,
      role: 'student',
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    // Aggregation pipeline to group achievements by semester
    const folderData = await Achievement.aggregate([
      {
        $match: {
          studentId: student._id,
        },
      },
      {
        $group: {
          _id: '$semester',
          achievements: {
            $push: {
              _id: '$_id',
              title: '$title',
              description: '$description',
              category: '$category',
              status: '$status',
              pointsAwarded: '$pointsAwarded',
              proofLinks: '$proofLinks',
              createdAt: '$createdAt',
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format response
    const folder = {};
    folderData.forEach((sem) => {
      folder[`Semester ${sem._id}`] = sem.achievements;
    });

    res.status(200).json({
      status: 'success',
      message: 'Student folder retrieved',
      data: {
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
        },
        folder,
      },
    });
  } catch (error) {
    logger.error('Get student folder error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get student folder',
      details: error.message,
    });
  }
};

export const getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const student = await User.findOne({
      _id: id,
      tenantId,
      role: 'student',
    }).select('name email rollNumber batch section profileStats');

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    // ✅ ADD proof and proofLinks to select
    const achievements = await Achievement.find({
      studentId: id,
      tenantId,
    })
      .select('title description category semester status proof proofLinks createdAt')
      .sort({ createdAt: -1 });

    const stats = {
      total: achievements.length,
      verified: achievements.filter((a) => a.status === 'Verified').length,
      pending: achievements.filter((a) => a.status === 'Pending').length,
      rejected: achievements.filter((a) => a.status === 'Rejected').length,
    };

    res.status(200).json({
      status: 'success',
      data: {
        student,
        achievements,
        stats,
      },
    });
  } catch (error) {
    console.error('Get student detail error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get student detail',
    });
  }
};

