-- Migration: Add author column to posts table
-- This fixes the schema mismatch between Prisma and Supabase

-- Add the author column to posts table
ALTER TABLE posts 
ADD COLUMN author TEXT;

-- Update existing posts to have a default author value
-- Using the persona name if available, otherwise 'ThreadJuice'
UPDATE posts 
SET author = COALESCE(
    (SELECT name FROM personas WHERE personas.id = posts.persona_id),
    'ThreadJuice'
)
WHERE author IS NULL;

-- Make the column NOT NULL after populating existing rows
ALTER TABLE posts 
ALTER COLUMN author SET NOT NULL;

-- Create index to match Prisma schema
CREATE INDEX idx_posts_author ON posts(author);

-- Add a comment explaining the column
COMMENT ON COLUMN posts.author IS 'Author name for the post, can be different from persona';