import { User } from '../models/User.js';
import { Achievement } from '../models/Achievement.js';
import { logger } from '../utils/logger.js';

// Total Students (Per Tenant)
export const totalStudents = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const totalCount = await User.countDocuments({
      tenantId,
      role: 'student',
    });

    const activeCount = await User.countDocuments({
      tenantId,
      role: 'student',
      isActive: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Student count retrieved',
      data: {
        total: totalCount,
        active: activeCount,
        inactive: totalCount - activeCount,
      },
    });
  } catch (error) {
    logger.error('Total students error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get student count',
      details: error.message,
    });
  }
};

// Pending Achievements
export const pendingAchievements = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const pending = await Achievement.aggregate([
      {
        $match: {
          tenantId,
          status: 'Pending',
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    const count = pending.length > 0 ? pending[0].count : 0;

    res.status(200).json({
      status: 'success',
      message: 'Pending achievements count',
      data: { pendingCount: count },
    });
  } catch (error) {
    logger.error('Pending achievements error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get pending count',
      details: error.message,
    });
  }
};

// Top Achievers (Leaderboard)
export const topAchievers = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const limit = req.query.limit || 10;

    const topStudents = await User.find({
      tenantId,
      role: 'student',
    })
      .select('name email rollNumber profileStats -_id')
      .sort({ 'profileStats.profileScore': -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      message: 'Top achievers retrieved',
      data: { topAchievers: topStudents },
    });
  } catch (error) {
    logger.error('Top achievers error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get top achievers',
      details: error.message,
    });
  }
};
