import { Notification } from '../models/Notification.js';
import { ExamRegistration } from '../models/ExamRegistration.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/coordinator/nptel/notifications
 * Get coordinator's notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { unreadOnly = false } = req.query;

    const query = { recipientId: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        totalCount: notifications.length,
      },
    });
  } catch (error) {
    logger.error('Get notifications error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
      details: error.message,
    });
  }
};

/**
 * PUT /api/coordinator/nptel/notifications/:notificationId/read
 * Mark notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: notification,
    });
  } catch (error) {
    logger.error('Mark notification error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notification',
      details: error.message,
    });
  }
};

/**
 * GET /api/coordinator/nptel/approval-queue
 * Get pending approvals (approval queue)
 */
export const getApprovalQueue = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const pendingApprovals = await ExamRegistration.find({
      tenantId,
      status: 'Registered', // Not yet verified/marked complete
      marksObtained: null, // No marks submitted yet
    })
      .populate('studentId', 'name email rollNumber')
      .populate('examId', 'examName platform')
      .sort({ registrationDate: 1 })
      .limit(100);

    // Calculate SLA metrics (days pending)
    const queue = pendingApprovals.map(reg => {
      const regDate = new Date(reg.registrationDate);
      const now = new Date();
      const diffTime = now.getTime() - regDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        _id: reg._id,
        studentName: reg.studentName,
        studentId: reg.studentId._id,
        email: reg.studentId.email,
        rollNumber: reg.rollNumber,
        examName: reg.examName,
        platform: reg.platform,
        registrationDate: reg.registrationDate,
        daysPending: diffDays,
        status: 'Pending Marks',
        slaStatus: diffDays > 30 ? '⚠️ Overdue' : '✓ On Track',
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalPending: queue.length,
        overdueCount: queue.filter(q => q.slaStatus === '⚠️ Overdue').length,
        queue,
      },
    });
  } catch (error) {
    logger.error('Approval queue error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch approval queue',
      details: error.message,
    });
  }
};

/**
 * Internal: Create notification for coordinator
 */
export const createNotification = async ({
  tenantId,
  recipientId,
  recipientEmail,
  type,
  title,
  message,
  relatedData = {},
}) => {
  try {
    const notification = await Notification.create({
      tenantId,
      recipientId,
      recipientEmail,
      type,
      title,
      message,
      relatedData,
    });

    logger.info(`Notification created for ${recipientEmail}: ${type}`);
    return notification;
  } catch (error) {
    logger.error('Create notification error:', error.message);
  }
};

/**
 * Notify student on enrollment approval
 */
export const notifyEnrollmentApproved = async (registrationId, coordinatorName) => {
  try {
    const registration = await ExamRegistration.findById(registrationId)
      .populate('studentId', 'email name');

    if (!registration) return;

    const notification = await Notification.create({
      tenantId: registration.tenantId,
      recipientId: registration.studentId._id,
      recipientEmail: registration.studentId.email,
      type: 'enrollment_approved',
      title: 'Enrollment Approved ✓',
      message: `Your enrollment for "${registration.examName}" has been approved by ${coordinatorName}. You can now proceed with the exam.`,
      relatedData: {
        examName: registration.examName,
        studentName: registration.studentId.name,
        registrationId,
      },
    });

    logger.info(`Enrollment approval notification sent to ${registration.studentId.email}`);
  } catch (error) {
    logger.error('Enrollment approval notification error:', error.message);
  }
};

/**
 * Notify student on result publication
 */
export const notifyResultPublished = async (registrationId) => {
  try {
    const registration = await ExamRegistration.findById(registrationId)
      .populate('studentId', 'email name');

    if (!registration) return;

    const resultMessage = registration.status === 'Passed'
      ? `Congratulations! You passed "${registration.examName}" with ${registration.marksObtained}/${registration.totalMarks} marks.`
      : `You did not pass "${registration.examName}". You scored ${registration.marksObtained}/${registration.totalMarks} marks.`;

    const notification = await Notification.create({
      tenantId: registration.tenantId,
      recipientId: registration.studentId._id,
      recipientEmail: registration.studentId.email,
      type: 'result_published',
      title: `Result: ${registration.status} ` + (registration.status === 'Passed' ? '🏆' : '📋'),
      message: resultMessage,
      relatedData: {
        examName: registration.examName,
        studentName: registration.studentId.name,
        marks: registration.marksObtained,
        status: registration.status,
        registrationId,
      },
    });

    logger.info(`Result notification sent to ${registration.studentId.email}`);
  } catch (error) {
    logger.error('Result notification error:', error.message);
  }
};

/**
 * Notify coordinators of pending approvals
 */
export const notifyPendingApprovals = async (tenantId) => {
  try {
    const pending = await ExamRegistration.find({
      tenantId,
      status: 'Registered',
      marksObtained: null,
    });

    if (pending.length === 0) return;

    // Get coordinators
    const coordinators = await User.find({
      tenantId,
      role: { $in: ['coordinator', 'sub-coordinator'] },
    });

    for (const coordinator of coordinators) {
      await Notification.create({
        tenantId,
        recipientId: coordinator._id,
        recipientEmail: coordinator.email,
        type: 'pending_approval',
        title: `${pending.length} Pending Approvals`,
        message: `You have ${pending.length} exam registrations pending marks entry. Please review and update them.`,
        relatedData: {
          pendingCount: pending.length,
        },
      });
    }

    logger.info(`Pending approval notifications sent to ${coordinators.length} coordinators`);
  } catch (error) {
    logger.error('Pending approval notification error:', error.message);
  }
};
