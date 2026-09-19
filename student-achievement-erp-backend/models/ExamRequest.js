// models/ExamRequest.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const examRequestSchema = new Schema(
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

    // Requested exam details
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      required: true,
      // ✅ REMOVED ENUM - Allow any platform now
    },
    category: {
      type: String,
      // ✅ REMOVED ENUM - Allow any category now
      default: 'Certification',
    },
    officialLink: {
      type: String,
      trim: true,
    },
    justification: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    examDate: {
      type: Date,
      required: true,
    },
    examRegisterLastDate: {
      type: Date,
      required: true,
    },
    examEnterOption: {
      type: String,
      required: true,
      enum: ['Online', 'Offline', 'Both'],
    },
    examLink: {
      type: String,
      trim: true,
    },

    // Request status
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },

    // Review details (filled by coordinator)
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedByName: {
      type: String,
      trim: true,
    },
    reviewedByRole: {
      type: String,
      enum: ['coordinator', 'sub-coordinator', 'superadmin'],
    },
    reviewedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },

    // If approved, link to created exam
    createdExamId: {
      type: Schema.Types.ObjectId,
      ref: 'ExamCatalog',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
examRequestSchema.index({ tenantId: 1, status: 1 });
examRequestSchema.index({ tenantId: 1, studentId: 1 });
examRequestSchema.index({ createdAt: -1 });

export const ExamRequest = mongoose.model('ExamRequest', examRequestSchema);
