// Keep only the family/families linked to a specific member email.
// Deletes all other family accounts, members, and family/member-scoped documents.
// Usage:
//   node scripts/prune-to-family-by-email.js menna_sherif@gmail.com

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const FamilyAccount = require('../models/FamilyAccountModel');
const Member = require('../models/MemberModel');

async function pruneToEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Please provide a target email.');
  }

  const dbUri = process.env.DB.replace('<db_password>', process.env.DB_PASSWORD);
  await mongoose.connect(dbUri);
  console.log('Connected to MongoDB');

  try {
    const keeperMembers = await Member.find({ mail: normalizedEmail })
      .select('_id mail family_id')
      .lean();

    if (!keeperMembers.length) {
      throw new Error(`No members found for email: ${normalizedEmail}`);
    }

    const keepFamilyIds = [...new Set(keeperMembers.map((m) => m.family_id.toString()))].map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const keptMembers = await Member.find({ family_id: { $in: keepFamilyIds } })
      .select('_id mail family_id')
      .lean();

    const keepMemberMails = [...new Set(keptMembers.map((m) => m.mail.toLowerCase()))];

    console.log(`Target email: ${normalizedEmail}`);
    console.log(`Keeping family IDs: ${keepFamilyIds.map((id) => id.toString()).join(', ')}`);
    console.log(`Keeping members: ${keptMembers.length}`);

    const summary = [];

    // 1) Remove non-kept members first.
    const membersDeleteResult = await Member.deleteMany({ family_id: { $nin: keepFamilyIds } });
    summary.push({ collection: 'members', removed: membersDeleteResult.deletedCount || 0, reason: 'family_id not kept' });

    // 2) Remove non-kept family accounts.
    const familiesDeleteResult = await FamilyAccount.deleteMany({ _id: { $nin: keepFamilyIds } });
    summary.push({ collection: 'familyaccounts', removed: familiesDeleteResult.deletedCount || 0, reason: '_id not kept' });

    // 3) Prune all other collections by family_id (preferred) or member_mail.
    const collections = await mongoose.connection.db.listCollections().toArray();

    for (const entry of collections) {
      const name = entry.name;
      if (name.startsWith('system.')) continue;
      if (name === 'members' || name === 'familyaccounts') continue;

      const col = mongoose.connection.db.collection(name);
      let removed = 0;
      let rule = '';

      const hasFamilyScopedDocs = await col.findOne({ family_id: { $exists: true } });
      if (hasFamilyScopedDocs) {
        const res = await col.deleteMany({ family_id: { $nin: keepFamilyIds } });
        removed = res.deletedCount || 0;
        rule = 'family_id not kept';
      } else {
        const hasMemberMailScopedDocs = await col.findOne({ member_mail: { $exists: true } });
        if (hasMemberMailScopedDocs) {
          const res = await col.deleteMany({
            $expr: {
              $not: {
                $in: [{ $toLower: '$member_mail' }, keepMemberMails],
              },
            },
          });
          removed = res.deletedCount || 0;
          rule = 'member_mail not in kept family';
        }
      }

      if (removed > 0) {
        summary.push({ collection: name, removed, reason: rule });
      }
    }

    // 4) Safety pass: if any members exist in non-kept families (should be zero), remove them.
    const leakedMembers = await Member.find({ family_id: { $nin: keepFamilyIds } }).select('_id').lean();
    if (leakedMembers.length) {
      await Member.deleteMany({ _id: { $in: leakedMembers.map((m) => m._id) } });
      summary.push({ collection: 'members', removed: leakedMembers.length, reason: 'safety pass' });
    }

    // 5) Log remaining key counts.
    const remainingFamilies = await FamilyAccount.countDocuments({});
    const remainingMembers = await Member.countDocuments({});

    console.log('\nCleanup summary:');
    for (const item of summary) {
      console.log(` - ${item.collection}: removed ${item.removed} (${item.reason})`);
    }

    console.log('\nRemaining:');
    console.log(` - families: ${remainingFamilies}`);
    console.log(` - members: ${remainingMembers}`);
    console.log('Done.');
  } finally {
    await mongoose.connection.close();
    console.log('DB connection closed');
  }
}

const emailArg = process.argv[2] || 'menna_sherif@gmail.com';
pruneToEmail(emailArg).catch((err) => {
  console.error('Prune failed:', err.message || err);
  process.exit(1);
});
