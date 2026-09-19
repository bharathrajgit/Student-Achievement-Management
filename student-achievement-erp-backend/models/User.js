// student-achievement-erp-backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'coordinator', 'sub-coordinator', 'student'],
      default: 'student',
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      default: 'MCA',
    },
    batch: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    // IMPORTANT: tenantId required only if NOT superadmin
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: function () {
        return this.role !== 'superadmin';
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    profileStats: {
      totalAchievements: { type: Number, default: 0 },
      profileScore: { type: Number, default: 0, min: 0, max: 100 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    // nothing to do
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create compound unique index: email + role + tenantId
// This allows same email for different roles in same/different tenants
userSchema.index({ email: 1, role: 1, tenantId: 1 }, { unique: true, sparse: true });

export const User = mongoose.model('User', userSchema);
