// Fix indexes for collections that must be unique per family instead of globally.
// Usage: cd backend && node scripts/fix-family-scoped-indexes.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PointWallet = require('../models/point_walletModel');
const Wishlist = require('../models/wishlistModel');
const LocationShare = require('../models/locationShareModel');

async function rebuildFamilyScopedIndex(model, { collectionLabel, fieldName }) {
  const indexes = await model.collection.indexes();
  console.log(`\n[${collectionLabel}] Current indexes:`);
  indexes.forEach((idx) => {
    console.log(' -', idx.name, JSON.stringify(idx.key), idx.unique ? '(unique)' : '');
  });

  const candidateIndexes = indexes.filter((idx) => idx.name !== '_id_');

  for (const idx of candidateIndexes) {
    const keys = Object.keys(idx.key);
    const hasTargetField = keys.includes(fieldName);
    if (!hasTargetField) continue;

    const isSingleField = keys.length === 1;
    const isTargetCompound = keys.length === 2 && keys.includes('family_id');

    if (isSingleField || isTargetCompound) {
      console.log(`Dropping index: ${idx.name}`);
      await model.collection.dropIndex(idx.name);
    }
  }

  console.log(`Creating unique compound index: { ${fieldName}: 1, family_id: 1 }`);
  await model.collection.createIndex({ [fieldName]: 1, family_id: 1 }, { unique: true });

  const finalIndexes = await model.collection.indexes();
  console.log(`[${collectionLabel}] Final indexes:`);
  finalIndexes.forEach((idx) => {
    console.log(' -', idx.name, JSON.stringify(idx.key), idx.unique ? '(unique)' : '');
  });
}

async function main() {
  try {
    const DB_URI = process.env.DB.replace('<db_password>', process.env.DB_PASSWORD);
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    await rebuildFamilyScopedIndex(PointWallet, {
      collectionLabel: 'PointWallet',
      fieldName: 'member_mail',
    });

    await rebuildFamilyScopedIndex(Wishlist, {
      collectionLabel: 'Wishlist',
      fieldName: 'member_mail',
    });

    await rebuildFamilyScopedIndex(LocationShare, {
      collectionLabel: 'LocationShare',
      fieldName: 'member_mail',
    });

    console.log('\nFamily-scoped index fix complete.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

main();
