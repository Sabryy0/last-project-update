// Backfill missing family_id across family-scoped collections.
// Usage: cd backend && node scripts/backfill-family-id.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Member = require('../models/MemberModel');
const PointWallet = require('../models/point_walletModel');
const Wishlist = require('../models/wishlistModel');
const LocationShare = require('../models/locationShareModel');
const PointDetails = require('../models/point_historyModel');

async function resolveFamilyIdByMail(mail) {
  const members = await Member.find({ mail }).select('_id family_id').lean();
  if (members.length === 1) {
    return { familyId: members[0].family_id, count: 1 };
  }
  return { familyId: null, count: members.length };
}

async function backfillCollection(model, label) {
  const docs = await model.find({ $or: [{ family_id: { $exists: false } }, { family_id: null }] }).lean();
  let updated = 0;
  let skipped = 0;
  let deletedOrphans = 0;

  for (const doc of docs) {
    const mail = doc.member_mail;
    if (!mail) {
      skipped++;
      continue;
    }

    const resolved = await resolveFamilyIdByMail(mail);
    const familyId = resolved.familyId;
    const memberCount = resolved.count;

    if (!familyId) {
      if (memberCount === 0) {
        await model.deleteOne({ _id: doc._id });
        deletedOrphans++;
      }
      skipped++;
      continue;
    }

    await model.updateOne({ _id: doc._id }, { $set: { family_id: familyId } });
    updated++;
  }

  console.log(`[${label}] backfill done: updated=${updated}, skipped=${skipped}, deleted_orphans=${deletedOrphans}`);
}

async function backfillPointHistory() {
  const docs = await PointDetails.find({ $or: [{ family_id: { $exists: false } }, { family_id: null }] }).lean();
  let updated = 0;
  let skipped = 0;

  for (const doc of docs) {
    let familyId = null;

    if (doc.wallet_id) {
      const wallet = await PointWallet.findById(doc.wallet_id).select('family_id').lean();
      if (wallet && wallet.family_id) {
        familyId = wallet.family_id;
      }
    }

    if (!familyId && doc.member_mail) {
      const resolved = await resolveFamilyIdByMail(doc.member_mail);
      familyId = resolved.familyId;
    }

    if (!familyId) {
      skipped++;
      continue;
    }

    await PointDetails.updateOne({ _id: doc._id }, { $set: { family_id: familyId } });
    updated++;
  }

  console.log(`[PointHistory] backfill done: updated=${updated}, skipped=${skipped}`);
}

async function main() {
  try {
    const DB_URI = process.env.DB.replace('<db_password>', process.env.DB_PASSWORD);
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    await backfillCollection(PointWallet, 'PointWallet');
    await backfillCollection(Wishlist, 'Wishlist');
    await backfillCollection(LocationShare, 'LocationShare');
    await backfillPointHistory();

    await mongoose.connection.close();
    console.log('Backfill completed and DB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exit(1);
  }
}

main();
