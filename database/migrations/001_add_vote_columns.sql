-- Add vote columns to posts table
ALTER TABLE posts 
ADD COLUMN upvote_count INTEGER DEFAULT 0,
ADD COLUMN downvote_count INTEGER DEFAULT 0;

-- Add indexes for performance
CREATE INDEX idx_posts_upvote_count ON posts(upvote_count DESC);
CREATE INDEX idx_posts_downvote_count ON posts(downvote_count DESC);

-- Update existing posts to have 0 votes
UPDATE posts 
SET upvote_count = 0, 
    downvote_count = 0 
WHERE upvote_count IS NULL 
   OR downvote_count IS NULL;

-- Add missing columns to user_interactions table
ALTER TABLE user_interactions
ADD COLUMN ip_address TEXT,
ADD COLUMN user_agent TEXT;