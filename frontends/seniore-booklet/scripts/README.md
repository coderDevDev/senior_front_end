# Password Migration Script

This script migrates existing plain text passwords in the database to bcrypt hashed passwords.

## ⚠️ Important Notes

- **Backup your database** before running this script
- This script will modify passwords in both `sb_users` and `senior_citizens` tables
- The script is designed to be safe and will skip already hashed passwords
- Run this script only once to avoid double-hashing

## Prerequisites

1. Make sure you have the required environment variables in your `.env.local` file:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

## Running the Migration

### Step 1: Test First (Recommended)

Before running the actual migration, test to see what passwords need to be migrated:

```bash
npm run test-migration
```

This will show you:

- How many users have plain text passwords
- How many users already have hashed passwords
- Test the bcrypt functionality
- List any plain text passwords found

### Step 2: Run the Migration

If the test shows plain text passwords, run the migration:

#### Option 1: Using npm script (Recommended)

```bash
npm run migrate-passwords
```

#### Option 2: Direct execution

```bash
npx tsx scripts/migrate-passwords.ts
```

## What the Script Does

1. **Fetches all users** from `sb_users` table with non-null passwords
2. **Fetches all senior citizens** from `senior_citizens` table with non-null passwords
3. **Checks each password** to see if it's already hashed (using bcrypt pattern)
4. **Hashes plain text passwords** using bcrypt with 12 salt rounds
5. **Updates the database** with the hashed passwords
6. **Provides detailed logging** of the migration process

## Safety Features

- **Skip already hashed passwords**: The script detects bcrypt hashes and skips them
- **Error handling**: Individual password failures won't stop the entire migration
- **Detailed logging**: Shows progress and results for each table
- **Summary report**: Provides counts of migrated, skipped, and failed passwords

## Expected Output

```
🚀 Starting password migration script...

🔍 Starting migration for sb_users table...
📊 Found 25 users in sb_users table
⏭️  Skipping user1@example.com - password already hashed
✅ Successfully migrated password for user2@example.com
✅ Successfully migrated password for user3@example.com

📈 sb_users Migration Summary:
   ✅ Migrated: 20
   ⏭️  Skipped: 5
   ❌ Errors: 0

🔍 Starting migration for senior_citizens table...
📊 Found 15 senior citizens in senior_citizens table
✅ Successfully migrated password for senior1@example.com
✅ Successfully migrated password for senior2@example.com

📈 senior_citizens Migration Summary:
   ✅ Migrated: 15
   ⏭️  Skipped: 0
   ❌ Errors: 0

🎉 Password migration completed!
✅ Migration script finished successfully
```

## Troubleshooting

### Common Issues

1. **Environment variables not found**

   - Ensure `.env.local` file exists with correct Supabase credentials
   - Check that variable names match exactly

2. **Permission errors**

   - Ensure your Supabase service role has write permissions to the tables
   - Check Row Level Security (RLS) policies

3. **Network errors**
   - Check your internet connection
   - Verify Supabase URL is correct

### Rollback Plan

If something goes wrong, you can restore from your database backup. The script doesn't create a backup automatically, so make sure to create one before running the migration.

## After Migration

1. **Test login functionality** for existing users
2. **Verify new registrations** work correctly with hashed passwords
3. **Monitor for any authentication issues**

## Security Notes

- The script uses bcrypt with 12 salt rounds (industry standard)
- Plain text passwords are never logged to the console
- The script only processes passwords that are not already hashed
- All database operations are logged for audit purposes
