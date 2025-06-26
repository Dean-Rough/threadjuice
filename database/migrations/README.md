# Database Migrations

## Running Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the migration SQL from the relevant file
4. Click "Run" to execute

### Option 2: Via Script (Experimental)

```bash
npm run db:run-migration database/migrations/001_add_vote_columns.sql
```

Note: The script approach requires proper permissions and may not work with all Supabase setups.

## Current Migrations

### 001_add_vote_columns.sql
- Adds `upvote_count` and `downvote_count` columns to the `posts` table
- Adds `ip_address` and `user_agent` columns to the `user_interactions` table
- Creates indexes for performance

## Creating New Migrations

1. Create a new file with format: `XXX_description.sql` (e.g., `002_add_user_preferences.sql`)
2. Write your SQL migration
3. Test in a development environment first
4. Apply to production via Supabase dashboard