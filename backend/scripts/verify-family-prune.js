// Verify database contains only data for the family/families linked to a target email.
// Usage:
//   node scripts/verify-family-prune.js menna_sherif@gmail.com

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const FamilyAccount = require('../models/FamilyAccountModel');
const Member = require('../models/MemberModel');

async function verify(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Please provide a target email');
  }

  const dbUri = process.env.DB.replace('<db_password>', process.env.DB_PASSWORD);
  await mongoose.connect(dbUri);
  console.log('Connected to MongoDB');

  try {
    const keeperMembers = await Member.find({ mail: normalizedEmail })
      .select('_id mail family_id')
      .lean();

    if (!keeperMembers.length) {
      throw new Error(`No member found for: ${normalizedEmail}`);
    }

    const keepFamilyIds = [...new Set(keeperMembers.map((m) => m.family_id.toString()))].map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const keptMembers = await Member.find({ family_id: { $in: keepFamilyIds } })
      .select('mail family_id')
      .lean();

    const keepMails = [...new Set(keptMembers.map((m) => String(m.mail).toLowerCase()))];

    const outsideFamilies = await FamilyAccount.countDocuments({ _id: { $nin: keepFamilyIds } });
    const outsideMembers = await Member.countDocuments({ family_id: { $nin: keepFamilyIds } });

    console.log(`Target email: ${normalizedEmail}`);
    console.log(`Kept family IDs: ${keepFamilyIds.map((id) => id.toString()).join(', ')}`);
    console.log(`Kept members: ${keptMembers.length}`);
    console.log('');
    console.log(`outsideFamilies=${outsideFamilies}`);
    console.log(`outsideMembers=${outsideMembers}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    let violations = 0;

    for (const entry of collections) {
      const name = entry.name;
      if (name.startsWith('system.')) continue;
      if (name === 'familyaccounts' || name === 'members') continue;

      const col = mongoose.connection.db.collection(name);

      const hasFamilyId = await col.findOne({ family_id: { $exists: true } });
      if (hasFamilyId) {
        const count = await col.countDocuments({ family_id: { $nin: keepFamilyIds } });
        if (count > 0) {
          violations++;
          console.log(`VIOLATION family_id scope: ${name} -> ${count}`);
        }
        continue;
      }

      const hasMemberMail = await col.findOne({ member_mail: { $exists: true } });
      if (hasMemberMail) {
        const count = await col.countDocuments({
          $expr: {
            $not: { $in: [{ $toLower: '$member_mail' }, keepMails] },
          },
        });
        if (count > 0) {
          violations++;
          console.log(`VIOLATION member_mail scope: ${name} -> ${count}`);
        }
      }
    }

    if (outsideFamilies === 0 && outsideMembers === 0 && violations === 0) {
      console.log('');
      console.log('VERIFIED: No records found outside the kept family scope.');
    } else {
      console.log('');
      console.log('NOT CLEAN: Out-of-scope records still exist.');
      process.exitCode = 2;
    }
  } finally {
    await mongoose.connection.close();
    console.log('DB connection closed');
  }
}

const emailArg = process.argv[2] || 'menna_sherif@gmail.com';
verify(emailArg).catch((err) => {
  console.error('Verification failed:', err.message || err);
  process.exit(1);
});
