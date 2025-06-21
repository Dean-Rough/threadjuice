-- First, let's see what tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Drop any existing broken tables
DROP TABLE IF EXISTS "post_tags" CASCADE;
DROP TABLE IF EXISTS "user_interactions" CASCADE; 
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "images" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "analytics_events" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "personas" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;

-- Create the posts table we need for migration
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hook TEXT NOT NULL,
  content JSONB NOT NULL,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  trending_score INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  featured_image TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for migration
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;