import { User } from '../models/User.js';
import { Achievement } from '../models/Achievement.js';
import { logger } from '../utils/logger.js';

// Upload Achievement
export const uploadAchievement = async (req, res) => {
  try {
    const { title, description, category, proofLinks, semester } = req.validatedBody;
    const tenantId = req.tenantId;
    const studentId = req.user.userId;

    // Validate student exists
    const student = await User.findOne({
      _id: studentId,
      tenantId,
      role: 'student',
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    // Create achievement
    const achievement = await Achievement.create({
      title,
      description,
      category,
      proofLinks: proofLinks || [],
      semester,
      tenantId,
      studentId,
      status: 'Pending',
    });

    logger.info(`Achievement uploaded: ${title} by ${student.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Achievement uploaded successfully',
      data: { achievement },
    });
  } catch (error) {
    logger.error('Upload achievement error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload achievement',
      details: error.message,
    });
  }
};

// Get My Stats
export const getMyStats = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const studentId = req.user.userId;

    const student = await User.findOne({
      _id: studentId,
      tenantId,
      role: 'student',
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    const achievementStats = await Achievement.aggregate([
      {
        $match: {
          studentId: student._id,
          tenantId,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      totalAchievements: student.profileStats.totalAchievements,
      profileScore: student.profileStats.profileScore,
      byStatus: {},
    };

    achievementStats.forEach((stat) => {
      stats.byStatus[stat._id] = stat.count;
    });

    res.status(200).json({
      status: 'success',
      message: 'Stats retrieved',
      data: {
        student: {
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
        },
        stats,
      },
    });
  } catch (error) {
    logger.error('Get my stats error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get stats',
      details: error.message,
    });
  }
};

// Get My Achievements
// Get My Achievements
export const getMyAchievements = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const studentId = req.user.userId;
    const { status } = req.query;

    const query = { studentId, tenantId };
    if (status) {
      query.status = status;
    }

    const achievements = await Achievement.find(query)
      .select(
        'title description category semester status date proof proofLinks createdAt'
      ) // ✅ include proof + proofLinks
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Achievements retrieved',
      data: achievements,          // ✅ return array directly
    });
  } catch (error) {
    logger.error('Get achievements error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get achievements',
      details: error.message,
    });
  }
};

