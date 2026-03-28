// Fix Member username index to be unique per family instead of system-wide
// Usage: cd backend && node scripts/fix-member-username-index.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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

    // Drop any existing username-only and username+family indexes by detected name.
    // This avoids failures when MongoDB uses non-default index names.
    const targetIndexes = currentIndexes.filter(
      (idx) => idx.key.username || (idx.key.username && idx.key.family_id)
    );

    for (const idx of targetIndexes) {
      if (idx.name === '_id_') continue;
      if (!(idx.key.username && (Object.keys(idx.key).length === 1 || idx.key.family_id))) continue;

      console.log(`\n🔄 Dropping index: ${idx.name} (${JSON.stringify(idx.key)})`);
      await Member.collection.dropIndex(idx.name);
      console.log(`✅ Dropped index: ${idx.name}`);
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
