// models/ExamCatalog.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const examCatalogSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
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
    category: {
      type: String,
      // ✅ REMOVED ENUM - Allow any category
      default: 'Certification',
    },
    description: {
      type: String,
      trim: true,
    },
    officialLink: {
      type: String,
      trim: true,
    },
    examDate: {
      type: Date,
    },
    examRegisterLastDate: {
      type: Date,
    },
    examEnterOption: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
    },
    examLink: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Track if created from student request
    createdFromRequest: {
      type: Schema.Types.ObjectId,
      ref: 'ExamRequest',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
examCatalogSchema.index({ tenantId: 1, isActive: 1 });
examCatalogSchema.index({ examName: 1, tenantId: 1 });

export const ExamCatalog = mongoose.model('ExamCatalog', examCatalogSchema);
