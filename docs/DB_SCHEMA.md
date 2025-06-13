# Database Schema (PostgreSQL)

```sql
-- personas
CREATE TABLE personas (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  avatar_url TEXT NOT NULL,
  tone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT UNIQUE NOT NULL,
  summary TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hook TEXT,
  content JSONB,                   -- structured article blocks
  persona_id INT REFERENCES personas(id),
  status TEXT DEFAULT 'published', -- draft | published | archived
  event_id UUID REFERENCES events(id),
  reddit_thread_id TEXT,
  subreddit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- comments (Reddit excerpts)
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT,
  body TEXT,
  score INT,
  sentiment JSONB,                 -- {compound, pos, neg}
  reddit_comment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- images
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  license_type TEXT,
  credit_text TEXT,
  source_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB,                 -- [{q, options:[{a, resultKey}]}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- quiz_results
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id TEXT,                    -- Clerk user ID (optional)
  answers JSONB,
  result_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Seed Data
```sql
INSERT INTO personas (name, avatar_url, tone) VALUES
('The Snarky Sage', '/avatars/snarky-sage.png', 'sarcastic and deadpan'),
('The Down-to-Earth Buddy', '/avatars/buddy.png', 'chill and friendly'),
('The Dry Cynic', '/avatars/cynic.png', 'bitterly hilarious, loves chaos');
```

## Indexes
```sql
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_event_id ON posts(event_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
``` 