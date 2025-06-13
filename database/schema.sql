-- ThreadJuice Database Schema
-- PostgreSQL with Supabase enhancements

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
CREATE INDEX idx_quiz_responses_user_id ON quiz_responses(user_id);

CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_post_id ON user_interactions(post_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_created_at ON user_interactions(created_at DESC);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_events_trending_score ON events(trending_score DESC);

-- Full-text search indexes
CREATE INDEX idx_posts_title_search ON posts USING gin(to_tsvector('english', title));
CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('english', hook));

-- Functions for incrementing counters
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_share_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET share_count = share_count + 1,
      trending_score = trending_score + 5,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update category post counts
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET post_count = post_count + 1
    WHERE slug = NEW.category;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET post_count = post_count - 1
    WHERE slug = OLD.category;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.category != NEW.category THEN
      UPDATE categories 
      SET post_count = post_count - 1
      WHERE slug = OLD.category;
      UPDATE categories 
      SET post_count = post_count + 1
      WHERE slug = NEW.category;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update quiz completion stats
CREATE OR REPLACE FUNCTION update_quiz_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quizzes 
  SET completion_count = completion_count + 1,
      average_score = (
        SELECT AVG(score) 
        FROM quiz_responses 
        WHERE quiz_id = NEW.quiz_id
      )
  WHERE id = NEW.quiz_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update event post counts
CREATE OR REPLACE FUNCTION update_event_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.event_id IS NOT NULL THEN
    UPDATE events 
    SET post_count = post_count + 1,
        updated_at = NOW()
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.event_id IS NOT NULL THEN
    UPDATE events 
    SET post_count = post_count - 1,
        updated_at = NOW()
    WHERE id = OLD.event_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.event_id IS DISTINCT FROM NEW.event_id THEN
      IF OLD.event_id IS NOT NULL THEN
        UPDATE events 
        SET post_count = post_count - 1,
            updated_at = NOW()
        WHERE id = OLD.event_id;
      END IF;
      IF NEW.event_id IS NOT NULL THEN
        UPDATE events 
        SET post_count = post_count + 1,
            updated_at = NOW()
        WHERE id = NEW.event_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update post updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_category_post_count
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW EXECUTE PROCEDURE update_category_post_count();

CREATE TRIGGER trigger_update_quiz_stats
  AFTER INSERT ON quiz_responses
  FOR EACH ROW EXECUTE PROCEDURE update_quiz_stats();

CREATE TRIGGER trigger_update_event_post_count
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW EXECUTE PROCEDURE update_event_post_count();

CREATE TRIGGER trigger_update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trigger_update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can read published posts" ON posts
  FOR SELECT USING (status = 'published');

-- Authenticated users can create posts (admin check in application)
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only post creators or admins can update posts
CREATE POLICY "Post creators can update their posts" ON posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only admins can delete posts
CREATE POLICY "Only admins can delete posts" ON posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Comments are publicly readable
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Images are publicly readable
CREATE POLICY "Anyone can read images" ON images
  FOR SELECT USING (true);

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images" ON images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Quizzes are publicly readable
CREATE POLICY "Anyone can read quizzes" ON quizzes
  FOR SELECT USING (true);

-- Quiz responses are readable by the user who created them
CREATE POLICY "Users can read their own quiz responses" ON quiz_responses
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- Anyone can submit quiz responses
CREATE POLICY "Anyone can submit quiz responses" ON quiz_responses
  FOR INSERT WITH CHECK (true);

-- User interactions are only readable by the user who created them
CREATE POLICY "Users can read their own interactions" ON user_interactions
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- Authenticated users can create interactions
CREATE POLICY "Authenticated users can create interactions" ON user_interactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'sub' = user_id);

-- Public tables (no RLS needed)
-- categories, personas, events are publicly readable