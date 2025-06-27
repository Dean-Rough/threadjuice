-- Add performance tracking columns to posts table
DO $$ 
BEGIN
  -- Add view velocity column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'view_velocity') THEN
    ALTER TABLE posts ADD COLUMN view_velocity DECIMAL(10,2) DEFAULT 0;
  END IF;

  -- Add engagement rate column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'engagement_rate') THEN
    ALTER TABLE posts ADD COLUMN engagement_rate DECIMAL(5,4) DEFAULT 0;
  END IF;

  -- Add viral potential column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'viral_potential') THEN
    ALTER TABLE posts ADD COLUMN viral_potential INTEGER DEFAULT 0;
  END IF;

  -- Add AI search hits tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'ai_search_hits') THEN
    ALTER TABLE posts ADD COLUMN ai_search_hits JSONB DEFAULT '{}';
  END IF;

  -- Add boosting columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'boosted') THEN
    ALTER TABLE posts ADD COLUMN boosted BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'boost_multiplier') THEN
    ALTER TABLE posts ADD COLUMN boost_multiplier DECIMAL(3,1) DEFAULT 1.0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'boosted_at') THEN
    ALTER TABLE posts ADD COLUMN boosted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add performance tracking timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'performance_updated_at') THEN
    ALTER TABLE posts ADD COLUMN performance_updated_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_load_time DECIMAL(10,2),
  time_to_interactive DECIMAL(10,2),
  first_contentful_paint DECIMAL(10,2),
  largest_contentful_paint DECIMAL(10,2),
  cumulative_layout_shift DECIMAL(5,3),
  first_input_delay DECIMAL(10,2),
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI crawler logs table
CREATE TABLE IF NOT EXISTS ai_crawler_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  source VARCHAR(50),
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cache table for temporary data
CREATE TABLE IF NOT EXISTS cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_viral_potential ON posts(viral_potential DESC);
CREATE INDEX IF NOT EXISTS idx_posts_view_velocity ON posts(view_velocity DESC);
CREATE INDEX IF NOT EXISTS idx_posts_boosted ON posts(boosted) WHERE boosted = true;
CREATE INDEX IF NOT EXISTS idx_ai_crawler_logs_post_id ON ai_crawler_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);

-- Add comment to describe the migration
COMMENT ON TABLE performance_metrics IS 'Tracks Core Web Vitals and performance metrics';
COMMENT ON TABLE ai_crawler_logs IS 'Logs visits from AI search engine crawlers';
COMMENT ON TABLE cache IS 'Temporary cache storage with expiration';
COMMENT ON COLUMN posts.viral_potential IS 'Calculated score (0-100) indicating viral potential';
COMMENT ON COLUMN posts.ai_search_hits IS 'JSON tracking hits from different AI search engines';