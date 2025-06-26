# ThreadJuice Supabase Production Setup Guide

## Overview

This guide will help you set up ThreadJuice with a production-ready Supabase PostgreSQL database, migrating from the current SQLite setup.

## Prerequisites

- Supabase account (free tier is fine to start)
- Environment variables for Supabase connection
- Node.js and npm installed

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (or use existing `okugoocdornbiwwykube`)
3. Note down:
   - Project URL: `https://[PROJECT_ID].supabase.co`
   - Anon Key: `eyJ...` (public key)
   - Service Role Key: `eyJ...` (admin key - keep secret!)

## Step 2: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)
1. Go to SQL Editor in Supabase Dashboard
2. Copy the entire contents of `/database/schema.sql`
3. Paste and execute
4. Verify tables are created in Table Editor

### Option B: Using Migration Script
```bash
# Run the automated setup
npm run db:setup
```

## Step 3: Update Environment Variables

Update your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://okugoocdornbiwwykube.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database URL for Prisma (PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.okugoocdornbiwwykube.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.okugoocdornbiwwykube.supabase.co:5432/postgres
```

Get the database password from Supabase Dashboard > Settings > Database.

## Step 4: Migrate Existing Data

```bash
# Make the migration script executable
chmod +x scripts/database/migrate-to-postgres.js

# Run the migration
node scripts/database/migrate-to-postgres.js
```

This will:
- Copy all posts, comments, and interactions from SQLite
- Preserve all relationships and metadata
- Maintain creation timestamps

## Step 5: Update Prisma Configuration

```bash
# Backup current schema
cp prisma/schema.prisma prisma/schema.sqlite.backup

# Use PostgreSQL schema
cp prisma/schema.postgres.prisma prisma/schema.prisma

# Generate new Prisma client
npx prisma generate
```

## Step 6: Update Application Code

The application needs to use Supabase client instead of Prisma for API routes:

```bash
# The codebase is already prepared with Supabase-ready API routes
# Just need to ensure they're being used
```

## Step 7: Verify Setup

1. **Check Database**:
   ```bash
   # Test connection
   npx prisma db pull
   ```

2. **Test API**:
   ```bash
   # Should return posts from Supabase
   curl http://localhost:4242/api/posts
   ```

3. **Test Frontend**:
   - Visit http://localhost:4242
   - Stories should load from database
   - Comments and interactions should work

## Step 8: Production Deployment

### Vercel Environment Variables

Add these to your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=https://okugoocdornbiwwykube.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_anon_key]
DATABASE_URL=[your_connection_string]
```

### Deploy
```bash
vercel --prod
```

## Database Features Now Available

### 1. Real-time Updates
```javascript
// Subscribe to new posts
const subscription = supabase
  .channel('posts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => console.log('New post!', payload)
  )
  .subscribe()
```

### 2. Full-text Search
```javascript
// Search posts
const { data } = await supabase
  .from('posts')
  .select()
  .textSearch('title', 'viral story')
```

### 3. Row Level Security
- Anonymous users can read published posts
- Authenticated users can create comments
- Admin users can manage all content

### 4. Automatic Counters
- View counts increment on page view
- Share counts track social shares
- Trending scores calculate automatically

## Troubleshooting

### Connection Issues
- Check Supabase project is not paused
- Verify environment variables are set
- Ensure database password is correct

### Migration Errors
- Run `npx prisma db push --force-reset` to reset schema
- Check Supabase logs for detailed errors
- Ensure all required extensions are enabled

### Performance
- Enable connection pooling for serverless
- Add appropriate indexes (already in schema)
- Use Supabase caching features

## Next Steps

1. **Enable Authentication**:
   - Set up Clerk integration
   - Connect to Supabase RLS policies

2. **Add Newsletter**:
   - Configure Resend API
   - Set up subscriber management

3. **Implement Cron Jobs**:
   - Reddit content ingestion
   - Trending score updates
   - Cache cleanup

## Rollback Plan

If issues arise:

1. Keep SQLite database as backup
2. Switch back to original schema:
   ```bash
   cp prisma/schema.sqlite.backup prisma/schema.prisma
   npx prisma generate
   ```
3. Update environment to use SQLite URL
4. Restart application

---

**The Terry's verdict**: Proper database at last. No more SQLite nonsense in production.