import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Academic', 'Sports', 'Cultural', 'Technical', 'Social Service', 'Other'],
    },
    semester: {
      type: String,
      required: true,
      enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
    },
    date: {
      type: Date,
      required: true,
    },
    proof: {
      type: String, // ✅ Keep this (Drive link)
    },
    proofLinks: {
      type: [String], // ✅ ADD THIS for multiple links
      default: [],
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: Date,
    feedback: String,
    remarks: String,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
achievementSchema.index({ tenantId: 1, status: 1 });
achievementSchema.index({ studentId: 1, status: 1 });

export const Achievement = mongoose.model('Achievement', achievementSchema);
