import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
console.log(supabaseUrl, supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Function to check if a string is already hashed
function isAlreadyHashed(password: string): boolean {
  // bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/.test(password);
}

// Function to hash a password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Function to migrate passwords in sb_users table
async function migrateSbUsersPasswords() {
  console.log('🔍 Starting migration for sb_users table...');

  try {
    // Fetch all users with plain text passwords
    const { data: users, error } = await supabase
      .from('sb_users')
      .select('user_uid, email, password, userRole')
      .not('password', 'is', null);

    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found in sb_users table');
      return;
    }

    console.log(`📊 Found ${users.length} users in sb_users table`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Skip if password is already hashed
        if (isAlreadyHashed(user.password)) {
          console.log(`⏭️  Skipping ${user.email} - password already hashed`);
          skippedCount++;
          continue;
        }

        // Hash the password
        const hashedPassword = await hashPassword(user.password);

        // Update the user record
        const { error: updateError } = await supabase
          .from('sb_users')
          .update({
            confirmPassword: hashedPassword,
            password: hashedPassword,
            updated_at: new Date().toISOString()
          })
          .eq('user_uid', user.user_uid);

        if (updateError) {
          console.error(`❌ Error updating ${user.email}:`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Successfully migrated password for ${user.email}`);
          migratedCount++;
        }
      } catch (err) {
        console.error(`❌ Error processing ${user.email}:`, err);
        errorCount++;
      }
    }

    console.log('\n📈 sb_users Migration Summary:');
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
  } catch (err) {
    console.error('❌ Unexpected error during sb_users migration:', err);
  }
}

// Function to migrate passwords in senior_citizens table
async function migrateSeniorCitizensPasswords() {
  console.log('\n🔍 Starting migration for senior_citizens table...');

  try {
    // Fetch all senior citizens with plain text passwords
    const { data: seniors, error } = await supabase
      .from('senior_citizens')
      .select('user_uid, email, password, userRole')
      .not('password', 'is', null);

    if (error) {
      console.error('❌ Error fetching senior citizens:', error);
      return;
    }

    if (!seniors || seniors.length === 0) {
      console.log('ℹ️  No senior citizens found in senior_citizens table');
      return;
    }

    console.log(
      `📊 Found ${seniors.length} senior citizens in senior_citizens table`
    );

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const senior of seniors) {
      try {
        // Skip if password is already hashed
        if (isAlreadyHashed(senior.password)) {
          console.log(`⏭️  Skipping ${senior.email} - password already hashed`);
          skippedCount++;
          continue;
        }

        // Hash the password
        const hashedPassword = await hashPassword(senior.password);

        // Update the senior citizen record
        const { error: updateError } = await supabase
          .from('senior_citizens')
          .update({
            password: hashedPassword,
            updatedAt: new Date().toISOString()
          })
          .eq('user_uid', senior.user_uid);

        if (updateError) {
          console.error(`❌ Error updating ${senior.email}:`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Successfully migrated password for ${senior.email}`);
          migratedCount++;
        }
      } catch (err) {
        console.error(`❌ Error processing ${senior.email}:`, err);
        errorCount++;
      }
    }

    console.log('\n📈 senior_citizens Migration Summary:');
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
  } catch (err) {
    console.error('❌ Unexpected error during senior_citizens migration:', err);
  }
}

// Main migration function
async function migrateAllPasswords() {
  console.log('🚀 Starting password migration script...\n');

  // Migrate sb_users table
  await migrateSbUsersPasswords();

  // Migrate senior_citizens table
  await migrateSeniorCitizensPasswords();

  console.log('\n🎉 Password migration completed!');
}

// Run the migration
migrateAllPasswords()
  .then(() => {
    console.log('✅ Migration script finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
