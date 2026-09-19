// models/ExamRegistration.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const previousAttemptSchema = new Schema(
  {
    attemptNumber: {
      type: Number,
      required: true,
    },
    certificateLink: {
      type: String,
      trim: true,
    },
    marksObtained: {
      type: Number,
    },
    submittedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    rejectedDate: {
      type: Date,
    },
  },
  {
    _id: false,
  }
);

const examRegistrationSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Denormalized student info for fast reporting
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Link to catalog
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'ExamCatalog',
      required: true,
      index: true,
    },

    // Denormalized exam info (for grouping & reporting)
    examName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    platform: {
      type: String,
      required: true,
      // ✅ REMOVED ENUM - Allow any platform
    },

    registrationDate: {
      type: Date,
      default: Date.now,
    },
    expectedCompletionDate: {
      type: Date,
    },

    status: {
      type: String,
      required: true,
      enum: ['Registered', 'Submitted', 'Passed', 'Failed'],
      default: 'Registered',
      index: true,
    },

    // Certificate details (student fills after completion)
    certificateLink: {
      type: String,
      trim: true,
    },
    marksObtained: {
      type: Number,
      min: 0,
    },
    totalMarks: {
      type: Number,
      min: 0,
    },
    examCompletionDate: {
      type: Date,
    },
    submittedDate: {
      type: Date,
    },

    // Verification details (coordinator/sub-coordinator)
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedByName: {
      type: String,
      trim: true,
    },
    verifiedByRole: {
      type: String,
      enum: ['coordinator', 'sub-coordinator', 'superadmin'],
    },
    verificationDate: {
      type: Date,
    },
    feedback: {
      type: String,
      trim: true,
    },

    // Resubmission tracking
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    previousAttempts: {
      type: [previousAttemptSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Core indexes
examRegistrationSchema.index({ tenantId: 1, studentId: 1 });
examRegistrationSchema.index({ tenantId: 1, examName: 1 });
examRegistrationSchema.index({ tenantId: 1, status: 1 });
examRegistrationSchema.index({ tenantId: 1, examId: 1 });
examRegistrationSchema.index({ tenantId: 1, platform: 1, status: 1 });

export const ExamRegistration = mongoose.model(
  'ExamRegistration',
  examRegistrationSchema
);
