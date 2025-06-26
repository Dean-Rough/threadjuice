# ThreadJuice Production Deployment Guide

## Current Status: READY FOR DATABASE SETUP

The Terry's assessment: All the pieces are built - database scripts ready, API endpoints created, newsletter system configured. Just need to wire it all up to Supabase and flip the switch.

## Pre-Deployment Checklist

### 1. Environment Variables (Vercel Dashboard)

**Required for Launch:**
```bash
# Supabase (Get from Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://okugoocdornbiwwykube.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cron Security
CRON_SECRET=your-random-secret-here

# APIs Already Working
PEXELS_API_KEY=your-key
TWITTER_BEARER_TOKEN=your-key (optional - Twitter broken anyway)
```

**For Newsletter (Can add later):**
```bash
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=...
```

**For Auth (Add last):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 2. Database Setup

```bash
# 1. Run the setup script locally first
npm run db:setup

# This will:
# - Check Supabase connection
# - Create schema (or provide instructions)
# - Migrate any existing SQLite data
# - Seed initial categories/personas
```

### 3. Local Testing

```bash
# 1. Start dev server
npm run dev

# 2. Test critical paths:
# - Homepage loads with posts
# - Comments display real Reddit data
# - Voting/sharing works
# - Newsletter signup works

# 3. Generate a test story
npm run story:generate
```

### 4. Deploy to Vercel

```bash
# Push to main branch
git push origin main

# Vercel will automatically:
# - Build the project
# - Run ESLint
# - Deploy to production
```

## Post-Deployment Tasks

### Immediate (Day 1)

1. **Verify Cron Jobs**
   - Check Vercel Functions logs
   - Manually trigger: `/api/cron/generate-content`
   - Verify stories appear in database

2. **Test User Flows**
   - Read a story
   - Leave a comment
   - Vote on posts
   - Share a story
   - Subscribe to newsletter

3. **Monitor Supabase**
   - Check query performance
   - Review database size
   - Verify RLS policies work

### Within 24 Hours

1. **Content Pipeline**
   - Ensure cron generates 5 stories at 6 AM UTC
   - Check story quality
   - Monitor Reddit API usage

2. **Newsletter Test**
   - Subscribe with test email
   - Verify welcome email
   - Check daily digest (9 AM UTC)

3. **Performance Check**
   - Lighthouse scores
   - Core Web Vitals
   - Database query times

### Week 1 Optimizations

1. **Implement Caching**
   - Add Redis for rate limiting
   - Cache popular posts
   - Implement ISR for post pages

2. **Add Monitoring**
   - Sentry for error tracking
   - Analytics for user behavior
   - Uptime monitoring

3. **Content Moderation**
   - Review generated stories
   - Set up flagging system
   - Create admin dashboard

## Rollback Plan

If things go sideways:

1. **Immediate Rollback**
   ```bash
   # In Vercel Dashboard
   # Deployments → Select previous → Promote to Production
   ```

2. **Database Issues**
   - Supabase keeps backups
   - Can restore to point in time
   - SQLite backup still exists locally

3. **Content Issues**
   - Disable cron jobs in vercel.json
   - Manually curate content
   - Fix generation scripts

## API Endpoints Now Available

### Content
- `GET /api/posts` - List posts with filters
- `GET /api/posts/[id]` - Single post
- `POST /api/posts/[id]/vote` - Vote on post
- `POST /api/posts/[id]/share` - Track share
- `POST /api/posts/[id]/bookmark` - Save post

### Comments
- `GET /api/posts/[id]/comments` - Get comments
- `POST /api/posts/[id]/comments` - Add comment
- `POST /api/comments/[id]/vote` - Vote on comment

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe
- `GET /api/newsletter/unsubscribe` - Unsubscribe

### Cron Jobs
- `/api/cron/generate-content` - Daily at 6 AM UTC
- `/api/cron/send-newsletter` - Daily at 9 AM UTC
- `/api/cron/update-trending` - Every 6 hours

## Database Schema Highlights

- **Posts** - Full content with trending scores
- **Comments** - Nested with Reddit imports
- **Newsletter Subscribers** - Preferences and status
- **User Interactions** - Anonymous tracking
- **Categories & Personas** - Content organization

## Current Architecture

```
Frontend (Next.js)
    ↓
API Routes
    ↓
Supabase (PostgreSQL)
    ↓
Background Jobs (Vercel Cron)
```

## What's NOT Implemented Yet

1. **User Authentication** (Clerk ready but not wired)
2. **Admin Dashboard** (APIs exist, no UI)
3. **Search Functionality** (DB supports it)
4. **Content Moderation** (Manual for now)
5. **Social Login** (Waiting on Clerk)

## Support Contacts

- **Vercel Issues**: Check function logs
- **Supabase Issues**: Dashboard → Support
- **Domain/DNS**: Your registrar
- **Content Issues**: Check generation logs

---

**The Terry's final word**: You've got a solid foundation here. Database is the last big piece - get that connected and you're basically running a proper viral content platform. Remember - real data only, no mock nonsense. Now crack on and make it live!