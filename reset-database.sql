-- Drop all tables if they exist (clean slate)
DROP TABLE IF EXISTS "post_tags" CASCADE;
DROP TABLE IF EXISTS "user_interactions" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "images" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "analytics_events" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "personas" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "quizzes" CASCADE;
DROP TABLE IF EXISTS "quiz_responses" CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS post_status CASCADE;

-- Now run the proper PostgreSQL schema
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom types
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Categories table for content organization
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personas table for different writing styles
CREATE TABLE personas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  tone TEXT NOT NULL,
  style_preferences JSONB,
  target_audience TEXT,
  content_focus TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table for grouping related posts
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  post_count INTEGER DEFAULT 0,
  trending_score INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hook TEXT NOT NULL,
  content JSONB NOT NULL,
  persona_id INTEGER REFERENCES personas(id),
  status post_status DEFAULT 'draft',
  category TEXT,
  layout_style INTEGER DEFAULT 1,
  featured BOOLEAN DEFAULT false,
  trending_score INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  event_id UUID REFERENCES events(id),
  reddit_thread_id TEXT,
  subreddit TEXT,
  seo_title TEXT,
  seo_description TEXT,
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table with threading support
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id),
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  sentiment JSONB,
  reddit_comment_id TEXT,
  thread_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Images table with attribution support
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  license_type TEXT NOT NULL,
  author TEXT,
  credit_text TEXT,
  source_link TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  completion_count INTEGER DEFAULT 0,
  average_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz responses table
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id TEXT, -- Clerk user ID
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  completion_time INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User interactions table for analytics
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  post_id UUID REFERENCES posts(id),
  interaction_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_featured ON posts(featured);
CREATE INDEX idx_posts_trending_score ON posts(trending_score DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_reddit_thread_id ON posts(reddit_thread_id);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_thread_level ON comments(thread_level);

CREATE INDEX idx_images_post_id ON images(post_id);
CREATE INDEX idx_quizzes_post_id ON quizzes(post_id);
CREATE INDEX idx_quiz_responses_quiz_id ON quiz_responses(quiz_id);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_post_id ON user_interactions(post_id);

-- Insert default personas
INSERT INTO personas (name, avatar_url, tone) VALUES 
('The Terry', '/assets/img/personas/the-terry.svg', 'Acerbic wit and social commentary'),
('The Snarky Sage', '/assets/img/personas/snarky-sage.svg', 'Sarcastic and deadpan with brutal honesty'),
('The Down-to-Earth Buddy', '/assets/img/personas/buddy.svg', 'Chill and friendly with relatable insights');

-- Insert default categories
INSERT INTO categories (name, slug, description, color) VALUES 
('Tech Drama', 'tech-drama', 'Technology fails and digital disasters', '#3b82f6'),
('Workplace Drama', 'workplace-drama', 'Office politics and professional chaos', '#ef4444'),
('Food Wars', 'food-wars', 'Culinary controversies and dining disasters', '#f97316'),
('Relationship Drama', 'relationship-drama', 'Love, loss, and interpersonal chaos', '#ec4899'),
('Internet Culture', 'internet-culture', 'Viral moments and digital phenomena', '#8b5cf6'),
('Social Media Fails', 'social-media-fails', 'When posts go horribly wrong', '#06b6d4'),
('Celebrity Chaos', 'celebrity-chaos', 'Famous people doing infamous things', '#f59e0b'),
('Travel Disasters', 'travel-disasters', 'Vacation nightmares and journey fails', '#10b981'),
('Family Drama', 'family-drama', 'Domestic disputes and generational chaos', '#f43f5e'),
('Educational Fails', 'educational-fails', 'Learning gone wrong', '#6366f1');

-- Enable Row Level Security on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for published posts
CREATE POLICY "Allow read access to published posts" ON posts
  FOR SELECT USING (status = 'published');

-- Create policy to allow insert for service role (for migrations)
CREATE POLICY "Allow insert for service role" ON posts
  FOR INSERT WITH CHECK (true);

-- Success message
SELECT 'Database reset complete! Ready for story migration.' as message;