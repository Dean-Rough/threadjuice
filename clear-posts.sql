-- Clear all posts from the database
DELETE FROM posts;

-- Reset the auto-increment counter if needed
-- ALTER SEQUENCE posts_id_seq RESTART WITH 1;

SELECT 'All posts cleared from database!' as message;