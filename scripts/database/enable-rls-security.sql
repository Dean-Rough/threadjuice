-- Enable Row Level Security on all public tables
-- This script addresses the security warnings from Supabase

-- 1. Enable RLS on all tables
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_crawler_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for read-only public access where appropriate

-- Categories - public read access
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Personas - public read access
CREATE POLICY "Personas are viewable by everyone" ON public.personas
  FOR SELECT USING (true);

-- Posts - public read access for published posts
CREATE POLICY "Published posts are viewable by everyone" ON public.posts
  FOR SELECT USING (status = 'published');

-- Comments - public read access
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

-- Images - public read access
CREATE POLICY "Images are viewable by everyone" ON public.images
  FOR SELECT USING (true);

-- Events - public read access
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

-- 3. Restrict write access to service role only (backend operations)

-- Performance metrics - service role only
CREATE POLICY "Service role can manage performance metrics" ON public.performance_metrics
  FOR ALL USING (auth.role() = 'service_role');

-- AI crawler logs - service role only
CREATE POLICY "Service role can manage AI crawler logs" ON public.ai_crawler_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Cache - service role only for writes
CREATE POLICY "Service role can manage cache" ON public.cache
  FOR ALL USING (auth.role() = 'service_role');

-- Newsletter subscribers - service role only (protect user data)
CREATE POLICY "Service role can manage newsletter subscribers" ON public.newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- User interactions - service role only for now
CREATE POLICY "Service role can manage user interactions" ON public.user_interactions
  FOR ALL USING (auth.role() = 'service_role');

-- Quizzes - service role only for writes
CREATE POLICY "Service role can manage quizzes" ON public.quizzes
  FOR ALL USING (auth.role() = 'service_role');

-- Quiz responses - service role only
CREATE POLICY "Service role can manage quiz responses" ON public.quiz_responses
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Allow anonymous users to create certain records

-- Allow anonymous users to create comments
CREATE POLICY "Anyone can create comments" ON public.comments
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to record interactions (views, etc)
CREATE POLICY "Anyone can record interactions" ON public.user_interactions
  FOR INSERT WITH CHECK (true);

-- Note: You can add more granular policies later based on your auth setup
-- For example, if you implement user authentication:
-- CREATE POLICY "Users can edit their own comments" ON public.comments
--   FOR UPDATE USING (auth.uid() = user_id);

-- 5. Fix function search_path security warnings
-- Set explicit search_path for all functions to prevent search_path injection attacks

ALTER FUNCTION public.increment_view_count SET search_path = public, pg_catalog;
ALTER FUNCTION public.increment_share_count SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_category_post_count SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_quiz_stats SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_event_post_count SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_updated_at_column SET search_path = public, pg_catalog;

-- 6. Move pg_trgm extension out of public schema (for text search)
-- First create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to postgres and service roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move the extension (this will recreate it in the new schema)
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION pg_trgm SCHEMA extensions;

-- Update any functions or indexes that use pg_trgm to reference the new schema
-- You may need to update your text search queries to use extensions.pg_trgm operators