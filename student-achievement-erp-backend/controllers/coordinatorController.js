import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

export const createSubCoordinator = async (req, res) => {
  try {
    const { name, email, password } = req.validatedBody || req.body;

    console.log('📝 Creating sub-coordinator:', { name, email });

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required: name, email, password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists',
      });
    }

    const subCoordinator = new User({
      name,
      email,
      password,
      role: 'sub-coordinator',
      tenantId: req.user.tenantId,
      createdBy: req.user.userId,
      isActive: true,
      isVerified: true,
    });

    await subCoordinator.save();

    console.log('✅ Sub-coordinator created:', subCoordinator.email);
    logger.info(`Sub-coordinator created: ${name} by ${req.user.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Sub-coordinator created successfully',
      data: {
        _id: subCoordinator._id,
        name: subCoordinator.name,
        email: subCoordinator.email,
        role: subCoordinator.role,
        tenantId: subCoordinator.tenantId,
        createdAt: subCoordinator.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Create sub-coordinator error:', error);
    logger.error('Create sub-coordinator error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already exists',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create sub-coordinator',
      details: error.message,
    });
  }
};

export const getSubCoordinators = async (req, res) => {
  try {
    const subCoordinators = await User.find({
      role: 'sub-coordinator',
      tenantId: req.user.tenantId,
    })
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Sub-coordinators retrieved successfully',
      data: subCoordinators,
    });
  } catch (error) {
    logger.error('Get sub-coordinators error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get sub-coordinators',
      details: error.message,
    });
  }
};

export const createCoordinator = async (req, res) => {
  try {
    console.log('========================================');
    console.log('🚀 CREATE COORDINATOR REQUEST RECEIVED');
    console.log('========================================');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.validatedBody:', JSON.stringify(req.validatedBody, null, 2));
    
    const { name, email, password, tenantId } = req.validatedBody || req.body;

    console.log('📝 Extracted Values:');
    console.log('  - name:', name);
    console.log('  - email:', email);
    console.log('  - password:', password ? '***' : 'MISSING');
    console.log('  - tenantId:', tenantId);
    console.log('  - tenantId type:', typeof tenantId);

    // Step 1: Validate required fields
    if (!name || !email || !password || !tenantId) {
      console.log('❌ VALIDATION FAILED: Missing fields');
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required',
        missing: { name: !name, email: !email, password: !password, tenantId: !tenantId }
      });
    }
    console.log('✅ All required fields present');

    // Step 2: Check if email exists
    console.log('🔍 Checking if email exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      console.log('   Existing user:', existingUser._id, existingUser.role);
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists',
      });
    }
    console.log('✅ Email is available');

    // Step 3: Convert tenantId to ObjectId
    console.log('🔄 Converting tenantId to ObjectId...');
    let tenantObjectId;
    
    try {
      if (mongoose.Types.ObjectId.isValid(tenantId)) {
        tenantObjectId = new mongoose.Types.ObjectId(tenantId);
        console.log('✅ TenantId converted:', tenantObjectId.toString());
      } else {
        console.log('❌ Invalid tenantId format:', tenantId);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid tenant ID format',
        });
      }
    } catch (err) {
      console.error('❌ TenantId conversion error:', err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid tenant ID',
      });
    }

    // Step 4: Verify tenant exists
    console.log('🔍 Searching for tenant in database...');
    const tenant = await Tenant.findById(tenantObjectId);
    if (!tenant) {
      console.log('❌ TENANT NOT FOUND');
      console.log('   Searched for ID:', tenantObjectId.toString());
      
      // Show all tenants for debugging
      const allTenants = await Tenant.find().select('_id name code');
      console.log('📋 Available tenants:', JSON.stringify(allTenants, null, 2));
      
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found',
      });
    }
    console.log('✅ Tenant found:', tenant.name, '(', tenant.code, ')');

    // Step 5: Create coordinator
    console.log('📦 Creating coordinator document...');
    const coordinatorData = {
      name,
      email,
      password,
      role: 'coordinator',
      tenantId: tenantObjectId,
      createdBy: req.user.userId,
      isActive: true,
      isVerified: true,
    };
    console.log('Coordinator data (without password):', { 
      ...coordinatorData, 
      password: '***',
      createdBy: req.user.userId 
    });

    const coordinator = new User(coordinatorData);

    console.log('💾 Saving coordinator to database...');
    await coordinator.save();

    console.log('========================================');
    console.log('✅ COORDINATOR CREATED SUCCESSFULLY');
    console.log('========================================');
    console.log('   ID:', coordinator._id.toString());
    console.log('   Name:', coordinator.name);
    console.log('   Email:', coordinator.email);
    console.log('   TenantId:', coordinator.tenantId.toString());
    console.log('========================================');

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
    console.log('========================================');
    console.error('❌❌❌ COORDINATOR CREATION FAILED ❌❌❌');
    console.log('========================================');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    if (error.code === 11000) {
      console.error('💥 DUPLICATE KEY ERROR');
      console.error('   Key pattern:', JSON.stringify(error.keyPattern));
      console.error('   Key value:', JSON.stringify(error.keyValue));
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        status: 'error',
        message: `Duplicate ${field}. This ${field} already exists.`,
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create coordinator',
      details: error.message,
    });
  }
};


export const deleteSubCoordinator = async (req, res) => {
  try {
    const subCoordinator = await User.findOne({
      _id: req.params.id,
      role: 'sub-coordinator',
      tenantId: req.user.tenantId,
    });

    if (!subCoordinator) {
      return res.status(404).json({
        status: 'error',
        message: 'Sub-coordinator not found',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    logger.info(`Sub-coordinator deleted: ${subCoordinator.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Sub-coordinator deleted successfully',
    });
  } catch (error) {
    logger.error('Delete sub-coordinator error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete sub-coordinator',
      details: error.message,
    });
  }
  
};
