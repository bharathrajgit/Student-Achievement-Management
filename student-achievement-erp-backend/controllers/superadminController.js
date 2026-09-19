import mongoose from 'mongoose';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { Achievement } from '../models/Achievement.js';
import { logger } from '../utils/logger.js';

// ============ TENANT MANAGEMENT ============

export const createTenant = async (req, res) => {
  try {
    const { name, code, email, phone } = req.validatedBody;

    const existingTenant = await Tenant.findOne({ code: code.toUpperCase() });
    if (existingTenant) {
      return res.status(409).json({
        status: 'error',
        message: 'Tenant code already exists',
      });
    }

    const tenant = await Tenant.create({
      name,
      code: code.toUpperCase(),
      email,
      phone,
      createdBy: req.user.userId,
    });

    logger.info(`Tenant created: ${name} (${code})`);

    res.status(201).json({
      status: 'success',
      message: 'Tenant created successfully',
      data: { tenant },
    });
  } catch (error) {
    logger.error('Create tenant error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create tenant',
      details: error.message,
    });
  }
};

export const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find()
      .select('-createdBy')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Tenants retrieved',
      data: { tenants, total: tenants.length },
    });
  } catch (error) {
    logger.error('Get all tenants error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get tenants',
      details: error.message,
    });
  }
};

export const getTenantUsageReport = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found',
      });
    }

    const students = await User.countDocuments({
      tenantId,
      role: 'student',
      isActive: true,
    });

    const coordinators = await User.countDocuments({
      tenantId,
      role: { $in: ['coordinator', 'sub-coordinator'] },
      isActive: true,
    });

    const achievements = await Achievement.countDocuments({ tenantId });

    const verifiedAchievements = await Achievement.countDocuments({
      tenantId,
      status: 'Verified',
    });

    const report = {
      tenant: {
        name: tenant.name,
        code: tenant.code,
        plan: tenant.subscription.plan,
        status: tenant.subscription.status,
      },
      usage: {
        students,
        coordinators,
        totalAchievements: achievements,
        verifiedAchievements,
        pendingAchievements: achievements - verifiedAchievements,
        utilizationPercent: Math.round(
          (students / tenant.limits.maxStudents) * 100
        ),
      },
      limits: tenant.limits,
    };

    res.status(200).json({
      status: 'success',
      message: 'Usage report retrieved',
      data: report,
    });
  } catch (error) {
    logger.error('Get usage report error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get usage report',
      details: error.message,
    });
  }
};

// ============ COORDINATOR MANAGEMENT ============

export const createCoordinator = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.validatedBody || req.body;

    // Normalize email: lowercase and trim
    const normalizedEmail = email.toLowerCase().trim();

    console.log('📝 Creating coordinator:', { name, email: normalizedEmail, tenantId });

    if (!name || !email || !password || !tenantId) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required: name, email, password, tenantId',
      });
    }

    // Check for existing email with normalized search
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('⚠️ Email already exists:', normalizedEmail, 'User:', existingUser._id);
      return res.status(409).json({
        status: 'error',
        message: `Email "${normalizedEmail}" is already registered in the system`,
      });
    }

    let tenantObjectId;
    try {
      if (mongoose.Types.ObjectId.isValid(tenantId)) {
        tenantObjectId = typeof tenantId === 'string' 
          ? new mongoose.Types.ObjectId(tenantId)
          : tenantId;
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid tenant ID format',
        });
      }
    } catch (err) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid tenant ID',
      });
    }

    const tenant = await Tenant.findById(tenantObjectId);
    if (!tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found',
      });
    }

    const coordinator = new User({
      name,
      email: normalizedEmail,
      password,
      role: 'coordinator',
      tenantId: tenantObjectId,
      createdBy: req.user.userId,
      isActive: true,
      isVerified: true,
    });

    await coordinator.save();

    console.log('✅ Coordinator created:', coordinator.email);
    logger.info(`Coordinator created: ${name} for tenant ${tenant.name}`);

    res.status(201).json({
      status: 'success',
      message: 'Coordinator created successfully',
      data: {
        _id: coordinator._id,
        name: coordinator.name,
        email: coordinator.email,
        role: coordinator.role,
        tenantId: coordinator.tenantId,
        createdAt: coordinator.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Create coordinator error:', error);
    logger.error('Create coordinator error:', error.message);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : 'unknown';
      
      console.log(`⚠️ Duplicate key detected on field "${duplicateField}": ${duplicateValue}`);
      
      return res.status(409).json({
        status: 'error',
        message: `${duplicateField === 'email' ? 'Email' : duplicateField} "${duplicateValue}" is already in use`,
        field: duplicateField,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create coordinator',
      details: error.message,
    });
  }
};

export const getAllCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' })
      .populate('tenantId', 'name code email')
      .select('-password')
      .sort({ createdAt: -1 });

    logger.info(`Retrieved ${coordinators.length} coordinators`);

    res.status(200).json({
      status: 'success',
      message: 'Coordinators retrieved successfully',
      data: coordinators,
    });
  } catch (error) {
    logger.error('Get coordinators error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get coordinators',
      details: error.message,
    });
  }
};

export const deleteCoordinator = async (req, res) => {
  try {
    const coordinator = await User.findOne({
      _id: req.params.id,
      role: 'coordinator',
    });

    if (!coordinator) {
      return res.status(404).json({
        status: 'error',
        message: 'Coordinator not found',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    logger.info(`Coordinator deleted: ${coordinator.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Coordinator deleted successfully',
    });
  } catch (error) {
    logger.error('Delete coordinator error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete coordinator',
      details: error.message,
    });
  }
};
