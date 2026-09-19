import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware, authorizeRole } from '../middlewares/authMiddleware.js';
import { User } from '../models/User.js';
import { Achievement } from '../models/Achievement.js';

const router = express.Router();

// Helper: 7 days ago
const sevenDaysAgo = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// ================= PROFILE / DASHBOARD =================

router.get(
  '/profile',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const student = await User.findById(req.user.userId).select('-password');

      if (!student) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Student not found' });
      }

      const achievements = await Achievement.find({
        studentId: req.user.userId,
        tenantId: req.user.tenantId,
      }).sort({ createdAt: -1 });

      return res.json({
        status: 'success',
        data: {
          student,
          achievements,
          stats: student.profileStats,
        },
      });
    } catch (err) {
      console.error('Get profile error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

// ================= ACHIEVEMENTS =================

// Create achievement (Pending)
router.post(
  '/achievements',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const { title, description, category, semester, date, proof } = req.body;

      if (!title || !description || !category || !semester || !date) {
        return res.status(400).json({
          status: 'error',
          message:
            'All fields are required: title, description, category, semester, and date',
        });
      }

      const achievement = await Achievement.create({
        studentId: req.user.userId,
        tenantId: req.user.tenantId,
        title,
        description,
        category,
        semester,
        date,
        proof,
        status: 'Pending',
        isRead: false,
      });

      return res.json({
        status: 'success',
        message: 'Achievement submitted successfully',
        data: achievement,
      });
    } catch (err) {
      console.error('Create achievement error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

// Get all achievements of current student
router.get(
  '/achievements',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const achievements = await Achievement.find({
        studentId: req.user.userId,
        tenantId: req.user.tenantId,
      }).sort({ createdAt: -1 });

      return res.json({ status: 'success', data: achievements });
    } catch (err) {
      console.error('Get achievements error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

// Update achievement (only Pending, only own)
router.patch(
  '/achievements/:id',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, category, semester, date, proof } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid achievement ID format',
        });
      }

      const achievement = await Achievement.findOneAndUpdate(
        {
          _id: id,
          studentId: req.user.userId,
          tenantId: req.user.tenantId,
          status: 'Pending',
        },
        {
          title,
          description,
          category,
          semester,
          date,
          proof,
        },
        { new: true }
      );

      if (!achievement) {
        return res.status(404).json({
          status: 'error',
          message: 'Achievement not found or cannot be edited',
        });
      }

      return res.json({
        status: 'success',
        message: 'Achievement updated successfully',
        data: achievement,
      });
    } catch (err) {
      console.error('Update achievement error:', err);
      return res.status(500).json({
        status: 'error',
        message: err.message || 'Failed to update achievement',
      });
    }
  }
);

// Delete achievement (only if Pending)
router.delete(
  '/achievements/:id',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid achievement ID format',
        });
      }

      const achievement = await Achievement.findOne({
        _id: id,
        studentId: req.user.userId,
        tenantId: req.user.tenantId,
        status: 'Pending',
      });

      if (!achievement) {
        return res.status(404).json({
          status: 'error',
          message: 'Achievement not found or cannot be deleted',
        });
      }

      await Achievement.findByIdAndDelete(id);

      return res.json({
        status: 'success',
        message: 'Achievement deleted successfully',
      });
    } catch (err) {
      console.error('Delete achievement error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

// ================= STUDENT STATS =================

router.get(
  '/stats',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const achievements = await Achievement.find({
        studentId: req.user.userId,
        tenantId: req.user.tenantId,
      });

      const verified = achievements.filter(a => a.status === 'Verified').length;
      const pending = achievements.filter(a => a.status === 'Pending').length;
      const rejected = achievements.filter(a => a.status === 'Rejected').length;

      return res.json({
        status: 'success',
        data: {
          verified,
          pending,
          rejected,
          total: achievements.length,
        },
      });
    } catch (err) {
      console.error('Get student stats error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

// ================= NOTIFICATIONS (using Achievement model) =================

// 1) Count notifications (Verified/Rejected within last 7 days)
router.get(
  '/notifications/count',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const baseFilter = {
        studentId: req.user.userId,
        tenantId: req.user.tenantId,
        status: { $in: ['Verified', 'Rejected'] },
        verificationDate: { $gte: sevenDaysAgo() },
      };

      // Count all unread (including those without isRead field)
      const unreadFilter = {
        $or: [{ isRead: false }, { isRead: { $exists: false } }],
      };

      const total = await Achievement.countDocuments({
        ...baseFilter,
        ...unreadFilter,
      });

      return res.json({
        status: 'success',
        data: {
          total,
        },
      });
    } catch (err) {
      console.error('Get notification count error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

// 2) List notifications in format expected by NotificationBell
router.get(
  '/notifications',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      // Fetch unread Verified/Rejected achievements from last 7 days
      const achievements = await Achievement.find({
        studentId: req.user.userId,
        tenantId: req.user.tenantId,
        status: { $in: ['Verified', 'Rejected'] },
        $or: [{ isRead: false }, { isRead: { $exists: false } }],
        verificationDate: { $gte: sevenDaysAgo() },
      })
        .select('title status pointsAwarded verificationDate')
        .sort({ verificationDate: -1 })
        .limit(20);

      // Map to NotificationBell format
      const notifications = achievements.map(a => ({
        id: a._id.toString(),
        type: a.status === 'Verified' ? 'achievement_approved' : 'achievement_rejected',
        title:
          a.status === 'Verified'
            ? 'Achievement Verified!'
            : 'Achievement Rejected',
        message: `Your achievement "${a.title}" has been ${a.status.toLowerCase()}`,
        points: a.status === 'Verified' ? a.pointsAwarded || 0 : null,
        time: a.verificationDate,
        link: '/student/achievements',
      }));

      return res.json({ status: 'success', data: notifications });
    } catch (err) {
      console.error('Get notifications error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

// 3) Mark notifications as read (by ids or all)
router.post(
  '/notifications/mark-read',
  authMiddleware,
  authorizeRole('student'),
  async (req, res) => {
    try {
      const { notificationIds } = req.body;

      const baseFilter = {
        studentId: req.user.userId,
        tenantId: req.user.tenantId,
        status: { $in: ['Verified', 'Rejected'] },
      };

      let filter = { ...baseFilter };

      // If specific notification IDs provided, mark only those
      if (Array.isArray(notificationIds) && notificationIds.length > 0) {
        const validIds = notificationIds
          .filter(id => mongoose.Types.ObjectId.isValid(id))
          .map(id => new mongoose.Types.ObjectId(id));

        if (validIds.length > 0) {
          filter._id = { $in: validIds };
        }
      } else {
        // Otherwise mark all unread as read
        filter.isRead = false;
      }

      await Achievement.updateMany(filter, { isRead: true });

      return res.json({
        status: 'success',
        message: 'Notifications marked as read',
      });
    } catch (err) {
      console.error('Mark notifications read error:', err);
      return res
        .status(500)
        .json({ status: 'error', message: err.message });
    }
  }
);

export default router;