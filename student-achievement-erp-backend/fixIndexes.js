import { connectDB } from './config/database.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixIndexes() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('📋 CURRENT INDEXES:');
    console.log('=====================================');
    indexes.forEach((index, idx) => {
      console.log(`${idx}.`, index);
    });

    // Drop the old unique email index if it exists
    const emailIndexExists = indexes.some(idx => 
      idx.name === 'email_1' || (idx.key && idx.key.email === 1 && !idx.key.role)
    );
    
    if (emailIndexExists) {
      console.log('\n🔄 Dropping old email_1 index...');
      await collection.dropIndex('email_1');
      console.log('✅ Dropped email_1 index');
    }

    // Drop any existing compound email index
    const compoundExists = indexes.some(idx => idx.name === 'email_role_tenant_unique');
    if (compoundExists) {
      console.log('✅ Compound index already exists');
    }

    // Create the new compound index
    console.log('\n🔄 Creating compound unique index on (email, role, tenantId)...');
    await collection.createIndex(
      { email: 1, role: 1, tenantId: 1 },
      { unique: true, sparse: true, name: 'email_role_tenant_unique' }
    );
    console.log('✅ Created compound unique index');

    // Show new indexes
    const newIndexes = await collection.indexes();
    console.log('\n📋 NEW INDEXES:');
    console.log('=====================================');
    newIndexes.forEach((index, idx) => {
      console.log(`${idx}.`, index);
    });

    console.log('\n✅ Index migration completed successfully!');
    console.log('Now you can create coordinators with emails that were used by students.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixIndexes();
