/**
 * One-time script: fixes all users in the DB whose passwords are stored as
 * plain-text (not a bcrypt hash) by re-hashing them.
 *
 * Run with:  node fixPasswords.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travelagency';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  jobTitle: String,
  status: String,
  isSystemUser: Boolean,
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function fixPasswords() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  const users = await User.find({});
  console.log(`\n📋 Found ${users.length} user(s):\n`);

  let fixed = 0;
  let skipped = 0;

  for (const user of users) {
    const isBcrypt = user.password && user.password.startsWith('$2');

    console.log(`  User: ${user.name} | Email: ${user.email}`);
    console.log(`  Password stored: ${user.password || '(none)'}`);
    console.log(`  Already hashed:  ${isBcrypt ? 'YES ✅' : 'NO ❌'}`);

    if (!isBcrypt) {
      // If no password at all, set a default of "password123"
      const plainText = user.password || 'password123';
      const hashed = await bcrypt.hash(plainText, 10);
      await User.updateOne({ _id: user._id }, { password: hashed });
      console.log(`  → Re-hashed "${plainText}" → saved.`);
      fixed++;
    } else {
      skipped++;
    }
    console.log('');
  }

  console.log(`Done! Fixed: ${fixed}, Already OK: ${skipped}`);
  await mongoose.disconnect();
}

fixPasswords().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
