// Fix Member mail index to be unique per family instead of system-wide
// Usage: cd backend && node scripts/fix-member-mail-index.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Member = require('../models/MemberModel');

async function fixMemberMailIndex() {
  try {
    const DB_URI = process.env.DB.replace('<db_password>', process.env.DB_PASSWORD);
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    const currentIndexes = await Member.collection.indexes();
    console.log('\nCurrent indexes:');
    currentIndexes.forEach((index) => {
      console.log(' -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    const targetIndexes = currentIndexes.filter(
      (idx) => idx.key.mail || (idx.key.mail && idx.key.family_id)
    );

    for (const idx of targetIndexes) {
      if (idx.name === '_id_') continue;
      if (!(idx.key.mail && (Object.keys(idx.key).length === 1 || idx.key.family_id))) continue;

      console.log(`\nDropping index: ${idx.name} (${JSON.stringify(idx.key)})`);
      await Member.collection.dropIndex(idx.name);
      console.log(`Dropped index: ${idx.name}`);
    }

    console.log('\nCreating compound index (mail + family_id)...');
    await Member.collection.createIndex({ mail: 1, family_id: 1 }, { unique: true });
    console.log('Compound index created successfully');

    const finalIndexes = await Member.collection.indexes();
    console.log('\nFinal indexes:');
    finalIndexes.forEach((index) => {
      console.log(' -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    console.log('\nFix complete: same email can now exist in different families.');

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

fixMemberMailIndex();
