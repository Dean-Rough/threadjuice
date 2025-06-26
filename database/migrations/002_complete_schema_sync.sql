-- Complete schema synchronization migration
-- This ensures all required columns exist for ThreadJuice production

-- 1. Add author column to posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'author') THEN
    ALTER TABLE posts ADD COLUMN author TEXT;
    
    -- Populate with persona name or default
    UPDATE posts 
    SET author = COALESCE(
        (SELECT name FROM personas WHERE personas.id = posts.persona_id),
        'ThreadJuice'
    )
    WHERE author IS NULL;
    
    -- Make NOT NULL after populating
    ALTER TABLE posts ALTER COLUMN author SET NOT NULL;
    
    -- Create index
    CREATE INDEX idx_posts_author ON posts(author);
  END IF;
END $$;

-- 2. Add vote columns to posts if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'upvote_count') THEN
    ALTER TABLE posts ADD COLUMN upvote_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'downvote_count') THEN
    ALTER TABLE posts ADD COLUMN downvote_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Create indexes for vote columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE tablename = 'posts' AND indexname = 'idx_posts_upvote_count') THEN
    CREATE INDEX idx_posts_upvote_count ON posts(upvote_count DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE tablename = 'posts' AND indexname = 'idx_posts_downvote_count') THEN
    CREATE INDEX idx_posts_downvote_count ON posts(downvote_count DESC);
  END IF;
END $$;

-- 4. Add tracking columns to user_interactions if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_interactions' AND column_name = 'ip_address') THEN
    ALTER TABLE user_interactions ADD COLUMN ip_address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_interactions' AND column_name = 'user_agent') THEN
    ALTER TABLE user_interactions ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- 5. Add bookmark_count to posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'bookmark_count') THEN
    ALTER TABLE posts ADD COLUMN bookmark_count INTEGER DEFAULT 0;
    CREATE INDEX idx_posts_bookmark_count ON posts(bookmark_count DESC);
  END IF;
END $$;

-- 6. Add comment_count to posts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'comment_count') THEN
    ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
    
    -- Update counts based on existing comments
    UPDATE posts 
    SET comment_count = (
      SELECT COUNT(*) 
      FROM comments 
      WHERE comments.post_id = posts.id
    );
  END IF;
END $$;

-- 7. Add newsletter_subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id TEXT,
  status TEXT DEFAULT 'active',
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for newsletter_subscribers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE tablename = 'newsletter_subscribers' AND indexname = 'idx_newsletter_email') THEN
    CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE tablename = 'newsletter_subscribers' AND indexname = 'idx_newsletter_status') THEN
    CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);
  END IF;
END $$;

-- 8. Update existing NULL values to defaults
UPDATE posts SET upvote_count = 0 WHERE upvote_count IS NULL;
UPDATE posts SET downvote_count = 0 WHERE downvote_count IS NULL;
UPDATE posts SET bookmark_count = 0 WHERE bookmark_count IS NULL;
UPDATE posts SET comment_count = 0 WHERE comment_count IS NULL;

-- 9. Add comments on columns for documentation
COMMENT ON COLUMN posts.author IS 'Author name for the post, can be different from persona';
COMMENT ON COLUMN posts.upvote_count IS 'Number of upvotes/likes on the post';
COMMENT ON COLUMN posts.downvote_count IS 'Number of downvotes on the post';
COMMENT ON COLUMN posts.bookmark_count IS 'Number of times post has been bookmarked';
COMMENT ON COLUMN posts.comment_count IS 'Cached count of comments on the post';

-- Report completion
DO $$
BEGIN
  RAISE NOTICE 'Schema synchronization complete!';
  RAISE NOTICE 'All required columns and tables are now in place.';
END $$;