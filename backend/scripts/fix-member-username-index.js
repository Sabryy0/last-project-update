// Fix Member username index to be unique per family instead of system-wide
// Usage: cd backend && node scripts/fix-member-username-index.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const Member = require('../models/MemberModel');

async function fixMemberUsernameIndex() {
  try {
    // Connect to MongoDB
    const DB_URI = process.env.DB.replace('<db_password>', process.env.DB_PASSWORD);
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');

    // Show current indexes
    const currentIndexes = await Member.collection.indexes();
    console.log('\n📋 Current indexes:');
    currentIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    // Check if there's a standalone username index
    const usernameIndex = currentIndexes.find(idx => 
      idx.key.username && !idx.key.family_id
    );

    if (usernameIndex) {
      console.log('\n🔄 Dropping standalone username index...');
      await Member.collection.dropIndex('username_1');
      console.log('✅ Standalone username index dropped');
    }

    // Drop compound index if it exists and recreate
    const compoundIndex = currentIndexes.find(idx => 
      idx.key.username && idx.key.family_id
    );

    if (compoundIndex) {
      console.log('\n🔄 Dropping existing compound index...');
      await Member.collection.dropIndex('username_1_family_id_1');
      console.log('✅ Existing compound index dropped');
    }

    // Create the compound index (username unique per family)
    console.log('\n🔄 Creating compound index (username + family_id)...');
    await Member.collection.createIndex(
      { username: 1, family_id: 1 }, 
      { unique: true }
    );
    console.log('✅ Compound index created successfully!');
    
    // Show all indexes after fix
    const finalIndexes = await Member.collection.indexes();
    console.log('\n📋 Final indexes:');
    finalIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    console.log('\n✅ Fix complete! Now usernames are unique per family, not system-wide.');
    console.log('   Example: Family A can have "john" and Family B can also have "john"');

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

fixMemberUsernameIndex();
