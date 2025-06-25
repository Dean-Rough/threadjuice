#!/usr/bin/env node

/**
 * ThreadJuice Unified Story Generator
 *
 * Consolidates all story generation functionality into one clean script
 * Replaces: generate-story.js, storygen-1.js, generate-full-automated-story.js
 * and all deprecated scripts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ApifyClient } from 'apify-client';
import fetch from 'node-fetch';
// Content moderation - inline for now to avoid TS import issues
const contentModerator = {
  moderateContent: (content) => {
    // Use word boundaries to avoid false positives
    const politicalTerms = ['\\btrump\\b', '\\bbiden\\b', '\\brepublican\\b', '\\bdemocrat\\b', '\\belection\\b', '\\bpolitics\\b', '\\bconservative\\b', '\\bliberal\\b'];
    const religiousTerms = ['\\bchristian\\b', '\\bmuslim\\b', '\\bjewish\\b', '\\breligious\\b', '\\bchurch\\b', '\\bmosque\\b', '\\btemple\\b'];
    const racialTerms = ['\\bracism\\b', '\\bracist\\b', '\\bwhite supremacy\\b', '\\bhate crime\\b']; // More specific racial terms
    
    const normalizedContent = content.toLowerCase();
    const blockedCategories = [];
    const flaggedTerms = [];
    
    for (const term of politicalTerms) {
      const regex = new RegExp(term, 'i');
      if (regex.test(normalizedContent)) {
        blockedCategories.push('political');
        flaggedTerms.push(term.replace(/\\b/g, ''));
        break;
      }
    }
    
    for (const term of religiousTerms) {
      const regex = new RegExp(term, 'i');
      if (regex.test(normalizedContent)) {
        blockedCategories.push('religious');
        flaggedTerms.push(term.replace(/\\b/g, ''));
        break;
      }
    }
    
    for (const term of racialTerms) {
      const regex = new RegExp(term, 'i');
      if (regex.test(normalizedContent)) {
        blockedCategories.push('racial');
        flaggedTerms.push(term.replace(/\\b/g, ''));
        break;
      }
    }
    
    return {
      isAllowed: blockedCategories.length === 0,
      blockedCategories,
      score: flaggedTerms.length * 10,
      flaggedTerms,
    };
  }
};

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
    // Use existing environment variables
  }
}

loadEnvVars();

// Initialize services (lazy loading)
let supabase;
let openai;
let imageServiceInstance;
let storyCounter = 0;

function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

// Simple Pexels integration
async function searchPexels(query) {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.log('❌ No Pexels API key found');
    return null;
  }

  try {
    console.log(`📸 Searching Pexels for: "${query}"`);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      {
        headers: {
          Authorization: pexelsApiKey,
        },
      }
    );

    if (!response.ok) {
      console.log(`❌ Pexels API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      console.log(`✅ Found ${data.photos.length} Pexels images`);
      const photo = data.photos[0];
      return {
        path: photo.src.large,
        description: photo.alt || `Photo by ${photo.photographer}`,
        source_name: 'Pexels',
        source_url: photo.url,
        author: photo.photographer,
        license_type: 'Pexels License',
      };
    }

    console.log('⚠️  No Pexels results found');
    return null;
  } catch (error) {
    console.error('❌ Pexels search failed:', error.message);
    return null;
  }
}

async function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment or .env.local');
    }
    const OpenAI = (await import('openai')).default;
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Configuration
const CONFIG = {
  models: {
    primary: 'gpt-4o',
    fallback: 'gpt-4o-mini',
  },
  personas: [
    {
      name: 'The Terry',
      slug: 'the-terry',
      bio: 'Acerbic, witty, and emotionally intelligent. Weaponises irritation for comedy while staying baffled by modern life.',
      avatar: '/assets/img/personas/the-terry.svg',
      tone: `Acerbic, funny, witty, overstimulated but emotionally intelligent. Hates things in a smart way—irritation weaponised for comedy. World-weary, hyper-observant, baffled by modern life. Mix sentence lengths like stand-up: Short. Clipped. Then suddenly long, winding, overflowing with rage or joy. Then a fragment. For punch. Use specificity for laughs, meta-commentary, sudden zoom-outs from minor gripes to society crumbling. Juxtaposition of formal phrasing with dumb topics. Occasionally refers to himself in third person as "The Terry" but use VERY sparingly.`,
    },
  ],
  categories: {
    politics: 'Political drama, government scandals, election controversies',
    sports: 'Athletic drama, team scandals, player controversies',
    technology: 'Tech failures, app disasters, AI mishaps',
    celebrity: 'Celebrity scandals, social media drama, PR disasters',
    business: 'Corporate scandals, startup failures, workplace drama',
    relationships: 'Dating disasters, marriage drama, family conflicts',
    workplace: 'Office politics, boss conflicts, coworker drama',
    education: 'School drama, university scandals, academic controversies',
    travel: 'Travel disasters, vacation drama, cultural incidents',
    food: 'Restaurant drama, cooking disasters, food trends',
    parenting: 'Parenting fails, school conflicts, family chaos',
    social: 'Social media drama, viral trends, community conflicts',
    health: 'Medical drama, fitness controversies, wellness scandals',
    environment: 'Climate incidents, conservation drama',
    gaming: 'Gaming controversies, esports drama, streamer incidents',
    legal: 'Court drama, legal battles, justice incidents',
    housing: 'Neighbor disputes, landlord drama, property conflicts',
    money: 'Financial scandals, investment drama, economic incidents',
  },
  imageLibrary: [
    {
      path: '/assets/img/lifestyle/life_style01.jpg',
      description: 'Person working on laptop in cafe',
      keywords: ['laptop', 'work', 'cafe', 'computer', 'online', 'typing'],
    },
    {
      path: '/assets/img/lifestyle/life_style02.jpg',
      description: 'Person looking stressed while checking phone',
      keywords: [
        'phone',
        'stressed',
        'mobile',
        'text',
        'messaging',
        'upset',
        'worried',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style03.jpg',
      description: 'Group of people having animated discussion',
      keywords: [
        'discussion',
        'argument',
        'meeting',
        'group',
        'conversation',
        'friends',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style04.jpg',
      description: 'Woman smiling while using phone',
      keywords: [
        'happy',
        'phone',
        'smiling',
        'success',
        'victory',
        'celebration',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style05.jpg',
      description: 'Person looking contemplative outdoors',
      keywords: [
        'thinking',
        'contemplative',
        'decision',
        'outdoor',
        'reflection',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style06.jpg',
      description: 'Couple having serious conversation',
      keywords: [
        'couple',
        'relationship',
        'serious',
        'dating',
        'confrontation',
      ],
    },
    {
      path: '/assets/img/lifestyle/life_style07.jpg',
      description: 'Person looking disappointed at restaurant',
      keywords: ['restaurant', 'date', 'disappointed', 'dining', 'food'],
    },
    {
      path: '/assets/img/blog/blog01.jpg',
      description: 'Professional meeting room scene',
      keywords: [
        'office',
        'meeting',
        'professional',
        'work',
        'business',
        'corporate',
      ],
    },
    {
      path: '/assets/img/blog/blog02.jpg',
      description: 'Person working late at office',
      keywords: ['office', 'late', 'overtime', 'work', 'tired', 'computer'],
    },
    {
      path: '/assets/img/blog/blog03.jpg',
      description: 'Frustrated person at desk',
      keywords: ['frustrated', 'work', 'stress', 'office', 'boss', 'annoyed'],
    },
    {
      path: '/assets/img/blog/blog04.jpg',
      description: 'Person with head in hands looking defeated',
      keywords: ['defeated', 'sad', 'overwhelmed', 'betrayed', 'emotional'],
    },
    {
      path: '/assets/img/lifestyle/life_style08.jpg',
      description: 'Two people in heated discussion',
      keywords: ['argument', 'conflict', 'heated', 'confrontation', 'anger'],
    },
    {
      path: '/assets/img/lifestyle/life_style09.jpg',
      description: 'Person celebrating with raised fists',
      keywords: [
        'victory',
        'celebration',
        'justice',
        'win',
        'success',
        'revenge',
      ],
    },
    {
      path: '/assets/img/blog/blog05.jpg',
      description: 'Confident person standing tall',
      keywords: ['confident', 'strong', 'justice', 'victory', 'empowered'],
    },
  ],
};

/**
 * Extract media from Reddit post
 */
function extractRedditMedia(post) {
  const media = {
    images: [],
    videos: [],
    galleries: [],
    embeds: [],
  };

  // Check for thumbnail (basic image)
  if (
    post.thumbnailUrl &&
    post.thumbnailUrl !== 'self' &&
    post.thumbnailUrl !== 'default'
  ) {
    media.images.push({
      url: post.thumbnailUrl,
      type: 'thumbnail',
      source: 'reddit',
    });
  }

  // Check for direct link (often an image)
  if (post.link && post.link !== post.url) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const videoExtensions = ['.mp4', '.webm', '.mov'];

    if (imageExtensions.some(ext => post.link.toLowerCase().includes(ext))) {
      media.images.push({
        url: post.link,
        type: 'direct',
        source: 'reddit',
      });
    } else if (
      videoExtensions.some(ext => post.link.toLowerCase().includes(ext))
    ) {
      media.videos.push({
        url: post.link,
        type: 'direct',
        source: 'reddit',
      });
    }
  }

  // Parse HTML content for embedded images
  if (post.html) {
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let match;
    while ((match = imgRegex.exec(post.html)) !== null) {
      const url = match[1].replace(/&amp;/g, '&');
      if (!media.images.some(img => img.url === url)) {
        media.images.push({
          url,
          type: 'embedded',
          source: 'reddit',
        });
      }
    }
  }

  // Check for Reddit video
  if (post.isVideo) {
    media.videos.push({
      url: post.url,
      type: 'reddit_video',
      source: 'reddit',
    });
  }

  return media;
}

/**
 * Extract media from OP comments
 */
function extractOPCommentMedia(post) {
  const opMedia = [];

  if (!post.topComments && !post.comments) return opMedia;

  const comments = post.topComments || post.comments || [];
  const opComments = comments.filter(
    c =>
      c.is_submitter ||
      c.isOP ||
      c.author === post.username ||
      c.username === post.username
  );

  opComments.forEach(comment => {
    const text = comment.body || comment.text || '';

    // Look for image URLs
    const imgRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/gi;
    const urls = text.match(imgRegex) || [];

    urls.forEach(url => {
      opMedia.push({
        url: url.replace(/&amp;/g, '&'),
        type: 'op_comment',
        source: 'reddit',
        context: text.slice(0, 100),
      });
    });

    // Look for imgur links
    const imgurRegex = /https?:\/\/(i\.)?imgur\.com\/[a-zA-Z0-9]+/gi;
    const imgurUrls = text.match(imgurRegex) || [];

    imgurUrls.forEach(url => {
      // Convert imgur URLs to direct image links
      const cleanUrl = url.replace('imgur.com', 'i.imgur.com');
      const imageUrl = cleanUrl.includes('.') ? cleanUrl : `${cleanUrl}.jpg`;

      opMedia.push({
        url: imageUrl,
        type: 'op_comment_imgur',
        source: 'reddit',
        context: text.slice(0, 100),
      });
    });
  });

  return opMedia;
}

/**
 * Segment Reddit post into readable chunks for interspersing
 */
function segmentRedditPost(post) {
  if (!post.body) return [];

  let content = post.body.trim();
  
  // Remove media URLs from the content to prevent them from showing as text
  // Common Reddit media URL patterns
  const mediaUrlPatterns = [
    /https?:\/\/preview\.redd\.it\/[^\s\n]+/g,
    /https?:\/\/i\.redd\.it\/[^\s\n]+/g,
    /https?:\/\/v\.redd\.it\/[^\s\n]+/g,
    /https?:\/\/reddit\.com\/media[^\s\n]+/g,
    /https?:\/\/external-preview\.redd\.it\/[^\s\n]+/g,
    /https?:\/\/[^\s\n]*\.(jpg|jpeg|png|gif|webp|mp4|webm)(\?[^\s\n]*)?/gi
  ];
  
  // Remove media URLs from content
  mediaUrlPatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  
  // Clean up extra whitespace left after removing URLs
  content = content.replace(/\n{3,}/g, '\n\n').trim();
  
  if (content.length < 200) {
    // If post is short, return as single segment
    return [content];
  }

  // Split by paragraphs first
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

  if (paragraphs.length <= 1) {
    // No paragraph breaks, split by sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const segments = [];
    let currentSegment = '';

    for (const sentence of sentences) {
      if (currentSegment.length + sentence.length > 400) {
        if (currentSegment) segments.push(currentSegment.trim() + '.');
        currentSegment = sentence;
      } else {
        currentSegment += sentence + '.';
      }
    }
    if (currentSegment) segments.push(currentSegment.trim());

    return segments.slice(0, 4); // Max 4 segments
  }

  // Group paragraphs into 2-4 segments
  const targetSegments = Math.min(
    4,
    Math.max(2, Math.ceil(paragraphs.length / 2))
  );
  const segmentSize = Math.ceil(paragraphs.length / targetSegments);
  const segments = [];

  for (let i = 0; i < paragraphs.length; i += segmentSize) {
    const segment = paragraphs.slice(i, i + segmentSize).join('\n\n');
    segments.push(segment);
  }

  return segments.slice(0, 4); // Max 4 segments
}

/**
 * Extract controversial comment from Reddit post
 */
function extractControversialComment(post) {
  if (!post.topComments && !post.comments) return null;

  const comments = post.topComments || post.comments || [];

  // Filter out OP comments and deleted comments
  const eligibleComments = comments.filter(
    c =>
      c.body &&
      c.body !== '[deleted]' &&
      c.body !== '[removed]' &&
      c.author !== post.username &&
      !c.is_submitter &&
      !c.isOP
  );

  if (eligibleComments.length === 0) return null;

  // Sort by most controversial (lowest score, or high score with many downvotes)
  const controversial = eligibleComments.sort((a, b) => {
    const scoreA = a.score || a.upVotes || 0;
    const scoreB = b.score || b.upVotes || 0;

    // Prioritize negative scores
    if (scoreA < 0 && scoreB >= 0) return -1;
    if (scoreB < 0 && scoreA >= 0) return 1;

    // For positive scores, prefer lower scores (more controversial)
    if (scoreA >= 0 && scoreB >= 0) return scoreA - scoreB;

    // For negative scores, prefer most negative
    return scoreA - scoreB;
  })[0];

  // Only return if it's actually controversial (negative or very low score)
  if (controversial && (controversial.score < 5 || controversial.upVotes < 5)) {
    return {
      body: controversial.body || controversial.text,
      author: controversial.author || controversial.username || 'deleted',
      score: controversial.score || controversial.upVotes || 0,
    };
  }

  return null;
}

/**
 * Get real Reddit content using direct Reddit API
 */
async function getRealRedditContent(subreddit = null) {
  try {
    // Pick a subreddit based on what we need - only light-hearted, non-political subs
    const subreddits = subreddit
      ? [subreddit]
      : [
          'ChoosingBeggars',  // Often has screenshot images
          'mildlyinfuriating',  // Often has photos
          'facepalm',  // Screenshots and images
          'AmItheAsshole',
          'relationship_advice',
          'tifu',
          'MaliciousCompliance',
          'entitledparents',
          'pettyrevenge',
          'TrueOffMyChest',
        ];

    const randomSubreddit =
      subreddits[Math.floor(Math.random() * subreddits.length)];

    console.log(`🔍 Fetching real content from r/${randomSubreddit}...`);

    // Fetch top posts from the subreddit
    const response = await fetch(
      `https://www.reddit.com/r/${randomSubreddit}/top.json?t=day&limit=10`,
      {
        headers: {
          'User-Agent': 'ThreadJuice/1.0 (Content Aggregator)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    const posts = data.data.children.filter(
      child => {
        const post = child.data;
        // Only posts with substantial content
        if (!post.selftext || post.selftext.length < 100) return false;
        
        // Content moderation check
        const contentToCheck = `${post.title} ${post.selftext}`;
        const moderationResult = contentModerator.moderateContent(contentToCheck);
        
        if (!moderationResult.isAllowed) {
          console.log(`🚫 Filtered out post: "${post.title.slice(0, 50)}" - ${moderationResult.blockedCategories.join(', ')}`);
          return false;
        }
        
        return true;
      }
    );

    if (posts.length === 0) {
      throw new Error('No suitable posts found after content filtering');
    }

    // Pick a random post from the results
    const postData = posts[Math.floor(Math.random() * posts.length)].data;

    // Now fetch the full post with comments
    const postUrl = `https://reddit.com${postData.permalink}`;
    const jsonUrl = postUrl.replace(/\/?$/, '.json');

    const fullResponse = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'ThreadJuice/1.0 (Content Aggregator)',
      },
    });

    if (!fullResponse.ok) {
      throw new Error(`Reddit API error: ${fullResponse.status}`);
    }

    const fullData = await fullResponse.json();
    const fullPostData = fullData[0].data.children[0].data;
    const commentsData = fullData[1].data.children;

    // Parse the post with our comprehensive media extraction
    const post = {
      id: fullPostData.id,
      title: fullPostData.title,
      body: fullPostData.selftext,
      username: fullPostData.author,
      parsedCommunityName: fullPostData.subreddit,
      url: `https://reddit.com${fullPostData.permalink}`,
      link: fullPostData.url,
      upVotes: fullPostData.score,
      score: fullPostData.score,
      numComments: fullPostData.num_comments,
      thumbnailUrl: fullPostData.thumbnail,
      isVideo: fullPostData.is_video,
      html: fullPostData.selftext_html,
      media: fullPostData.media,
      media_metadata: fullPostData.media_metadata,
      preview: fullPostData.preview,
      is_gallery: fullPostData.is_gallery,
      gallery_data: fullPostData.gallery_data,
    };

    // Parse comments for top and controversial
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
          username: comment.author,
          body: comment.body,
          text: comment.body,
          score: comment.score,
          is_submitter: comment.is_submitter,
          isOP: comment.is_submitter,
          controversiality: comment.controversiality || 0,
        });
      }
    });

    // Sort by score for top comments
    const topComments = [...comments]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    post.topComments = topComments;
    post.comments = topComments;

    console.log(
      `✅ Found real Reddit post: "${(post.title || 'Untitled').slice(0, 50)}..."`
    );

    // Extract all available media using our existing functions
    const extractedMedia = extractRedditMedia(post);
    const opCommentMedia = extractOPCommentMedia(post);

    // Extract controversial comment
    const controversialComment = extractControversialComment(post);

    // Segment the original post for interspersing
    const postSegments = segmentRedditPost(post);

    // Add extracted media, controversial comment, and segments to post object
    post.extractedMedia = {
      ...extractedMedia,
      opImages: opCommentMedia,
    };
    post.controversialComment = controversialComment;
    post.segments = postSegments;

    console.log(
      `📸 Found media: ${extractedMedia.images.length} images, ${extractedMedia.videos.length} videos, ${opCommentMedia.length} OP comment images`
    );
    console.log(
      `📖 Segmented post into ${postSegments.length} parts for interspersing`
    );
    console.log(
      `🗂️  Reddit data: subreddit=${post.parsedCommunityName}, author=${post.username}, score=${post.upVotes || post.score}`
    );
    if (controversialComment) {
      console.log(
        `🔥 Found controversial comment (${controversialComment.score} score)`
      );
    }

    return post;
  } catch (error) {
    console.log(`❌ Reddit API error: ${error.message}`);
    throw new Error('Failed to fetch real Reddit data');
  }
}

/**
 * Get real Twitter content using Twitter API v2
 */
async function getRealTwitterContent() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    throw new Error(
      'No TWITTER_BEARER_TOKEN found - cannot fetch real Twitter data'
    );
  }

  try {
    console.log(`🐦 Searching for viral Twitter content via API v2...`);

    // Import TwitterApi dynamically
    const { TwitterApi } = await import('twitter-api-v2');
    const client = new TwitterApi(bearerToken);

    // Search for viral tweets with minimal API calls
    // Note: Twitter API v2 doesn't support min_faves operator
    const searchQuery = 'viral -is:retweet lang:en';
    const tweets = await client.v2.search(searchQuery, {
      max_results: 10, // Keep it small to avoid rate limits
      'tweet.fields': [
        'author_id',
        'created_at',
        'public_metrics',
        'conversation_id',
      ],
      expansions: ['author_id'],
      'user.fields': ['name', 'username', 'verified'],
    });

    if (!tweets.data || tweets.data.data.length === 0) {
      throw new Error('No viral tweets found');
    }

    // Filter tweets for content moderation
    const filteredTweets = tweets.data.data.filter(tweet => {
      const moderationResult = contentModerator.moderateContent(tweet.text);
      
      if (!moderationResult.isAllowed) {
        console.log(`🚫 Filtered out tweet: "${tweet.text.slice(0, 50)}" - ${moderationResult.blockedCategories.join(', ')}`);
        return false;
      }
      
      return true;
    });

    if (filteredTweets.length === 0) {
      throw new Error('No suitable tweets found after content filtering');
    }

    // Pick the tweet with highest engagement from filtered results
    const sortedTweets = filteredTweets.sort((a, b) => {
      const aScore =
        (a.public_metrics?.like_count || 0) +
        (a.public_metrics?.retweet_count || 0);
      const bScore =
        (b.public_metrics?.like_count || 0) +
        (b.public_metrics?.retweet_count || 0);
      return bScore - aScore;
    });

    const bestTweet = sortedTweets[0];
    const author = tweets.includes?.users?.find(
      u => u.id === bestTweet.author_id
    );

    console.log(
      `✅ Found viral tweet with ${bestTweet.public_metrics.like_count} likes`
    );

    return {
      id: bestTweet.id,
      text: bestTweet.text,
      author: author?.username || 'unknown',
      username: author?.username || 'unknown',
      likes: bestTweet.public_metrics.like_count,
      retweets: bestTweet.public_metrics.retweet_count,
      url: `https://twitter.com/${author?.username || 'i'}/status/${bestTweet.id}`,
    };
  } catch (error) {
    console.log(`❌ Twitter API error: ${error.message}`);
    throw new Error(
      'Failed to fetch real Twitter data - API rate limit or error'
    );
  }
}

/**
 * Generate story content using OpenAI
 */
async function generateStoryContent(options = {}) {
  const category =
    options.category ||
    Object.keys(CONFIG.categories)[
      Math.floor(Math.random() * Object.keys(CONFIG.categories).length)
    ];
  const persona = options.persona || CONFIG.personas[0];

  // Every 50th story should be Twitter (to avoid rate limits)
  storyCounter++;
  let contentSource = options.source;
  if (!contentSource) {
    if (storyCounter % 50 === 0) {
      contentSource = 'twitter';
    } else {
      contentSource = 'reddit'; // No TikTok
    }
  }

  const platformStyles = {
    reddit:
      'Reddit post with authentic community feel, using subreddit-style language',
    twitter:
      'Twitter thread controversy with quote tweets, ratios, and viral screenshots',
  };

  // ALWAYS get real content - no AI generation allowed
  let realPost = null;
  let prompt = '';

  if (contentSource === 'reddit') {
    realPost = await getRealRedditContent();
    if (!realPost) {
      throw new Error('No real Reddit data available - cannot generate story');
    }
  } else if (contentSource === 'twitter') {
    try {
      realPost = await getRealTwitterContent();
      if (!realPost) {
        throw new Error('No real Twitter data available');
      }
    } catch (twitterError) {
      console.log('⚠️  Twitter API failed, falling back to Reddit...');
      contentSource = 'reddit'; // Fall back to Reddit
      realPost = await getRealRedditContent();
      if (!realPost) {
        throw new Error(
          'No real Reddit data available - cannot generate story'
        );
      }
    }
  }

  // Generate prompt based on final content source
  if (contentSource === 'reddit') {
    prompt = `Transform this REAL Reddit post into an engaging ThreadJuice story.

REAL REDDIT POST:
Title: ${realPost.title}
Subreddit: r/${realPost.parsedCommunityName || 'reddit'}
Author: u/${realPost.username || 'anonymous'}
Comments: ${realPost.numberOfComments || 0}

Body:
${(realPost.body || '').slice(0, 2000)}

Transform this into a dramatic multi-section story, expanding on the real content.`;
  } else if (contentSource === 'twitter') {
    prompt = `Transform this REAL Twitter thread/tweet into an engaging ThreadJuice story.

REAL TWEET:
Author: @${realPost.author || realPost.username || 'unknown'}
Likes: ${realPost.likes || 0}
Retweets: ${realPost.retweets || 0}

Content:
${(realPost.text || realPost.content || '').slice(0, 1000)}

${realPost.isThread ? 'This is part of a thread.' : 'Single tweet.'}

Transform this into a dramatic multi-section story about Twitter drama.`;
  }

  // Add persona and platform info to prompt
  prompt += `

Writer persona: ${persona.name} - ${persona.tone}

PLATFORM: ${contentSource.toUpperCase()} - ${platformStyles[contentSource]}

CRITICAL WRITING STYLE REQUIREMENTS:
- Write in THIRD PERSON throughout - never use "I", "me", "my"
- Refer to the story author as "the author", "OP", "our protagonist", "the writer", etc.
- TONGUE-IN-CHEEK CLICKBAIT title that's self-aware about being clickbait
- Each section should be 150-250 words (longer than typical)
- Total story: 1200-1800 words
- Section titles should be CREATIVE and SPECIFIC to the story - NOT generic like "The Setup"
- Vary sentence structure and paragraph length
- Include specific details, dialogue, and vivid descriptions
- Add unexpected twists and unique observations

MEDIA REFERENCES:
- When mentioning specific videos or tweets, add a media placeholder
- Format: [MEDIA: type="video/tweet" query="search terms" context="what it shows"]
- Examples:
  - "The CEO posted an apology video [MEDIA: type="video" query="CEO name apology 2024" context="emotional apology about layoffs"]"
  - "The tweet went viral [MEDIA: type="tweet" query="specific quote from tweet" context="ratio'd response about topic"]"
- If the story mentions TikTok, just reference it naturally without media embeds

${
  contentSource === 'twitter'
    ? 'TWITTER SPECIFIC: Include mentions of quote tweets, viral threads, being "ratioed", screenshots going viral, blue check drama'
    : 'REDDIT SPECIFIC: Include subreddit culture, upvotes, awards, cross-posting - DO NOT include "Edit: Thanks for the gold!" (ThreadJuice repackages content, not original Reddit user)'
}

Format as JSON with this structure (but with CREATIVE, STORY-SPECIFIC titles):
{
  "title": "Wildly specific clickbait title that hints at the absurdity",
  "excerpt": "2-3 sentence hook that creates intrigue without giving everything away",
  "sourceUrl": "${contentSource === 'reddit' ? 'https://reddit.com/r/AmItheAsshole/comments/xyz123' : 'https://twitter.com/user/status/123456789'}",
  "sourceUsername": "${contentSource === 'reddit' ? 'u/throwaway12345' : '@dramauser123'}",
  "sourcePlatform": "${contentSource}",
  "content": {
    "sections": [
      {
        "type": "describe-1",
        "content": "[150-250 words setting up the story. MUST include: 'Originally posted by [username] on [platform]' with specific subreddit/hashtag. NO TITLE for this first section]"
      },
      {
        "type": "describe-2", 
        "title": "[Specific title about what happens next]",
        "content": "[150-250 words developing the situation]"
      },
      {
        "type": "quotes",
        "content": "[Memorable quote that captures the absurdity]",
        "metadata": {
          "attribution": "[Specific person/username]",
          "context": "[When and why this was said]",
          "userUrl": "[Link to user profile - reddit.com/u/username or twitter.com/username]"
        }
      },
      {
        "type": "describe-3",
        "title": "[Title that hints at the twist/escalation]",
        "content": "[150-250 words of rising action]"
      },
      {
        "type": "describe-4",
        "title": "[Dramatic title for the peak moment]",
        "content": "[150-250 words of the main confrontation]"
      },
      {
        "type": "quotes",
        "content": "[Another memorable quote]",
        "metadata": {
          "attribution": "[Who said it]",
          "context": "[The moment this happened]",
          "userUrl": "[Link to user profile - reddit.com/u/username or twitter.com/username]"
        }
      },
      {
        "type": "describe-5",
        "title": "[Title about the unexpected resolution]",
        "content": "[150-250 words of how it resolved]"
      },
      {
        "type": "outro",
        "title": "[Witty title for the aftermath]",
        "content": "[150-250 words of reflection and current status]"
      }
    ]
  }
}`;

  try {
    const openai = await getOpenAI();
    const completion = await openai.chat.completions.create({
      model: CONFIG.models.primary,
      messages: [
        {
          role: 'system',
          content:
            'You are a viral content creator who writes engaging Reddit-style stories.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    let responseContent = completion.choices[0].message.content;

    // Clean up response
    if (responseContent.includes('```json')) {
      responseContent = responseContent
        .replace(/```json\n?/g, '')
        .replace(/\n?```/g, '');
    }

    const story = JSON.parse(responseContent);

    // Ensure story has required structure
    if (!story.content || !story.content.sections) {
      console.error('❌ Invalid story structure from AI');
      throw new Error('Invalid story format');
    }

    // Final content moderation check on generated story
    const storyToCheck = `${story.title} ${story.excerpt} ${story.content.sections.map(s => s.content).join(' ')}`;
    const finalModerationResult = contentModerator.moderateContent(storyToCheck);
    
    if (!finalModerationResult.isAllowed) {
      console.error('❌ Generated story failed content moderation:', finalModerationResult.blockedCategories.join(', '));
      console.error('📝 Story title:', story.title);
      console.error('🚫 Flagged terms:', finalModerationResult.flaggedTerms);
      throw new Error(`Story blocked for: ${finalModerationResult.blockedCategories.join(', ')}`);
    }
    
    console.log('✅ Story passed content moderation check');

    // Use real data if available
    if (options.realPost) {
      if (contentSource === 'reddit') {
        story.sourceUrl = options.realPost.url;
        story.sourceUsername = `u/${options.realPost.username || 'deleted'}`;
        story.sourcePlatform = 'reddit';

        // Update category based on actual subreddit
        const subredditMap = {
          AmItheAsshole: 'relationships',
          relationship_advice: 'relationships',
          tifu: 'life',
          antiwork: 'workplace',
          MaliciousCompliance: 'workplace',
        };
        const realCategory =
          subredditMap[options.realPost.parsedCommunityName] || category;

        return {
          ...story,
          category: realCategory,
          persona,
          contentSource,
          sourceUrl: story.sourceUrl,
          sourceUsername: story.sourceUsername,
          sourcePlatform: story.sourcePlatform || contentSource,
          isRealData: true,
        };
      } else if (contentSource === 'twitter') {
        story.sourceUrl = `https://twitter.com/${options.realPost.author || 'user'}/status/${options.realPost.id || '123'}`;
        story.sourceUsername = `@${options.realPost.author || options.realPost.username || 'unknown'}`;
        story.sourcePlatform = 'twitter';

        return {
          ...story,
          category,
          persona,
          contentSource,
          sourceUrl: story.sourceUrl,
          sourceUsername: story.sourceUsername,
          sourcePlatform: story.sourcePlatform || contentSource,
          isRealData: true,
        };
      }
    }

    return {
      ...story,
      category,
      persona,
      contentSource,
      sourceUrl: story.sourceUrl,
      sourceUsername: story.sourceUsername,
      sourcePlatform: story.sourcePlatform || contentSource,
      realPost: realPost,
    };
  } catch (error) {
    console.error('❌ Story generation failed:', error.message);
    throw error;
  }
}

/**
 * Extract key nouns from a title for image searches
 */
function extractKeyNouns(title) {
  // Common words to ignore - expanded list
  const stopWords = [
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'when',
    'where',
    'how',
    'why',
    'what',
    'becomes',
    'turns',
    'makes',
    'gets',
    'goes',
    'comes',
    'takes',
    'dramatic',
    'saga',
    'tale',
    'story',
    'bizarre',
    'wild',
    'epic',
    'incredible',
    'unbelievable',
    'shocking',
    'amazing',
    'crazy',
    'insane',
    'ultimate',
    'greatest',
    'worst',
    'best',
    'ever',
    'this',
    'that',
    'these',
    'those',
    'really',
    'very',
    'just',
    'great',
    'good',
    'bad',
    'new',
    'old',
    'big',
    'small',
    'little',
    'unveiled',
    'revealed',
    'discovered',
    'found',
    'turned',
    'changed',
  ];

  // Common compound terms to keep together - expanded
  const compoundTerms = {
    'hedge fund': 'finance investment',
    'social media': 'social media',
    'high school': 'school',
    'middle school': 'school',
    'real estate': 'property',
    'wall street': 'finance',
    'silicon valley': 'technology',
    'venture capital': 'business investment',
    'private equity': 'business finance',
    'artificial intelligence': 'AI technology',
    'machine learning': 'technology',
    'electric vehicle': 'electric car',
    'climate change': 'environment',
    'stock market': 'trading finance',
    'crypto currency': 'cryptocurrency',
    bitcoin: 'cryptocurrency',
    'video game': 'gaming',
    'tik tok': 'social media',
    'gen z': 'young people',
    'baby boomer': 'older people',
    millennial: 'millennial generation',
    'air fryer': 'kitchen appliance',
    'avocado toast': 'food brunch',
    'escape room': 'entertainment',
    'food truck': 'restaurant',
    'startup founder': 'entrepreneur',
    'tech bro': 'technology person',
    'wine mom': 'parent lifestyle',
    'gender reveal': 'party celebration',
    // Work-related compounds
    'job application': 'resume office',
    'resume attachment': 'resume document',
    'cover letter': 'job application',
    'job interview': 'interview office',
    'warehouse job': 'warehouse worker',
    'employment gap': 'resume unemployment',
    'severance package': 'office termination',
    'office drama': 'workplace conflict',
    'work from home': 'home office',
    'zoom meeting': 'video conference',
    // Relationship compounds
    'family text': 'phone message family',
    'group chat': 'phone messaging',
    'wake up call': 'morning alarm',
    'common sense': 'wisdom thinking',
    'reddit post': 'social media forum',
    'reddit rules': 'forum moderation',
  };

  // Check for compound terms first
  let lowerTitle = title.toLowerCase();
  let primaryConcept = null;
  let secondaryConcept = null;

  // Look for compound terms
  for (const [compound, replacement] of Object.entries(compoundTerms)) {
    if (lowerTitle.includes(compound)) {
      primaryConcept = replacement;
      // Remove the compound term from title for further processing
      lowerTitle = lowerTitle.replace(compound, '');
      break;
    }
  }

  // Extract meaningful words
  const words = lowerTitle
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));

  // Prioritize certain types of words for better image matching
  const priorityWords = {
    objects: [
      'resume',
      'attachment',
      'document',
      'email',
      'phone',
      'computer',
      'office',
      'desk',
      'warehouse',
      'job',
      'application',
      'letter',
      'package',
      'text',
      'message',
      'rules',
      'ticket',
      'birthday',
      'alphabet',
      'childhood',
      'misunderstanding',
      'conspiracy',
      'secret',
      'mystery',
    ],
    people: [
      'boss',
      'manager',
      'employee',
      'worker',
      'family',
      'mother',
      'father',
      'friend',
      'colleague',
      'neighbor',
      'teacher',
      'student',
      'child',
      'kid',
      'parent',
      'adult',
    ],
    places: [
      'office',
      'warehouse',
      'workplace',
      'home',
      'restaurant',
      'school',
      'hospital',
      'store',
      'airport',
      'classroom',
      'playground',
    ],
    concepts: [
      'interview',
      'meeting',
      'deadline',
      'vacation',
      'relationship',
      'friendship',
      'conflict',
      'drama',
      'education',
      'learning',
      'mistake',
      'confusion',
      'realization',
      'discovery',
    ],
  };

  // Find priority words in the title if not already found in compound terms

  if (!primaryConcept) {
    // Check for priority objects first
    for (const word of words) {
      if (priorityWords.objects.includes(word)) {
        primaryConcept = word;
        break;
      }
    }
  }

  if (!primaryConcept) {
    // Check for people
    for (const word of words) {
      if (priorityWords.people.includes(word)) {
        primaryConcept = word;
        break;
      }
    }
  }

  if (!primaryConcept) {
    // Check for places
    for (const word of words) {
      if (priorityWords.places.includes(word)) {
        primaryConcept = word;
        break;
      }
    }
  }

  // If still no primary concept, use the first non-stop word
  if (!primaryConcept) {
    primaryConcept = words[0] || 'lifestyle';
  }

  // Find secondary concept (different from primary)
  secondaryConcept =
    words.find(word => {
      return (
        word !== primaryConcept &&
        (priorityWords.objects.includes(word) ||
          priorityWords.people.includes(word) ||
          priorityWords.places.includes(word))
      );
    }) ||
    words.find(word => word !== primaryConcept) ||
    primaryConcept;

  return {
    what: primaryConcept,
    where: secondaryConcept,
    all: words,
  };
}

/**
 * Select images for a story (hero + inline)
 */
async function selectImagesForStory(story) {
  try {
    console.log(`🖼️  Finding images for: "${story.title}"`);

    // Check if we have Reddit media available
    if (story.realPost && story.realPost.extractedMedia) {
      const redditMedia = story.realPost.extractedMedia;
      console.log(
        `🎯 Checking Reddit media: ${redditMedia.images.length} images, ${redditMedia.opImages?.length || 0} OP images`
      );

      // Prioritize Reddit's own media
      let heroImage = null;
      let inlineImage = null;

      // Use direct/embedded images for hero if available
      const mainImages = redditMedia.images.filter(
        img => img.type !== 'thumbnail'
      );
      if (mainImages.length > 0) {
        heroImage = {
          path: mainImages[0].url,
          url: mainImages[0].url,
          description: `Image from Reddit post`,
          source_name: 'Reddit',
          source_url: story.realPost.url,
          author: story.realPost.username || 'Reddit user',
          license_type: 'Reddit Content',
          isRedditMedia: true,
        };
        console.log(`✅ Using Reddit image as hero: ${mainImages[0].url}`);
      }

      // Use OP comment images for inline if available
      if (redditMedia.opImages && redditMedia.opImages.length > 0) {
        inlineImage = {
          path: redditMedia.opImages[0].url,
          url: redditMedia.opImages[0].url,
          description: `OP provided this image in comments`,
          source_name: 'Reddit (OP Comment)',
          source_url: story.realPost.url,
          author: story.realPost.username || 'Reddit OP',
          license_type: 'Reddit Content',
          isRedditMedia: true,
          context: redditMedia.opImages[0].context,
        };
        console.log(
          `✅ Using OP comment image as inline: ${redditMedia.opImages[0].url}`
        );
      } else if (mainImages.length > 1) {
        // Use second Reddit image if available
        inlineImage = {
          path: mainImages[1].url,
          url: mainImages[1].url,
          description: `Additional image from Reddit post`,
          source_name: 'Reddit',
          source_url: story.realPost.url,
          author: story.realPost.username || 'Reddit user',
          license_type: 'Reddit Content',
          isRedditMedia: true,
        };
      }

      // If we have both images from Reddit, return them
      if (heroImage && inlineImage) {
        console.log(`🎉 Using all Reddit media - no stock photos needed!`);
        return { heroImage, inlineImage };
      }

      // Otherwise continue to search for missing images
      if (!heroImage || !inlineImage) {
        console.log(
          `📸 Need to supplement with stock photos: hero=${!!heroImage}, inline=${!!inlineImage}`
        );
      }
    }

    // Extract key concepts for Pexels search
    const concepts = extractKeyNouns(story.title);
    console.log(
      `📎 Key concepts - What: "${concepts.what}", Where: "${concepts.where}"`
    );

    // Enhanced category-specific search terms with multiple options
    const categorySearchTerms = {
      workplace: [
        'office work',
        'business meeting',
        'office desk',
        'corporate',
      ],
      relationships: [
        'couple relationship',
        'love romance',
        'dating',
        'marriage',
      ],
      technology: [
        'computer laptop',
        'technology digital',
        'coding programming',
        'tech',
      ],
      politics: ['government politics', 'politician', 'election', 'congress'],
      sports: ['sports athlete', 'sports competition', 'stadium', 'athletic'],
      celebrity: ['celebrity famous', 'red carpet', 'paparazzi', 'hollywood'],
      food: ['restaurant food', 'cooking kitchen', 'chef cuisine', 'dining'],
      parenting: [
        'family parents',
        'mother child',
        'parenting kids',
        'family home',
      ],
      travel: [
        'travel vacation',
        'airport journey',
        'tourist destination',
        'adventure',
      ],
      legal: ['courtroom lawyer', 'justice legal', 'law court', 'judge'],
      housing: ['house home', 'real estate', 'apartment living', 'residential'],
      education: [
        'classroom education',
        'school student',
        'teacher learning',
        'university',
      ],
      gaming: [
        'gaming video games',
        'gamer computer',
        'esports',
        'console gaming',
      ],
      health: ['medical health', 'doctor hospital', 'healthcare', 'wellness'],
      money: ['finance money', 'business finance', 'investment', 'banking'],
      social: [
        'social media',
        'online community',
        'internet culture',
        'viral content',
      ],
      life: ['lifestyle everyday', 'daily life', 'modern living', 'urban life'],
      family: [
        'family together',
        'family gathering',
        'relatives',
        'family drama',
      ],
      entitled: [
        'angry customer',
        'complaint demanding',
        'entitled person',
        'karen',
      ],
      fails: ['mistake fail', 'accident mishap', 'error problem', 'disaster'],
    };

    const categoryTerms = categorySearchTerms[story.category] || [
      'lifestyle',
      'people',
      'modern life',
    ];
    const categoryTerm = categoryTerms[0];

    // Improve search terms based on content
    let heroSearchTerm = concepts.what;

    // If the extracted concept is too generic, use category-specific term
    if (
      ['lifestyle', 'story', 'saga', 'tale', 'drama'].includes(concepts.what)
    ) {
      heroSearchTerm = categoryTerm;
    }

    // Search for hero image if we don't have one from Reddit
    let heroImage = story.realPost?.extractedMedia?.images?.[0]
      ? {
          path: story.realPost.extractedMedia.images[0].url,
          url: story.realPost.extractedMedia.images[0].url,
          description: `Image from Reddit post`,
          source_name: 'Reddit',
          source_url: story.realPost.url,
          author: story.realPost.username || 'Reddit user',
          license_type: 'Reddit Content',
          isRedditMedia: true,
        }
      : null;

    if (!heroImage) {
      console.log(`🎯 Searching Pexels for hero image: "${heroSearchTerm}"`);
      heroImage = await searchPexels(heroSearchTerm);

      if (!heroImage) {
        // Try with category context
        heroImage = await searchPexels(`${concepts.what} ${categoryTerm}`);
      }
    }

    // Search for inline image if we don't have one from Reddit
    let inlineImage = story.realPost?.extractedMedia?.opImages?.[0]
      ? {
          path: story.realPost.extractedMedia.opImages[0].url,
          url: story.realPost.extractedMedia.opImages[0].url,
          description: `OP provided this image`,
          source_name: 'Reddit (OP Comment)',
          source_url: story.realPost.url,
          author: story.realPost.username || 'Reddit OP',
          license_type: 'Reddit Content',
          isRedditMedia: true,
        }
      : null;

    if (!inlineImage) {
      console.log(
        `🎯 Searching Pexels for inline image: "${concepts.where}" or "${categoryTerm}"`
      );
      inlineImage = await searchPexels(
        concepts.where !== concepts.what ? concepts.where : categoryTerm
      );

      if (!inlineImage) {
        // Try broader category search
        inlineImage = await searchPexels(`${categoryTerm} ${story.category}`);
      }
    }

    // Fallback to stock photos if needed
    if (!heroImage) {
      console.log(`⚠️  Using fallback stock photo for hero image`);
      const fallbackImages = CONFIG.imageLibrary.filter(img =>
        img.keywords.some(keyword => story.category.includes(keyword))
      );
      heroImage = fallbackImages[0] || CONFIG.imageLibrary[0];
    }

    if (!inlineImage) {
      // Use different stock photo for inline
      const fallbackImages = CONFIG.imageLibrary.filter(img =>
        img.keywords.some(keyword => story.category.includes(keyword))
      );
      inlineImage =
        fallbackImages[1] || fallbackImages[0] || CONFIG.imageLibrary[1];
    }

    return { heroImage, inlineImage };
  } catch (error) {
    console.error('❌ Image selection failed:', error.message);

    // Ultimate fallback
    return {
      heroImage: CONFIG.imageLibrary[0],
      inlineImage: CONFIG.imageLibrary[1],
    };
  }
}

/**
 * Generate Reddit-style comments
 */
function generateComments(platform = 'reddit', storyContext = {}) {
  // Generate context-aware comments based on story category and content
  const { category = 'general', title = '', trending = false } = storyContext;

  const redditCommentTemplates = {
    general: [
      'This is the kind of content I come to Reddit for. Pure gold.',
      'OP delivered. What a wild ride from start to finish.',
      'I was not prepared for that plot twist. Absolutely unhinged.',
      "The fact that this actually happened... I can't even.",
      'This needs to be higher up. Everyone needs to read this.',
      "I've been on Reddit for years and this is top tier content.",
      'Someone give this person an award. This is incredible.',
      'This is why I sort by new. Hidden gems like this.',
    ],
    celebrity: [
      'Celebrity PR teams are working overtime after this one.',
      'The way they thought they could control the narrative... hilarious.',
      'This is going to be in every tabloid by tomorrow.',
      'Their publicist just quit after reading this, guaranteed.',
      'The damage control attempts made it SO much worse.',
      'I give it 24 hours before the apology video drops.',
      'Their Instagram comments are already a warzone.',
      'This is what happens when you surround yourself with yes-people.',
    ],
    workplace: [
      'HR is definitely browsing LinkedIn right now.',
      'This is exactly why I record every meeting.',
      'Your boss sounds like every nightmare manager rolled into one.',
      'I would have rage quit on the spot. You have more patience than me.',
      'Please tell me you have this documented. This is lawsuit material.',
      'The fact that they thought this was acceptable... mind-blowing.',
      'Update your resume immediately. This place is toxic.',
      'Name and shame. People need to know about companies like this.',
    ],
    relationships: [
      'This is why communication is important, people.',
      'Red flags everywhere. You dodged a bullet, OP.',
      "The audacity of thinking this was okay... I'm speechless.",
      'My therapist would have a field day with this story.',
      'This belongs in the relationship hall of fame for what NOT to do.',
      'I need an update. Did they ever realize how wrong they were?',
      'The mental gymnastics here deserve an Olympic medal.',
      "Run. Don't walk. RUN.",
    ],
    food: [
      'Gordon Ramsay would have a stroke reading this.',
      'This is a crime against food and humanity.',
      "I've worked in restaurants for 10 years. This is sadly common.",
      'The health inspector needs to see this immediately.',
      'My Italian grandmother is rolling in her grave.',
      'This is why I have trust issues with restaurants.',
      'The fact that they served this to people... jail.',
      'I would have called the police. This is assault.',
    ],
    legal: [
      'Lawyer here. This is absolutely grounds for action.',
      "The judge's face must have been priceless.",
      'This is why you always get everything in writing.',
      'Their lawyer probably wanted to crawl under the desk.',
      "I've seen some wild cases but this takes the cake.",
      'The fact that this made it to court... amazing.',
      'Discovery is going to be VERY interesting.',
      "Please tell me you have a good lawyer. You're going to need one.",
    ],
    technology: [
      "This is why we can't have nice things.",
      "Someone's getting fired from the dev team.",
      'The fact that this passed QA... how?',
      "I'm sending this to my entire engineering team as a cautionary tale.",
      'This is what happens when you ignore the documentation.',
      'The GitHub issues for this must be spectacular.',
      'Production is not a testing environment, people!',
      'This is why I have trust issues with auto-updates.',
    ],
    sports: [
      'ESPN is frantically trying to get the rights to this story.',
      "This is worse than any scandal I've seen in 20 years of following sports.",
      'The locker room is never going to be the same.',
      'Their career is over. No coming back from this.',
      'The fact that teammates knew and said nothing...',
      'This makes other sports scandals look tame.',
      'The press conference after this is going to be must-watch TV.',
      'Fantasy league in shambles right now.',
    ],
  };

  // Get base comments for the category
  const categoryComments =
    redditCommentTemplates[category] || redditCommentTemplates.general;

  // Mix in some general comments
  const generalComments = redditCommentTemplates.general;

  // Create a pool of comments
  const commentPool = [
    ...categoryComments.slice(0, 5),
    ...generalComments.slice(0, 3),
  ];

  const tiktokComments = [
    'WAIT WHAT?! I need part 47 immediately 😭',
    'Not me watching this whole saga instead of doing homework',
    'This is better than Netflix I swear',
    'The absolute CHAOS... I live for this drama',
    'bestie dropped the tea and SCALDED everyone',
    'no but why is this literally my life rn',
    'the way I RAN here after seeing part 1',
    'putting this in my "drama that feeds my soul" folder',
  ];

  const twitterComments = [
    "This whole thread is unhinged and I'm here for it",
    "The way this escalated... I can't breathe 💀",
    'Quote tweeting for posterity before it gets deleted',
    'Not the plot twist in tweet 7/23 😭😭😭',
    'Ratioed their whole existence, we love to see it',
    'The screenshots... bestie you really kept ALL the receipts',
    'Imagine being the person this thread is about and seeing it go viral',
    'This is why I pay for internet',
  ];

  let comments;
  if (platform === 'twitter') {
    comments = twitterComments;
  } else if (platform === 'tiktok') {
    comments = tiktokComments;
  } else {
    comments = commentPool;
  }

  // Randomly select 4-6 comments
  const selectedComments = [];
  const numComments = Math.floor(Math.random() * 3) + 4; // 4-6 comments

  while (
    selectedComments.length < numComments &&
    selectedComments.length < comments.length
  ) {
    const comment = comments[Math.floor(Math.random() * comments.length)];
    if (!selectedComments.find(c => c === comment)) {
      selectedComments.push(comment);
    }
  }

  return selectedComments.map(content => ({
    author:
      platform === 'tiktok'
        ? `@${['bestie', 'user', 'drama', 'tea', 'chaos'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 9999)}`
        : platform === 'twitter'
          ? `@${['chaos', 'drama', 'unhinged', 'viral', 'tea'][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 999)}`
          : `${['Dramatic', 'Unhinged', 'Chaotic', 'Wild', 'Reddit'][Math.floor(Math.random() * 5)]}User${Math.floor(Math.random() * 9999)}`,
    content,
    upvotes:
      platform === 'reddit'
        ? Math.floor(Math.random() * 5000) + 100
        : undefined,
    likes:
      platform !== 'reddit'
        ? Math.floor(Math.random() * 10000) + 500
        : undefined,
    retweets:
      platform === 'twitter'
        ? Math.floor(Math.random() * 1000) + 50
        : undefined,
  }));
}

/**
 * Create slug from title
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .substring(0, 60);
}

/**
 * Save story to database
 */
export async function saveToDatabase(story) {
  try {
    const db = getSupabase();

    // Ensure persona exists (using name since slug column doesn't exist)
    console.log(`👤 Checking persona: ${story.persona.name}`);
    let { data: persona, error: personaError } = await db
      .from('personas')
      .select('*')
      .eq('name', story.persona.name)
      .single();

    if (personaError && personaError.code !== 'PGRST116') {
      console.error('❌ Error checking persona:', personaError.message);
      throw personaError;
    }

    if (!persona) {
      console.log(`➕ Creating new persona: ${story.persona.name}`);
      const { data: newPersona, error: createPersonaError } = await db
        .from('personas')
        .insert({
          name: story.persona.name,
          avatar_url: story.persona.avatar,
          tone: story.persona.tone,
          style_preferences: story.persona.bio || 'Standard style preferences',
          target_audience: 'General audience',
          content_focus: 'Viral stories and entertainment',
        })
        .select()
        .single();

      if (createPersonaError) {
        console.error('❌ Error creating persona:', createPersonaError.message);
        throw createPersonaError;
      }
      persona = newPersona;
    }

    // Save story to Supabase
    console.log(`📝 Saving story: "${story.title}"`);
    const { data: savedStory, error: saveError } = await db
      .from('posts')
      .insert({
        title: story.title,
        slug: story.slug,
        hook: story.excerpt,
        content: JSON.stringify(story.content),
        featured_image: story.imageUrl,
        category: story.category,
        persona_id: persona.id,
        status: 'published',
        view_count: story.viewCount,
        share_count: story.shareCount,
        featured: story.featured,
        trending_score: story.trending ? 8 : 5,
        subreddit: story.category,
        layout_style: 1,
        seo_title: story.title,
        seo_description: story.excerpt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error saving story:', saveError.message);
      throw saveError;
    }

    console.log(`✅ Successfully saved story to Supabase: ${savedStory.slug}`);
    return savedStory;
  } catch (error) {
    console.error('❌ Database save failed:', error.message);
    throw error;
  }
}

/**
 * Parse media placeholders from story content
 */
function parseMediaPlaceholders(content) {
  const mediaRegex =
    /\[MEDIA:\s*type="([^"]+)"\s*query="([^"]+)"\s*context="([^"]+)"\]/g;
  const placeholders = [];

  // Search through all sections
  content.sections.forEach((section, index) => {
    if (section.content) {
      let match;
      while ((match = mediaRegex.exec(section.content)) !== null) {
        placeholders.push({
          sectionIndex: index,
          type: match[1],
          query: match[2],
          context: match[3],
          fullMatch: match[0],
          position: match.index,
        });
      }
    }
  });

  return placeholders;
}

/**
 * Generate a complete story
 */
export async function generateStory(options = {}) {
  try {
    // Generate content
    const storyData = await generateStoryContent(options);

    // Parse media placeholders
    const mediaPlaceholders = parseMediaPlaceholders(storyData.content);
    console.log(`🎬 Found ${mediaPlaceholders.length} media placeholders`);

    // Select images (hero + inline)
    const { heroImage, inlineImage } = await selectImagesForStory(storyData);

    // Use comments from the actual Reddit post that was used for the story
    let comments;
    if (storyData.realPost && storyData.realPost.topComments && storyData.realPost.topComments.length > 0) {
      // Format the real comments from the source post
      console.log(`💬 Using ${storyData.realPost.topComments.length} comments from original Reddit post`);
      comments = storyData.realPost.topComments
        .filter(c => c.body && c.body !== '[deleted]' && c.body !== '[removed]')
        .slice(0, 6) // Take top 6 comments
        .map(comment => ({
          content: comment.body || comment.text,
          author: comment.author || comment.username || 'deleted',
          upvotes: comment.score || comment.upVotes || 0,
          awards: comment.awards || Math.floor(Math.random() * 3),
          timestamp: '2h ago',
          isOP: comment.is_submitter || comment.isOP || false,
        }));
    } else {
      // Fallback to template comments if no real comments available
      console.log('⚠️  No comments from source post, using template comments');
      comments = generateComments(storyData.contentSource, {
        category: storyData.category,
        title: storyData.title,
        trending: true,
      });
    }

    // Build sections array with Reddit media and interspersed original content
    const sections = [];
    const contentSections = storyData.content.sections
      .slice(2)
      .filter(s => s.type !== 'outro');
    const redditSegments = storyData.realPost?.segments || [];

    // Add first two sections (intro/setup)
    sections.push(...storyData.content.sections.slice(0, 2));

    // Add first Reddit segment if available
    if (redditSegments.length > 0) {
      sections.push({
        type: 'reddit_quote',
        content: redditSegments[0],
        metadata: {
          subreddit: storyData.realPost?.parsedCommunityName || 'reddit',
          author: storyData.realPost?.username || 'OP',
          score: storyData.realPost?.upVotes || storyData.realPost?.score || 0,
          context: 'Original Reddit post - Part 1',
        },
      });
    }

    // Add inline image
    sections.push({
      type: 'image',
      content: inlineImage.description,
      metadata: {
        image_source:
          inlineImage.source_name || 'Stock photo from ThreadJuice library',
        image_url: inlineImage.path,
        attribution: inlineImage.author || 'Stock photo',
        source: inlineImage.source_url || 'ThreadJuice curated library',
        license_type: inlineImage.license_type || 'Standard License',
        isRedditMedia: inlineImage.isRedditMedia || false,
      },
    });

    // Intersperse remaining content with Reddit segments
    const maxSegments = Math.min(redditSegments.length, contentSections.length);

    for (
      let i = 0;
      i < Math.max(contentSections.length, redditSegments.length - 1);
      i++
    ) {
      // Add content section if available
      if (i < contentSections.length) {
        sections.push(contentSections[i]);
      }

      // Add Reddit segment if available (skip first one, already added)
      if (i + 1 < redditSegments.length) {
        sections.push({
          type: 'reddit_quote',
          content: redditSegments[i + 1],
          metadata: {
            subreddit: storyData.realPost?.parsedCommunityName || 'reddit',
            author: storyData.realPost?.username || 'OP',
            score:
              storyData.realPost?.upVotes || storyData.realPost?.score || 0,
            context: `Original Reddit post - Part ${i + 2}`,
          },
        });
      }
    }

    // Add Reddit videos if available
    if (storyData.realPost?.extractedMedia?.videos?.length > 0) {
      storyData.realPost.extractedMedia.videos.forEach((video, index) => {
        sections.push({
          type: 'media_embed',
          content: `Video from the Reddit post${index > 0 ? ` (Part ${index + 1})` : ''}`,
          metadata: {
            media: {
              type: 'video',
              embedUrl: video.url,
              title: 'Reddit Video',
              platform: 'Reddit',
              confidence: 1.0,
              isRedditMedia: true,
            },
          },
        });
      });
    }

    // Add additional Reddit images as gallery
    if (storyData.realPost?.extractedMedia?.images?.length > 2) {
      const galleryImages = storyData.realPost.extractedMedia.images.slice(2);
      galleryImages.forEach((img, index) => {
        sections.push({
          type: 'image',
          content: `Additional image from Reddit post ${index + 3}`,
          metadata: {
            image_source: 'Reddit Gallery',
            image_url: img.url,
            attribution: storyData.realPost.username || 'Reddit user',
            source: storyData.realPost.url,
            license_type: 'Reddit Content',
            isRedditMedia: true,
          },
        });
      });
    }

    // Add controversial comment if available (for ragebait)
    if (storyData.realPost?.controversialComment) {
      const controversial = storyData.realPost.controversialComment;

      // Add a separator section
      sections.push({
        type: 'terry_corner',
        title: 'Meanwhile, in the Depths of Reddit...',
        content:
          "Brace yourself, we found the one comment that's making everyone lose their minds. Remember, we're just the messengers here:",
      });

      // Add the controversial comment with clear distancing
      sections.push({
        type: 'pullquote',
        content: controversial.body,
        metadata: {
          author: `u/${controversial.author}`,
          context: `⚠️ This controversial take got ${controversial.score} points and sparked HEATED debate. ThreadJuice does not endorse this view - we're just showing you what got Reddit riled up.`,
          isControversial: true,
        },
      });

      // Add another Terry comment to further distance
      sections.push({
        type: 'terry_corner',
        title: "The Terry's Take",
        content:
          "And this, ladies and gentlemen, is why we can't have nice things. Some people just wake up and choose violence. At least it gave everyone something to argue about in the replies. 🍿",
      });
    }

    // Build complete story
    const story = {
      id: `story-${Date.now()}`,
      title: storyData.title,
      slug: createSlug(storyData.title),
      excerpt: storyData.excerpt,
      category: storyData.category,
      status: 'published',
      trending: true,
      featured: Math.random() > 0.5,
      author: storyData.persona.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persona: storyData.persona,
      content: {
        sections: [
          ...sections,
          {
            type: 'comments-1',
            title:
              storyData.contentSource === 'twitter'
                ? 'Twitter Went Absolutely Feral'
                : storyData.contentSource === 'tiktok'
                  ? 'The Comments Section Lost It'
                  : 'Reddit Reacts',
            content:
              storyData.contentSource === 'twitter'
                ? 'The quote tweets alone could fuel a small country:'
                : storyData.contentSource === 'tiktok'
                  ? 'The FYP was NOT ready for this chaos:'
                  : 'The comment section delivered, as always:',
            metadata: {
              comments,
              platform: storyData.contentSource,
            },
          },
          // Add outro as the very last section
          ...storyData.content.sections.filter(s => s.type === 'outro'),
        ],
      },
      imageUrl: heroImage.path,
      viewCount: Math.floor(Math.random() * 50000) + 10000,
      upvoteCount: Math.floor(Math.random() * 5000) + 1000,
      commentCount: Math.floor(Math.random() * 500) + 50,
      shareCount: Math.floor(Math.random() * 3000) + 500,
      bookmarkCount: Math.floor(Math.random() * 500) + 50,
      tags: [storyData.category, 'viral', storyData.contentSource],
      viral_score: Math.floor(Math.random() * 3) + 8,
      readingTime: Math.ceil(storyData.content.sections.length * 0.5),
      sourceUrl: storyData.sourceUrl,
      sourceUsername: storyData.sourceUsername,
      sourcePlatform: storyData.sourcePlatform,
    };

    return story;
  } catch (error) {
    console.error('❌ Story generation failed:', error.message);
    throw error;
  }
}

/**
 * Generate multiple stories
 */
export async function generateBulkStories(count = 5) {
  const stories = [];
  const errors = [];

  for (let i = 0; i < count; i++) {
    try {
      console.log(`\n📝 Generating story ${i + 1}/${count}...`);
      const story = await generateStory();
      stories.push(story);
      console.log(`✅ Generated: "${story.title}"`);
    } catch (error) {
      console.error(`❌ Failed to generate story ${i + 1}:`, error.message);
      errors.push(error.message);
    }
  }

  return { stories, errors };
}

/**
 * Save story to JSON file
 */
export async function saveToFile(story) {
  const filename = `generated-${story.slug}.json`;
  const filepath = path.join(
    process.cwd(),
    'data',
    'generated-stories',
    filename
  );

  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(story, null, 2));

  return filename;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';

  try {
    switch (command) {
      case 'generate': {
        const options = {};
        for (let i = 1; i < args.length; i += 2) {
          if (args[i] === '--category') options.category = args[i + 1];
          if (args[i] === '--source') options.source = args[i + 1];
          if (args[i] === '--save-file') options.saveFile = true;
          if (args[i] === '--no-db') options.noDB = true;
          if (args[i] === '--real-data') options.useRealData = true;
          if (args[i] === '--ai-only') options.useRealData = false;
        }

        const story = await generateStoryWithMedia(options);

        if (!options.noDB) {
          await saveToDatabase(story);
          console.log(`✅ Saved to database: ${story.slug}`);
        }

        if (options.saveFile) {
          const filename = await saveToFile(story);
          console.log(`📄 Saved to file: ${filename}`);
        }

        console.log(`\n🎉 Story generation complete!`);
        console.log(`🔗 View at: http://localhost:4242/blog/${story.slug}`);
        break;
      }

      case 'bulk': {
        const count = parseInt(args[1]) || 5;
        console.log(`🚀 Generating ${count} stories...`);

        const stories = [];
        const errors = [];

        for (let i = 0; i < count; i++) {
          try {
            console.log(`\n📝 Generating story ${i + 1}/${count}...`);
            const story = await generateStoryWithMedia();
            stories.push(story);
            console.log(`✅ Generated: "${story.title}"`);
          } catch (error) {
            console.error(
              `❌ Failed to generate story ${i + 1}:`,
              error.message
            );
            errors.push(error.message);
          }
        }

        // Save all to database
        for (const story of stories) {
          await saveToDatabase(story);
        }

        console.log(`\n✅ Generated ${stories.length} stories`);
        if (errors.length > 0) {
          console.log(`❌ Failed: ${errors.length}`);
        }
        break;
      }

      case 'help': {
        console.log(`
ThreadJuice Unified Story Generator

Usage:
  node generate-story-unified.js [command] [options]

Commands:
  generate    Generate a single story (default)
  bulk <n>    Generate n stories
  help        Show this help

Options:
  --category <name>  Specify category
  --source <type>    Content source (reddit/twitter)
  --save-file        Save to JSON file
  --no-db           Don't save to database
  --real-data       Use real Reddit data from Apify (requires APIFY_API_TOKEN)
  --ai-only         Use AI generation only (default if no Apify token)

Examples:
  node generate-story-unified.js
  node generate-story-unified.js generate --category workplace
  node generate-story-unified.js generate --real-data
  node generate-story-unified.js generate --source reddit --real-data
  node generate-story-unified.js bulk 10
        `);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Generation failed:', error.message);
    process.exit(1);
  }
}

// Initialize media enricher (using JavaScript wrapper)
async function getMediaEnricher() {
  try {
    const { realMediaEnricher } = await import('./real-media-enricher.js');
    return realMediaEnricher;
  } catch (error) {
    console.warn('⚠️ Media enricher not available:', error.message);
    return null;
  }
}

/**
 * Generate story with media enrichment
 */
export async function generateStoryWithMedia(options = {}) {
  try {
    // Generate base story
    const story = await generateStory(options);

    // Check if we have media placeholders
    const hasMedia = story.content.sections.some(
      s => s.content && s.content.includes('[MEDIA:')
    );

    if (!hasMedia) {
      return story;
    }

    // Enrich with media
    console.log('🎬 Enriching story with media embeds...');
    const enricher = await getMediaEnricher();

    if (!enricher) {
      console.log(
        '⚠️ Media enricher not available, returning story without embeds'
      );
      return story;
    }

    const enrichedStory = await enricher.processStory(story);

    return enrichedStory;
  } catch (error) {
    console.error('❌ Media enrichment failed:', error.message);
    // Return story without media enrichment
    return generateStory(options);
  }
}

// Export for use as module
export { CONFIG, createSlug, selectImagesForStory, generateComments };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
