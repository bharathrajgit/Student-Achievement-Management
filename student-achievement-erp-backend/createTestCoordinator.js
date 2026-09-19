import { connectDB } from './config/database.js';
import { User } from './models/User.js';
import { Tenant } from './models/Tenant.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestCoordinator() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Get the first tenant
    const tenant = await Tenant.findOne();
    if (!tenant) {
      console.log('❌ No tenants found! Create a tenant first.');
      process.exit(1);
    }

    const coordinatorData = {
      name: 'Test Coordinator',
      email: 'testcoordinator@example.com',
      password: 'Test123456',
      role: 'coordinator',
      tenantId: tenant._id,
      isActive: true,
      isVerified: true,
      phone: '9876543210',
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: coordinatorData.email, role: 'coordinator' });
    if (existingUser) {
      console.log('❌ Coordinator already exists!');
      console.log('📧 Email:', coordinatorData.email);
      console.log('🔐 Password: Test123456');
      process.exit(0);
    }

    // Create new coordinator
    const newCoordinator = await User.create(coordinatorData);
    console.log('✅ Test Coordinator created successfully!');
    console.log('\n📧 ========== LOGIN CREDENTIALS ==========');
    console.log('Email:', coordinatorData.email);
    console.log('Password:', coordinatorData.password);
    console.log('Role:', coordinatorData.role);
    console.log('Tenant:', tenant.name);
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestCoordinator();
