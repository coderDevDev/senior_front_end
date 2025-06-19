import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Test function to analyze current password state
async function analyzePasswords() {
  console.log('🔍 Analyzing current password state...\n');

  try {
    // Check sb_users table
    console.log('📊 Analyzing sb_users table...');
    const { data: users, error: usersError } = await supabase
      .from('sb_users')
      .select('id, email, password')
      .not('password', 'is', null);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found in sb_users table');
    } else {
      let hashedCount = 0;
      let plainTextCount = 0;

      users.forEach(user => {
        if (isAlreadyHashed(user.password)) {
          hashedCount++;
        } else {
          plainTextCount++;
          console.log(`   📝 Plain text password found: ${user.email}`);
        }
      });

      console.log(`   📈 Total users: ${users.length}`);
      console.log(`   🔒 Already hashed: ${hashedCount}`);
      console.log(`   📝 Plain text: ${plainTextCount}`);
    }

    // Check senior_citizens table
    console.log('\n📊 Analyzing senior_citizens table...');
    const { data: seniors, error: seniorsError } = await supabase
      .from('senior_citizens')
      .select('id, email, password')
      .not('password', 'is', null);

    if (seniorsError) {
      console.error('❌ Error fetching senior citizens:', seniorsError);
      return;
    }

    if (!seniors || seniors.length === 0) {
      console.log('ℹ️  No senior citizens found in senior_citizens table');
    } else {
      let hashedCount = 0;
      let plainTextCount = 0;

      seniors.forEach(senior => {
        if (isAlreadyHashed(senior.password)) {
          hashedCount++;
        } else {
          plainTextCount++;
          console.log(`   📝 Plain text password found: ${senior.email}`);
        }
      });

      console.log(`   📈 Total senior citizens: ${seniors.length}`);
      console.log(`   🔒 Already hashed: ${hashedCount}`);
      console.log(`   📝 Plain text: ${plainTextCount}`);
    }

    // Test bcrypt functionality
    console.log('\n🧪 Testing bcrypt functionality...');
    const testPassword = 'testPassword123';
    const hashedTestPassword = await hashPassword(testPassword);
    const isHashed = isAlreadyHashed(hashedTestPassword);

    console.log(`   Test password: ${testPassword}`);
    console.log(`   Hashed result: ${hashedTestPassword.substring(0, 20)}...`);
    console.log(`   Is recognized as hashed: ${isHashed}`);

    // Test password verification
    const isValid = await bcrypt.compare(testPassword, hashedTestPassword);
    console.log(`   Password verification works: ${isValid}`);

    console.log('\n✅ Analysis completed successfully!');
    console.log(
      '💡 If you see plain text passwords above, you can run the migration script.'
    );
    console.log(
      '💡 If all passwords are already hashed, no migration is needed.'
    );
  } catch (err) {
    console.error('❌ Error during analysis:', err);
  }
}

// Run the analysis
analyzePasswords()
  .then(() => {
    console.log('\n✅ Test script finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
