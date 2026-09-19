import { connectDB } from './config/database.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function removeUsernameIndex() {
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
      console.log(`${idx}.`, index.name, index);
    });

    // Drop the username unique index if it exists
    const usernameIndexExists = indexes.some(idx => idx.name === 'username_1');
    
    if (usernameIndexExists) {
      console.log('\n🔄 Dropping old username_1 index...');
      await collection.dropIndex('username_1');
      console.log('✅ Dropped username_1 index');
    } else {
      console.log('\n✅ username_1 index does not exist');
    }

    // Show new indexes
    const newIndexes = await collection.indexes();
    console.log('\n📋 NEW INDEXES:');
    console.log('=====================================');
    newIndexes.forEach((index, idx) => {
      console.log(`${idx}.`, index.name);
    });

    console.log('\n✅ Index cleanup completed!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

removeUsernameIndex();
