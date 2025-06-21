# Database Schema (PostgreSQL)

## Core Tables

### Posts

Main content table for viral stories and articles.

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,                        -- Brief description for cards
  content JSONB,                       -- structured article content
  image_url TEXT,                      -- main article image
  category TEXT NOT NULL,              -- viral, trending, funny, etc.
  author TEXT NOT NULL,                -- persona name
  persona_id INT REFERENCES personas(id),
  status TEXT DEFAULT 'published',     -- draft | published | archived
  view_count INT DEFAULT 0,
  upvote_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  bookmark_count INT DEFAULT 0,
  trending BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  reddit_thread_id TEXT,              -- source Reddit thread
  subreddit TEXT,                      -- source subreddit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Personas

Writer personas with distinct voices and styles.

```sql
CREATE TABLE personas (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,           -- URL-friendly version
  avatar_url TEXT NOT NULL,
  tone TEXT NOT NULL,                  -- voice description
  bio TEXT,                            -- persona bio
  story_count INT DEFAULT 0,           -- total stories written
  rating DECIMAL(2,1) DEFAULT 0.0,    -- average rating
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Categories

Content categorization system.

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,           -- URL-friendly version
  description TEXT,
  color TEXT DEFAULT '#f97316',       -- orange theme
  post_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### User Interactions

Tracking user engagement with content.

```sql
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,                        -- Anonymous or authenticated user
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,      -- upvote | downvote | bookmark | share | view
  metadata JSONB,                      -- additional data (share platform, etc.)
  ip_address INET,                     -- for anonymous tracking
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Comments

User comments and Reddit comment excerpts.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id), -- for threading
  user_id TEXT,                        -- authenticated user or null
  author_name TEXT,                    -- display name
  content TEXT NOT NULL,
  upvote_count INT DEFAULT 0,
  downvote_count INT DEFAULT 0,
  is_reddit_excerpt BOOLEAN DEFAULT false,
  reddit_comment_id TEXT,              -- if from Reddit
  reddit_score INT,                    -- original Reddit score
  status TEXT DEFAULT 'active',       -- active | hidden | deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Images

Image assets with proper attribution.

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  license_type TEXT,                   -- CC, Unsplash, etc.
  author TEXT,                         -- image creator
  source_name TEXT,                    -- Unsplash, Wikimedia, etc.
  source_url TEXT,                     -- original source link
  width INT,
  height INT,
  file_size INT,                       -- bytes
  position TEXT DEFAULT 'main',       -- main | inline | gallery
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tags

Flexible tagging system.

```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

### Analytics

Performance tracking and metrics.

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,           -- page_view | click | interaction
  entity_type TEXT,                   -- post | category | author
  entity_id TEXT,                     -- UUID or slug
  user_id TEXT,                       -- anonymous or authenticated
  session_id TEXT,
  metadata JSONB,                     -- event-specific data
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Seed Data

### Default Personas

```sql
INSERT INTO personas (name, slug, avatar_url, tone, bio, story_count, rating) VALUES
('The Snarky Sage', 'the-snarky-sage', '/assets/img/avatars/snarky-sage.png',
 'Sarcastic and deadpan with a love for chaos',
 'The Snarky Sage delivers Reddit''s most entertaining drama with a side of brutal honesty. Professional chaos observer and part-time life coach for people who probably shouldn''t take advice.',
 127, 4.8),
('The Down-to-Earth Buddy', 'the-down-to-earth-buddy', '/assets/img/avatars/buddy.png',
 'Chill and friendly with relatable insights',
 'Your internet best friend who always knows how to make sense of the chaos. Serves up viral content with a side of wisdom and zero judgment.',
 89, 4.6),
('The Dry Cynic', 'the-dry-cynic', '/assets/img/avatars/cynic.png',
 'Bitterly hilarious with a chaos-loving perspective',
 'Finds humor in humanity''s daily disasters and serves it with a perfectly dry martini of sarcasm. Believes the internet was invented specifically for entertainment.',
 156, 4.9);
```

### Default Categories

```sql
INSERT INTO categories (name, slug, description, post_count) VALUES
('AITA', 'aita', 'Am I The Asshole stories and moral dilemmas', 45),
('Revenge', 'revenge', 'Petty and pro revenge stories', 32),
('Funny', 'funny', 'Hilarious fails and viral moments', 67),
('News', 'news', 'Current events with a viral twist', 23),
('Relationships', 'relationships', 'Dating disasters and relationship drama', 41),
('Work Stories', 'work-stories', 'Office drama and workplace chaos', 28),
('Malicious Compliance', 'malicious-compliance', 'Following rules to absurd perfection', 19),
('TikTok Fails', 'tiktok-fails', 'Social media gone wrong', 34),
('Roommate Drama', 'roommate-drama', 'Living situation nightmares', 15),
('Food Fails', 'food-fails', 'Culinary disasters and kitchen chaos', 22);
```

### Default Tags

```sql
INSERT INTO tags (name, slug, usage_count) VALUES
('reddit', 'reddit', 150),
('viral', 'viral', 89),
('drama', 'drama', 67),
('fail', 'fail', 45),
('wholesome', 'wholesome', 23),
('cringe', 'cringe', 34),
('justice', 'justice', 28),
('chaos', 'chaos', 41),
('awkward', 'awkward', 19),
('satisfying', 'satisfying', 32);
```

## Indexes

### Performance Indexes

```sql
-- Core performance indexes
CREATE INDEX idx_posts_status_created ON posts(status, created_at DESC);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_author ON posts(author);
CREATE INDEX idx_posts_trending ON posts(trending, created_at DESC);
CREATE INDEX idx_posts_featured ON posts(featured, created_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);

-- User interaction indexes
CREATE INDEX idx_interactions_post_type ON user_interactions(post_id, interaction_type);
CREATE INDEX idx_interactions_user ON user_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_anonymous ON user_interactions(ip_address, created_at DESC);

-- Comment system indexes
CREATE INDEX idx_comments_post ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id, created_at DESC);

-- Category and tag indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- Analytics indexes
CREATE INDEX idx_analytics_type_date ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_entity ON analytics_events(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_analytics_user ON analytics_events(user_id, created_at DESC);
```

### Full-Text Search

```sql
-- Full-text search for posts
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '')));

-- Full-text search for comments
CREATE INDEX idx_comments_search ON comments USING gin(to_tsvector('english', content));
```

## Views

### Popular Content View

```sql
CREATE VIEW popular_posts AS
SELECT
  p.*,
  (p.upvote_count * 2 + p.comment_count + p.share_count) as engagement_score
FROM posts p
WHERE p.status = 'published'
ORDER BY engagement_score DESC;
```

### Category Stats View

```sql
CREATE VIEW category_stats AS
SELECT
  c.name,
  c.slug,
  COUNT(p.id) as post_count,
  SUM(p.view_count) as total_views,
  AVG(p.upvote_count) as avg_upvotes
FROM categories c
LEFT JOIN posts p ON p.category = c.slug
WHERE p.status = 'published' OR p.status IS NULL
GROUP BY c.id, c.name, c.slug;
```

## Functions

### Update Post Stats

```sql
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update post interaction counts
  UPDATE posts SET
    upvote_count = (
      SELECT COUNT(*) FROM user_interactions
      WHERE post_id = NEW.post_id AND interaction_type = 'upvote'
    ),
    share_count = (
      SELECT COUNT(*) FROM user_interactions
      WHERE post_id = NEW.post_id AND interaction_type = 'share'
    ),
    bookmark_count = (
      SELECT COUNT(*) FROM user_interactions
      WHERE post_id = NEW.post_id AND interaction_type = 'bookmark'
    ),
    updated_at = NOW()
  WHERE id = NEW.post_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_stats
  AFTER INSERT OR DELETE ON user_interactions
  FOR EACH ROW EXECUTE FUNCTION update_post_stats();
```

This schema supports the complete ThreadJuice viral content platform with user engagement tracking, content management, and analytics capabilities.
