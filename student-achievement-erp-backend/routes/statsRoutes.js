import express from 'express';
import { authMiddleware, authorizeRole } from '../middlewares/authMiddleware.js';
import { User } from '../models/User.js';
import { Achievement } from '../models/Achievement.js';

const router = express.Router();

// GET student counts - ✅ ADDED SUB-COORDINATOR
router.get('/students', authMiddleware, authorizeRole('coordinator', 'sub-coordinator'), async (req, res) => {
  try {
    const total = await User.countDocuments({
      tenantId: req.user.tenantId,
      role: 'student',
    });

    const active = await User.countDocuments({
      tenantId: req.user.tenantId,
      role: 'student',
      isActive: true,
    });

    const pendingCount = await Achievement.countDocuments({
      tenantId: req.user.tenantId,
      status: 'Pending',
    });

    res.json({ 
      status: 'success', 
      data: { 
        total, 
        active, 
        inactive: total - active,
        pendingCount
      } 
    });
  } catch (err) {
    console.error('Get student stats error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET top achievers - ✅ ADDED SUB-COORDINATOR
router.get('/top-achievers', authMiddleware, authorizeRole('coordinator', 'sub-coordinator'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topAchievers = await User.find({
      tenantId: req.user.tenantId,
      role: 'student',
    })
      .sort({ 'profileStats.profileScore': -1 })
      .limit(limit)
      .select('name rollNumber email profileStats');

    res.json({ status: 'success', data: topAchievers });
  } catch (err) {
    console.error('Get top achievers error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET student stats (for student role only)
router.get('/student-stats', authMiddleware, authorizeRole('student'), async (req, res) => {
  try {
    const student = await User.findById(req.user.userId);
    
    if (!student) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    const achievements = await Achievement.find({ studentId: req.user.userId });

    const byStatus = {
      Pending: achievements.filter(a => a.status === 'Pending').length,
      Verified: achievements.filter(a => a.status === 'Verified').length,
      Rejected: achievements.filter(a => a.status === 'Rejected').length,
    };

    const byCategory = achievements.reduce((acc, achievement) => {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      status: 'success',
      data: {
        stats: {
          totalAchievements: student.profileStats?.totalAchievements || 0,
          profileScore: student.profileStats?.profileScore || 0,
          byStatus,
          byCategory,
        },
        recentAchievements: achievements.slice(0, 5),
      },
    });
  } catch (err) {
    console.error('Get student stats error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
