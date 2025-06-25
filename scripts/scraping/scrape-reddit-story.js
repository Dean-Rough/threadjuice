#!/usr/bin/env node

/**
 * Reddit Story Scraper
 * Scrapes real Reddit posts and converts them to ThreadJuice stories
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (error) {
    console.error('Error loading .env.local:', error.message);
  }
}

loadEnvVars();

// Initialize Supabase
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Extract Reddit post ID from URL
 */
function extractPostId(url) {
  const match = url.match(/\/comments\/([a-z0-9]+)\//i);
  return match ? match[1] : null;
}

/**
 * Scrape Reddit post and comments using .json API
 */
async function scrapeRedditPost(url) {
  try {
    // Add .json to the URL
    const jsonUrl = url.replace(/\/?$/, '.json');

    console.log(`📖 Scraping Reddit post: ${url}`);

    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'ThreadJuice/1.0 (Content Aggregator)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();

    // First element is the post, second is comments
    const postData = data[0].data.children[0].data;
    const commentsData = data[1].data.children;

    return {
      post: parsePost(postData),
      comments: parseComments(commentsData),
    };
  } catch (error) {
    console.error('Error scraping Reddit:', error);
    throw error;
  }
}

/**
 * Parse Reddit post data
 */
function parsePost(postData) {
  const post = {
    id: postData.id,
    title: postData.title,
    author: postData.author,
    subreddit: postData.subreddit,
    content: postData.selftext || '',
    url: `https://reddit.com${postData.permalink}`,
    score: postData.score,
    numComments: postData.num_comments,
    created: new Date(postData.created_utc * 1000),
    media: {},
  };

  // Extract ALL media types
  post.media = {
    images: [],
    videos: [],
    gifs: [],
    externalLinks: [],
    embedUrls: [],
  };

  // Primary image from post
  if (postData.post_hint === 'image' && postData.url) {
    post.media.images.push({
      url: postData.url,
      type: 'primary',
      caption: postData.title,
    });
  }

  // Preview images (Reddit thumbnails and gallery)
  if (postData.preview?.images) {
    postData.preview.images.forEach(img => {
      const cleanUrl = img.source.url.replace(/&amp;/g, '&');
      if (!post.media.images.some(existing => existing.url === cleanUrl)) {
        post.media.images.push({
          url: cleanUrl,
          type: 'preview',
          width: img.source.width,
          height: img.source.height,
        });
      }
    });
  }

  // Gallery images (multiple images in one post)
  if (postData.media_metadata) {
    Object.values(postData.media_metadata).forEach(item => {
      if (item.s?.u) {
        const galleryUrl = item.s.u.replace(/&amp;/g, '&');
        post.media.images.push({
          url: galleryUrl,
          type: 'gallery',
          width: item.s.x,
          height: item.s.y,
        });
      }
    });
  }

  // Video content (Reddit native videos)
  if (postData.is_video && postData.media?.reddit_video) {
    post.media.videos.push({
      url: postData.media.reddit_video.fallback_url,
      type: 'reddit_video',
      duration: postData.media.reddit_video.duration,
      width: postData.media.reddit_video.width,
      height: postData.media.reddit_video.height,
    });
  }

  // GIFs and animated content
  if (postData.url && postData.url.match(/\.(gif|gifv)$/i)) {
    post.media.gifs.push({
      url: postData.url,
      type: 'gif',
    });
  }

  // External embeds (YouTube, TikTok, etc.)
  if (postData.media?.oembed) {
    post.media.embedUrls.push({
      url: postData.url,
      type: 'oembed',
      title: postData.media.oembed.title,
      provider: postData.media.oembed.provider_name,
      thumbnail: postData.media.oembed.thumbnail_url,
    });
  }

  // External links
  if (
    postData.url &&
    !postData.is_self &&
    !post.media.images.length &&
    !post.media.videos.length &&
    !post.media.gifs.length &&
    !post.media.embedUrls.length
  ) {
    post.media.externalLinks.push({
      url: postData.url,
      type: 'external',
      domain: new URL(postData.url).hostname,
    });
  }

  return post;
}

/**
 * Parse comments and sort by top and controversial
 */
function parseComments(commentsData) {
  const comments = [];

  commentsData.forEach(item => {
    if (
      item.kind === 't1' &&
      item.data.body &&
      item.data.body !== '[deleted]'
    ) {
      const comment = item.data;
      comments.push({
        id: comment.id,
        author: comment.author,
        body: comment.body,
        score: comment.score,
        created: new Date(comment.created_utc * 1000),
        edited: comment.edited,
        awards: comment.all_awardings?.length || 0,
        isOP: comment.is_submitter,
        controversiality: comment.controversiality || 0,
      });
    }
  });

  // Sort by score for top comments
  const topComments = [...comments]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Find most controversial (lowest score or highest controversiality)
  const controversialComment = [...comments].sort((a, b) => {
    // Prioritize negative scores, then controversiality flag
    if (a.score < 0 && b.score >= 0) return -1;
    if (b.score < 0 && a.score >= 0) return 1;
    if (a.score < 0 && b.score < 0) return a.score - b.score;
    return b.controversiality - a.controversiality || a.score - b.score;
  })[0];

  return {
    topComments,
    controversialComment,
    totalComments: comments.length,
  };
}

/**
 * Get controversial comments by fetching with controversial sort
 */
async function getControversialComments(url) {
  try {
    const jsonUrl = url.replace(/\/?$/, '.json?sort=controversial');

    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'ThreadJuice/1.0 (Content Aggregator)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const commentsData = data[1].data.children;

    // Get the most controversial comment
    const controversial = commentsData
      .filter(
        item =>
          item.kind === 't1' && item.data.body && item.data.body !== '[deleted]'
      )
      .map(item => ({
        author: item.data.author,
        body: item.data.body,
        score: item.data.score,
        controversiality: item.data.controversiality || 0,
      }))
      .filter(c => c.score < 10)[0]; // Focus on low-scored comments

    return controversial;
  } catch (error) {
    console.error('Error fetching controversial comments:', error);
    return null;
  }
}

/**
 * Convert Reddit post to ThreadJuice story format
 */
async function convertToStory(redditData) {
  const { post, comments } = redditData;

  // Try to get a better controversial comment
  const controversialComment =
    (await getControversialComments(post.url)) || comments.controversialComment;

  const story = {
    title: post.title,
    slug: createSlug(post.title),
    excerpt: post.content.slice(0, 200) + '...',
    category: mapSubredditToCategory(post.subreddit),
    status: 'published',
    trending: true,
    featured: false,
    author: 'Reddit Scraper',
    persona: {
      name: 'The Reddit Curator',
      avatar: '/assets/personas/reddit-curator.jpg',
      bio: 'Bringing you the best (and worst) of Reddit',
    },
    content: {
      sections: [],
    },
    imageUrl: post.media.images[0]?.url || '/assets/img/reddit-default.jpg',
    sourceUrl: post.url,
    sourceUsername: `u/${post.author}`,
    sourcePlatform: 'reddit',
    isScraped: true,
    viewCount: post.score * 10,
    upvoteCount: post.score,
    commentCount: post.numComments,
    tags: ['reddit', post.subreddit, 'viral'],
  };

  // Add sections
  const sections = [];

  // Hero section with post title
  sections.push({
    type: 'hero',
    content: `From r/${post.subreddit}: ${post.title}`,
    metadata: {
      author: post.author,
      subreddit: post.subreddit,
      score: post.score,
    },
  });

  // Original post content
  if (post.content) {
    sections.push({
      type: 'describe',
      title: 'The Original Post',
      content: post.content,
    });
  }

  // ALL Images from the post (including galleries)
  if (post.media.images && post.media.images.length > 0) {
    post.media.images.forEach((img, index) => {
      sections.push({
        type: 'image',
        content:
          img.type === 'gallery'
            ? `Image ${index + 1} from Reddit gallery`
            : 'Image from the original Reddit post',
        metadata: {
          image_url: img.url,
          attribution: `Posted by u/${post.author}`,
          source: post.url,
          width: img.width,
          height: img.height,
        },
      });
    });
  }

  // ALL Videos from the post
  if (post.media.videos && post.media.videos.length > 0) {
    post.media.videos.forEach(video => {
      sections.push({
        type: 'media_embed',
        content: '',
        metadata: {
          media: {
            type: 'video',
            embedUrl: video.url,
            title: 'Video from Reddit post',
            platform: 'Reddit',
            confidence: 1.0,
            duration: video.duration,
          },
        },
      });
    });
  }

  // GIFs from the post
  if (post.media.gifs && post.media.gifs.length > 0) {
    post.media.gifs.forEach(gif => {
      sections.push({
        type: 'reaction_gif',
        content: 'GIF from Reddit post',
        metadata: {
          gifUrl: gif.url,
        },
      });
    });
  }

  // External embeds (YouTube, TikTok, etc.)
  if (post.media.embedUrls && post.media.embedUrls.length > 0) {
    post.media.embedUrls.forEach(embed => {
      sections.push({
        type: 'media_embed',
        content: `${embed.provider} content linked in post`,
        metadata: {
          media: {
            type: 'embed',
            embedUrl: embed.url,
            title: embed.title,
            platform: embed.provider,
            confidence: 1.0,
            thumbnail: embed.thumbnail,
          },
        },
      });
    });
  }

  // External links
  if (post.media.externalLinks && post.media.externalLinks.length > 0) {
    post.media.externalLinks.forEach(link => {
      sections.push({
        type: 'story_link',
        content: `Original source: ${link.domain}`,
        metadata: {
          url: link.url,
          linkText: 'View Original Source',
        },
      });
    });
  }

  // Top comments section
  if (comments.topComments.length > 0) {
    sections.push({
      type: 'comments-1',
      title: 'Reddit Reacts',
      content: `The community had a lot to say about this one (${comments.totalComments} comments total):`,
      metadata: {
        platform: 'reddit',
        comments: comments.topComments.map(c => ({
          content: c.body,
          author: c.author,
          upvotes: c.score,
          awards: c.awards,
          timestamp: '2h ago',
          isOP: c.isOP,
        })),
      },
    });
  }

  // Controversial comment as rage bait
  if (
    controversialComment &&
    controversialComment.body !== comments.topComments[0]?.body
  ) {
    sections.push({
      type: 'pullquote',
      content: controversialComment.body,
      metadata: {
        author: `u/${controversialComment.author}`,
        context: `This controversial take got ${controversialComment.score} votes and sparked heated debate`,
      },
    });

    sections.push({
      type: 'terry_corner',
      title: "The Terry's Take",
      content:
        "Of course there's always one absolute weapon in the comments who has to make it weird. Never change, Reddit.",
    });
  }

  // Outro
  sections.push({
    type: 'outro',
    content: `This Reddit drama brought to you by r/${post.subreddit}. Got a spicy Reddit thread? We're probably already scraping it.`,
  });

  story.content.sections = sections;
  return story;
}

/**
 * Create URL-friendly slug
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
    .slice(0, 60);
}

/**
 * Map subreddit to ThreadJuice category
 */
function mapSubredditToCategory(subreddit) {
  const mappings = {
    AmItheAsshole: 'relationships',
    relationship_advice: 'relationships',
    tifu: 'life',
    antiwork: 'workplace',
    MaliciousCompliance: 'workplace',
    entitledparents: 'family',
    JUSTNOMIL: 'family',
    ChoosingBeggars: 'entitled',
    PublicFreakout: 'drama',
    facepalm: 'fails',
    insanepeoplefacebook: 'social-media',
    technology: 'technology',
    news: 'news',
    politics: 'politics',
  };

  return mappings[subreddit] || 'viral';
}

/**
 * Save story to database
 */
async function saveToDatabase(story) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        ...story,
        content: JSON.stringify(story.content),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const redditUrl = args[0];

  if (!redditUrl || !redditUrl.includes('reddit.com')) {
    console.error('❌ Please provide a Reddit post URL');
    console.log('Usage: npm run scrape:reddit <reddit-post-url>');
    process.exit(1);
  }

  try {
    // Scrape Reddit post
    const redditData = await scrapeRedditPost(redditUrl);
    console.log(`✅ Scraped post: "${redditData.post.title}"`);
    console.log(
      `💬 Found ${redditData.comments.topComments.length} top comments`
    );

    // Convert to story
    const story = await convertToStory(redditData);
    console.log(`📝 Converted to ThreadJuice story`);

    // Save to database
    const savedStory = await saveToDatabase(story);
    console.log(`✅ Saved to database: ${story.slug}`);
    console.log(
      `📊 Final stats: ${story.upvoteCount} upvotes, ${story.commentCount} comments`
    );
    console.log(`\n🎉 Story scraped successfully!`);
    console.log(`🔗 View at: http://localhost:4242/blog/${story.slug}`);
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
