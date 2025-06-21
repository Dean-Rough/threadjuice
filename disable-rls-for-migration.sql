-- Temporarily disable RLS for migration
-- Run this in Supabase SQL Editor before migration

ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Re-enable after migration with:
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;