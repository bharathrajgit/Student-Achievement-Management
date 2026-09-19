// routes/adminRoutes.js
import express from 'express';
import { authMiddleware, authorizeRole } from '../middlewares/authMiddleware.js';
import { User } from '../models/User.js';
import { Achievement } from '../models/Achievement.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

// ✅ IMPORT BIODATA CONTROLLER
import { 
  getStudentBiodata, 
  updateStudentBiodata,
  getStudentDetail 
} from '../controllers/adminBiodataController.js';

const router = express.Router();

// ============ STUDENTS ROUTES ============

// Get all students for this tenant
router.get(
  '/students',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const students = await User.find({
        tenantId: req.user.tenantId,
        role: 'student',
      })
        .select('-password')
        .sort({ createdAt: -1 });

      res.json({ status: 'success', data: students });
    } catch (err) {
      console.error('Get students error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

// ✅ NEW: Get single student with biodata and achievements
router.get(
  '/students/:studentId',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  getStudentDetail
);

// ✅ NEW: Get student biodata by ID
router.get(
  '/students/:studentId/biodata',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  getStudentBiodata
);

// ✅ NEW: Update student biodata
router.put(
  '/students/:studentId/biodata',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  updateStudentBiodata
);

// Create a student
router.post(
  '/students',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const { name, email, password, rollNumber, batch, section } = req.body;

      if (!name || !email || !password || !rollNumber || !batch || !section) {
        return res
          .status(400)
          .json({ status: 'error', message: 'All fields are required' });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Email already exists' });
      }

      const student = new User({
        name,
        email,
        password,
        role: 'student',
        rollNumber,
        batch,
        section,
        tenantId: req.user.tenantId,
        department: 'MCA',
        isActive: true,
        isVerified: true,
        profileStats: {
          totalAchievements: 0,
          profileScore: 0,
        },
      });

      await student.save();

      res.json({
        status: 'success',
        message: 'Student created successfully',
        data: {
          _id: student._id,
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
          batch: student.batch,
          section: student.section,
        },
      });
    } catch (err) {
      console.error('Create student error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

// Delete student and their achievements
router.delete(
  '/students/:id',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const student = await User.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId,
        role: 'student',
      });

      if (!student) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Student not found' });
      }

      await Achievement.deleteMany({ studentId: req.params.id });
      await User.findByIdAndDelete(req.params.id);

      res.json({ status: 'success', message: 'Student deleted successfully' });
    } catch (err) {
      console.error('Delete student error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

// ============ ACHIEVEMENTS ROUTES ============

router.get(
  '/achievements',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = { tenantId: req.user.tenantId };

      if (status && ['Pending', 'Verified', 'Rejected'].includes(status)) {
        filter.status = status;
      }

      const achievements = await Achievement.find(filter)
        .populate('studentId', 'name email rollNumber batch section')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 });

      res.json({ status: 'success', data: achievements });
    } catch (err) {
      console.error('Get achievements error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/achievements/pending',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const achievements = await Achievement.find({
        tenantId: req.user.tenantId,
        status: 'Pending',
      })
        .populate('studentId', 'name email rollNumber batch section')
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: achievements,
        count: achievements.length,
      });
    } catch (err) {
      console.error('Get pending achievements error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/achievements/:id',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const achievement = await Achievement.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId,
      })
        .populate('studentId', 'name email rollNumber batch section')
        .populate('verifiedBy', 'name email');

      if (!achievement) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Achievement not found' });
      }

      res.json({ status: 'success', data: achievement });
    } catch (err) {
      console.error('Get achievement error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

// Update achievement status
router.patch(
  '/achievements/:id',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const { status, remarks } = req.body;

      // Validate status
      if (!['Verified', 'Rejected'].includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status. Must be Verified or Rejected',
        });
      }

      // Find achievement
      const achievement = await Achievement.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId,
      });

      if (!achievement) {
        return res.status(404).json({
          status: 'error',
          message: 'Achievement not found',
        });
      }

      const oldStatus = achievement.status;

      // Update achievement
      achievement.status = status;
      achievement.remarks = remarks || '';
      achievement.verifiedBy = req.user.userId;
      achievement.verifiedAt = new Date();

      // Award points if verified
      if (status === 'Verified' && !achievement.pointsAwarded) {
        achievement.pointsAwarded = 10;
      }

      await achievement.save();

      // ✅ UPDATE STUDENT PROFILE SCORE (if newly verified)
      if (status === 'Verified' && oldStatus !== 'Verified') {
        const student = await User.findById(achievement.studentId);
        if (student) {
          student.profileStats.totalAchievements =
            (student.profileStats.totalAchievements || 0) + 1;
          student.profileStats.profileScore = Math.min(
            100,
            (student.profileStats.profileScore || 0) +
              (achievement.pointsAwarded || 10)
          );
          await student.save();
          console.log('✅ Updated student profile:', student.email);
        }
      }

      logger.info(`Achievement ${status}: ${achievement._id}`);

      // Fetch updated achievement with populated fields
      const updatedAchievement = await Achievement.findById(achievement._id)
        .populate('studentId', 'name email rollNumber')
        .populate('verifiedBy', 'name email');

      res.status(200).json({
        status: 'success',
        message: `Achievement ${status.toLowerCase()} successfully`,
        data: updatedAchievement,
      });
    } catch (error) {
      console.error('❌ Error updating achievement:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update achievement',
        details: error.message,
      });
    }
  }
);

// Delete achievement
router.delete(
  '/achievements/:id',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const achievement = await Achievement.findOne({
        _id: req.params.id,
        tenantId: req.user.tenantId,
      });

      if (!achievement) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Achievement not found' });
      }

      await Achievement.findByIdAndDelete(req.params.id);

      res.json({
        status: 'success',
        message: 'Achievement deleted successfully',
      });
    } catch (err) {
      console.error('Delete achievement error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

// PATCH /api/admin/achievements/:id/reject
router.patch(
  '/achievements/:id/reject',
  authMiddleware,
  authorizeRole(['coordinator', 'sub-coordinator']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const achievement = await Achievement.findById(id);
      if (!achievement) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Achievement not found' });
      }

      achievement.status = 'Rejected';
      achievement.feedback = reason;
      achievement.verificationDate = new Date();

      await achievement.save();

      return res.json({
        status: 'success',
        message: 'Achievement rejected successfully',
        data: achievement,
      });
    } catch (err) {
      console.error('Reject achievement error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

// ============ NOTIFICATIONS ROUTES ============

router.get(
  '/notifications/count',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const pendingCount = await Achievement.countDocuments({
        tenantId: req.user.tenantId,
        status: 'Pending',
        $or: [{ isRead: false }, { isRead: { $exists: false } }],
      });

      res.json({
        status: 'success',
        data: {
          pendingAchievements: pendingCount,
          total: pendingCount,
        },
      });
    } catch (err) {
      console.error('Get notification count error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/notifications',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const pendingAchievements = await Achievement.find({
        tenantId: req.user.tenantId,
        status: 'Pending',
        $or: [{ isRead: false }, { isRead: { $exists: false } }],
      })
        .populate('studentId', 'name email rollNumber')
        .select('title category createdAt studentId')
        .sort({ createdAt: -1 })
        .limit(10);

      const notifications = pendingAchievements.map(achievement => ({
        id: achievement._id,
        type: 'achievement',
        title: 'New Achievement Pending',
        message: `${achievement.studentId?.name} submitted "${achievement.title}"`,
        time: achievement.createdAt,
        link: '/coordinator/achievements',
      }));

      res.json({ status: 'success', data: notifications });
    } catch (err) {
      console.error('Get notifications error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/notifications/mark-read',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const { notificationIds } = req.body;

      if (notificationIds && notificationIds.length > 0) {
        await Achievement.updateMany(
          { _id: { $in: notificationIds }, tenantId: req.user.tenantId },
          { isRead: true }
        );
      } else {
        await Achievement.updateMany(
          {
            tenantId: req.user.tenantId,
            status: 'Pending',
            isRead: false,
          },
          { isRead: true }
        );
      }

      res.json({ status: 'success', message: 'Notifications marked as read' });
    } catch (err) {
      console.error('Mark notifications read error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

// ============ STATS ROUTES ============

router.get(
  '/stats/students',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
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
          pendingCount,
        },
      });
    } catch (err) {
      console.error('Get student stats error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/stats/top-achievers',
  authMiddleware,
  authorizeRole('coordinator', 'sub-coordinator'),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const topAchievers = await User.find({
        tenantId: req.user.tenantId,
        role: 'student',
      })
        .select('name email rollNumber profileStats')
        .sort({ 'profileStats.profileScore': -1 })
        .limit(limit);

      res.json({ status: 'success', data: topAchievers });
    } catch (err) {
      console.error('Get top achievers error:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.delete(
  '/student/achievements/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const studentId = req.user.userId;
      const tenantId = req.user.tenantId;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid achievement ID format',
        });
      }

      const achievement = await Achievement.findOne({
        _id: id,
        studentId: studentId,
        tenantId: tenantId,
      });

      if (!achievement) {
        return res.status(404).json({
          status: 'error',
          message: 'Achievement not found or you do not have permission to delete it',
        });
      }

      if (achievement.status === 'Verified') {
        return res.status(403).json({
          status: 'error',
          message: 'Cannot delete verified achievements. Contact administrator.',
        });
      }

      if (achievement.status === 'Verified' && achievement.pointsAwarded > 0) {
        const student = await User.findById(studentId);
        if (student) {
          student.profileStats.totalAchievements = Math.max(
            0,
            student.profileStats.totalAchievements - 1
          );
          student.profileStats.profileScore = Math.max(
            0,
            student.profileStats.profileScore - achievement.pointsAwarded
          );
          await student.save();
        }
      }

      await Achievement.findByIdAndDelete(id);

      logger.info(`✅ Achievement deleted: ${id} by student ${studentId}`);

      res.status(200).json({
        status: 'success',
        message: 'Achievement deleted successfully',
        data: {
          deletedId: id,
        },
      });
    } catch (err) {
      console.error('❌ Delete achievement error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete achievement',
        details: err.message,
      });
    }
  }
);

export default router;
