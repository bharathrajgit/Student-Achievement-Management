import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'enrollment_approved',
        'enrollment_rejected',
        'exam_scheduled',
        'marks_submitted',
        'result_published',
        'pending_approval',
        'deadline_reminder',
        'certificate_ready',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedData: {
      examName: String,
      studentName: String,
      studentId: mongoose.Schema.Types.ObjectId,
      registrationId: mongoose.Schema.Types.ObjectId,
      marks: Number,
      status: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
    readAt: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.model('Notification', notificationSchema);
