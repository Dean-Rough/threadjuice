-- ThreadJuice Seed Data
-- Initial data for personas, categories, and sample content

-- Insert default personas
INSERT INTO personas (name, avatar_url, tone, style_preferences, target_audience, content_focus) VALUES
(
  'The Snarky Sage',
  '/avatars/snarky-sage.png',
  'sarcastic',
  '{"layout_preference": 1, "content_style": "witty", "emoji_usage": false, "header_style": 1}',
  'Millennials and Gen Z who appreciate dry humor',
  ARRAY['reddit-drama', 'social-commentary', 'internet-culture']
),
(
  'The Down-to-Earth Buddy',
  '/avatars/buddy.png',
  'friendly',
  '{"layout_preference": 2, "content_style": "conversational", "emoji_usage": true, "header_style": 2}',
  'General audience looking for relatable content',
  ARRAY['lifestyle', 'advice', 'wholesome-stories', 'community']
),
(
  'The Dry Cynic',
  '/avatars/cynic.png',
  'cynical',
  '{"layout_preference": 3, "content_style": "deadpan", "emoji_usage": false, "header_style": 4}',
  'Adults who enjoy dark humor and skeptical takes',
  ARRAY['politics', 'corporate-fails', 'society-critique', 'chaos']
);

-- Insert default categories
INSERT INTO categories (name, slug, description, color, icon) VALUES
('TIFU', 'tifu', 'Today I F***ed Up stories from Reddit', '#FF6B6B', 'face-palm'),
('AITA', 'aita', 'Am I The A**hole relationship and social dilemmas', '#4ECDC4', 'question-circle'),
('Public Freakouts', 'public-freakouts', 'Viral moments and public meltdowns', '#45B7D1', 'exclamation-triangle'),
('Relationship Drama', 'relationship-drama', 'Dating disasters and relationship chaos', '#F7DC6F', 'heart-broken'),
('Work Stories', 'work-stories', 'Workplace drama and corporate comedy', '#BB8FCE', 'briefcase'),
('Internet Culture', 'internet-culture', 'Memes, trends, and online phenomena', '#85C1E9', 'globe'),
('Tech Fails', 'tech-fails', 'Technology disasters and digital drama', '#82E0AA', 'bug'),
('Life Hacks', 'life-hacks', 'Useful tips and unexpected solutions', '#F8C471', 'lightbulb'),
('Conspiracy Theories', 'conspiracy-theories', 'Wild theories and internet mysteries', '#D7BDE2', 'eye'),
('Wholesome', 'wholesome', 'Feel-good stories and positive content', '#A9DFBF', 'heart');

-- Insert a sample event
INSERT INTO events (title, description, category, trending_score, metadata) VALUES
(
  'The Great GameStop Saga',
  'The complete story of retail investors vs Wall Street',
  'finance',
  95,
  '{"keywords": ["gamestop", "wallstreetbets", "stocks"], "related_topics": ["trading", "reddit", "finance"], "source_threads": ["gme_thread_1", "wsb_discussion"]}'
);

-- Insert sample posts
INSERT INTO posts (
  title,
  slug,
  hook,
  content,
  persona_id,
  status,
  category,
  layout_style,
  featured,
  trending_score,
  reddit_thread_id,
  subreddit,
  seo_title,
  seo_description,
  featured_image
) VALUES
(
  'Redditor Accidentally Becomes Crypto Millionaire While Trying to Buy Pizza',
  'redditor-crypto-millionaire-pizza',
  'What started as a late-night pizza craving turned into a life-changing financial mistake that somehow worked out perfectly.',
  '[
    {
      "type": "paragraph",
      "content": "So there I was, 2 AM, absolutely starving and craving some greasy pizza. My usual delivery app was down, so I decided to try this new place that only accepted Bitcoin payments. Seemed legit, right?"
    },
    {
      "type": "comment_cluster",
      "content": "The real kicker is when OP realizes they put in the wrong amount...",
      "metadata": {
        "source": "reddit",
        "author": "u/cryptoexpert2021",
        "score": 1247,
        "sentiment": 0.8
      }
    },
    {
      "type": "paragraph",
      "content": "Long story short, instead of sending $20 worth of Bitcoin, I accidentally sent $20 worth of some random altcoin I had forgotten about. The pizza place actually accepted it, but here''s the plot twist..."
    },
    {
      "type": "paragraph",
      "content": "That altcoin I randomly sent? It was DOGE. This was back in early 2021. You can probably guess where this is going."
    }
  ]',
  1,
  'published',
  'tifu',
  1,
  true,
  89,
  'tifu_crypto_pizza_123',
  'tifu',
  'Redditor Accidentally Becomes Crypto Millionaire | ThreadJuice',
  'A hilarious TIFU story about how a simple pizza order turned into cryptocurrency riches',
  '/images/crypto-pizza-hero.jpg'
),
(
  'AITA for Telling My Sister Her Instagram Life is Faker Than WWE?',
  'aita-sister-instagram-fake-wwe',
  'Family dinner got awkward when I called out my sister''s heavily filtered lifestyle posts. Now the whole family is picking sides.',
  '[
    {
      "type": "paragraph",
      "content": "My sister (28F) has been posting these incredibly elaborate Instagram stories about her \"amazing life\" - fancy restaurants, designer clothes, exotic vacations. Problem is, I (25M) live with her and know it''s all BS."
    },
    {
      "type": "comment_cluster",
      "content": "INFO: Does your sister actually have money for this lifestyle?",
      "metadata": {
        "source": "reddit",
        "author": "u/curious_commenter",
        "score": 892,
        "sentiment": 0.3
      }
    },
    {
      "type": "paragraph",
      "content": "She works part-time at a coffee shop and still asks mom for rent money. Those \"designer\" bags are from AliExpress, and that \"exotic vacation\" was literally our cousin''s backyard with heavy filters."
    }
  ]',
  2,
  'published',
  'aita',
  2,
  false,
  76,
  'aita_instagram_sister_456',
  'AmItheAsshole',
  'AITA: Sister''s Fake Instagram Life | ThreadJuice',
  'Reddit relationship drama about calling out fake social media lifestyle',
  '/images/instagram-drama-hero.jpg'
),
(
  'The Karen Who Demanded to Speak to the Manager of Gravity',
  'karen-manager-gravity-public-freakout',
  'A physics-defying public meltdown that had everyone questioning the laws of nature and customer service.',
  '[
    {
      "type": "paragraph",
      "content": "I witnessed peak Karen evolution today. This woman literally demanded to speak to the manager because her ice cream cone fell on the ground due to \"faulty gravity\" in the mall."
    },
    {
      "type": "comment_cluster",
      "content": "I''m sorry, she blamed GRAVITY? Like, the fundamental force of the universe?",
      "metadata": {
        "source": "reddit",
        "author": "u/physics_student",
        "score": 2156,
        "sentiment": 0.9
      }
    },
    {
      "type": "paragraph",
      "content": "She claimed the mall''s gravity was \"defective\" and demanded compensation for her $4 ice cream. When security explained that gravity is... you know... physics, she asked for corporate''s number to file a complaint against Isaac Newton."
    }
  ]',
  3,
  'published',
  'public-freakouts',
  3,
  false,
  94,
  'publicfreakout_gravity_karen_789',
  'PublicFreakout',
  'Karen vs. Gravity: The Ultimate Public Freakout | ThreadJuice',
  'Viral public freakout where a Karen literally tried to complain about gravity',
  '/images/gravity-karen-hero.jpg'
);

-- Insert sample comments for the first post
INSERT INTO comments (post_id, author, body, score, sentiment, reddit_comment_id, thread_level) 
SELECT 
  p.id,
  'u/pizzalover2021',
  'This is exactly why I stick to cash. Technology always finds a way to mess with your money.',
  156,
  '{"compound": 0.2, "pos": 0.1, "neg": 0.0, "neu": 0.9}',
  'comment_123',
  0
FROM posts p WHERE p.slug = 'redditor-crypto-millionaire-pizza';

INSERT INTO comments (post_id, author, body, score, sentiment, reddit_comment_id, thread_level)
SELECT 
  p.id,
  'u/cryptohodler',
  'Plot twist: the pizza place owner is now retired thanks to your accidental generosity!',
  89,
  '{"compound": 0.6, "pos": 0.4, "neg": 0.0, "neu": 0.6}',
  'comment_124',
  0
FROM posts p WHERE p.slug = 'redditor-crypto-millionaire-pizza';

-- Insert sample quiz for the crypto post
INSERT INTO quizzes (post_id, title, questions)
SELECT 
  p.id,
  'What Kind of Crypto Investor Are You?',
  '[
    {
      "question": "You accidentally send the wrong cryptocurrency. What do you do?",
      "options": [
        "Panic and try to reverse the transaction",
        "Shrug and hope for the best",
        "Research the coin you just sent",
        "Delete all crypto apps immediately"
      ],
      "correct": 2,
      "explanation": "Our pizza hero chose option B and got lucky, but researching is always the smart move!"
    },
    {
      "question": "What''s your ideal crypto investment strategy?",
      "options": [
        "HODL forever",
        "Day trading like a maniac",
        "Accidentally stumble into profits",
        "What''s crypto?"
      ],
      "correct": 0,
      "explanation": "HODLing (holding long-term) is generally the safest strategy for most investors."
    }
  ]'
FROM posts p WHERE p.slug = 'redditor-crypto-millionaire-pizza';

-- Insert sample images
INSERT INTO images (post_id, url, alt_text, license_type, author, credit_text, source_link)
SELECT 
  p.id,
  '/images/bitcoin-pizza-meme.jpg',
  'Bitcoin pizza meme illustrating crypto food purchases',
  'creative_commons',
  'Anonymous Memer',
  'Creative Commons BY-SA 4.0',
  'https://commons.wikimedia.org/wiki/File:Bitcoin_Pizza_Meme.jpg'
FROM posts p WHERE p.slug = 'redditor-crypto-millionaire-pizza';

-- Insert sample user interactions (for analytics)
INSERT INTO user_interactions (user_id, post_id, interaction_type, metadata)
SELECT 
  'user_sample_123',
  p.id,
  'view',
  '{"source": "homepage", "device": "mobile"}'
FROM posts p WHERE p.slug = 'redditor-crypto-millionaire-pizza';

INSERT INTO user_interactions (user_id, post_id, interaction_type, metadata)
SELECT 
  'user_sample_456',
  p.id,
  'share',
  '{"platform": "twitter", "source": "share_button"}'
FROM posts p WHERE p.slug = 'karen-manager-gravity-public-freakout';