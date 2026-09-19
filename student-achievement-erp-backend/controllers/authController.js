import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';


export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }
    // Pass PLAIN password - User model will hash it
    const user = await User.create({
      name,
      email,
      password,  // Plain text - pre('save') hook hashes it
      role: 'superadmin',
      isActive: true,
      isVerified: true,
    });
    res.json({
      status: 'success',
      message: 'Superadmin registered',
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    console.error('Register superadmin error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const registerCoordinator = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }
    // Pass PLAIN password - User model will hash it
    const user = await User.create({
      name,
      email,
      password,  // Plain text
      role: 'coordinator',
      tenantId,
      department: 'MCA',
      isActive: true,
      isVerified: true,
    });
    res.json({
      status: 'success',
      message: 'Coordinator registered',
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    console.error('Register coordinator error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, batch, section, tenantId } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }
    // Pass PLAIN password - User model will hash it
    const user = await User.create({
      name,
      email,
      password,  // Plain text
      role: 'student',
      rollNumber,
      batch,
      section,
      tenantId,
      department: 'MCA',
      isActive: true,
      isVerified: false,
    });
    res.json({
      status: 'success',
      message: 'Student registered',
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    console.error('Register student error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt');
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({
          status: 'error',
          message: 'Email and password required',
        });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res
        .status(401)
        .json({ status: 'error', message: 'Invalid email or password' });
    }

    console.log('✅ User found:', user.email, 'userId:', user._id);

    const isMatch = await user.comparePassword(password);
    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ status: 'error', message: 'Account is inactive' });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(), // Convert ObjectId to string explicitly
        role: user.role,
        tenantId: user.tenantId,
        email: user.email,
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.REFRESH_TOKEN_SECRET || 'default-refresh',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', user.email);

    res.json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('❌ LOGIN ERROR:', err);
    res.status(500).json({ status: 'error', message: 'Login failed' });
  }
};


export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ status: 'error', message: 'Refresh token required' });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'default-refresh');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
    }
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role, tenantId: user.tenantId, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    res.json({ status: 'success', data: { accessToken: newAccessToken } });
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' });
  }
};
