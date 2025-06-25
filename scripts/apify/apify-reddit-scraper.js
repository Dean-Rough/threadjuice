#!/usr/bin/env node

/**
 * Apify Reddit Scraper Integration
 * Uses trudax/reddit-scraper to get viral Reddit content
 */

import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
// Content moderation - inline for now to avoid TS import issues
const contentModerator = {
  moderateContent: (content) => {
    const politicalTerms = ['trump', 'biden', 'republican', 'democrat', 'election', 'politics', 'conservative', 'liberal'];
    const religiousTerms = ['christian', 'muslim', 'jewish', 'religious', 'church', 'mosque', 'temple'];
    const racialTerms = ['race', 'racial', 'racism', 'ethnic', 'minority'];
    
    const normalizedContent = content.toLowerCase();
    const blockedCategories = [];
    const flaggedTerms = [];
    
    for (const term of politicalTerms) {
      if (normalizedContent.includes(term)) {
        blockedCategories.push('political');
        flaggedTerms.push(term);
        break;
      }
    }
    
    for (const term of religiousTerms) {
      if (normalizedContent.includes(term)) {
        blockedCategories.push('religious');
        flaggedTerms.push(term);
        break;
      }
    }
    
    for (const term of racialTerms) {
      if (normalizedContent.includes(term)) {
        blockedCategories.push('racial');
        flaggedTerms.push(term);
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

// Initialize Apify and Supabase clients
function getClients() {
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    throw new Error('Missing APIFY_API_TOKEN in environment variables');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  return {
    apify: new ApifyClient({ token: apifyToken }),
    supabase: createClient(supabaseUrl, supabaseAnonKey),
  };
}

/**
 * Reddit subreddits for viral content discovery - Light-hearted, non-political only
 */
const VIRAL_SUBREDDITS = [
  // Drama and relationships (non-political)
  'AmItheAsshole',
  'relationship_advice',
  'tifu',
  
  // Workplace drama (non-political)
  'MaliciousCompliance',
  'pettyrevenge',

  // Family drama (light-hearted)
  'JUSTNOMIL',
  'entitledparents',

  // Social drama (non-political)
  'ChoosingBeggars',
  'mildlyinfuriating',

  // General viral (wholesome/funny)
  'funny',
  'mildlyinteresting',
  'wholesomememes',
  'facepalm',
  'therewasanattempt',
];

/**
 * Run Apify Reddit scraper
 */
async function scrapeViralReddit(options = {}) {
  const {
    subreddits = VIRAL_SUBREDDITS.slice(0, 5), // Start with top 5
    postsPerSubreddit = 5,
    timeframe = 'day', // hour, day, week, month, year
  } = options;

  console.log('🔥 APIFY REDDIT VIRAL CONTENT SCRAPING');
  console.log('======================================');
  console.log(`📊 Subreddits: ${subreddits.join(', ')}`);
  console.log(`📈 Posts per subreddit: ${postsPerSubreddit}`);
  console.log(`⏰ Timeframe: ${timeframe}`);

  const { apify } = getClients();

  // Prepare input for Apify Reddit scraper
  const input = {
    // Use search terms to find viral content
    searches: subreddits.map(subreddit => `subreddit:${subreddit}`),

    // Start URLs for specific subreddits
    startUrls: subreddits.map(subreddit => ({
      url: `https://www.reddit.com/r/${subreddit}/top/?t=${timeframe}`,
    })),

    // Scraping options
    maxItems: postsPerSubreddit * subreddits.length,
    maxCommentsPerPost: 20,
    maxRepliesPerComment: 5,

    // Content filters
    includeImages: true,
    includeVideos: true,
    includeLinks: true,

    // Proxy configuration
    useApifyProxy: true,
    apifyProxyGroups: ['RESIDENTIAL'],
  };

  try {
    console.log(`\n🚀 Starting Apify Reddit scraper...`);

    // Run the actor - using FREE reddit-scraper-lite
    const run = await apify.actor('trudax/reddit-scraper-lite').call(input);

    console.log(`✅ Apify run completed: ${run.id}`);
    console.log(`📊 Status: ${run.status}`);

    // Get the results
    const { items } = await apify.dataset(run.defaultDatasetId).listItems();

    console.log(`📦 Retrieved ${items.length} Reddit items`);

    // Debug: Let's see what we're actually getting
    if (items.length > 0) {
      console.log(`\n🔍 Sample Reddit item structure:`);
      console.log(JSON.stringify(items[0], null, 2).slice(0, 1500) + '...');

      // Check for images and media
      console.log(`\n📸 Media check:`);
      console.log(`Images: ${items[0].images?.length || 0}`);
      console.log(`Videos: ${items[0].videos?.length || 0}`);
      console.log(`Media: ${items[0].media ? 'Present' : 'None'}`);
      console.log(
        `Comments: ${items[0].topComments?.length || items[0].comments?.length || 0}`
      );

      // Check all possible image fields
      console.log(`\n🖼️ All fields check:`);
      const keys = Object.keys(items[0]);
      keys.forEach(key => {
        if (
          key.toLowerCase().includes('image') ||
          key.toLowerCase().includes('media') ||
          key.toLowerCase().includes('url')
        ) {
          console.log(
            `${key}: ${JSON.stringify(items[0][key])?.slice(0, 100)}`
          );
        }
      });
    }

    return items;
  } catch (error) {
    console.error('❌ Apify Reddit scraping failed:', error.message);
    throw error;
  }
}

/**
 * Convert Apify Reddit data to ThreadJuice format
 */
async function convertRedditToStory(redditPost) {
  // Content moderation check first
  const contentToCheck = `${redditPost.title || ''} ${redditPost.body || redditPost.text || ''}`;
  const moderationResult = contentModerator.moderateContent(contentToCheck);
  
  if (!moderationResult.isAllowed) {
    console.log(`🚫 Reddit post blocked: "${(redditPost.title || '').slice(0, 50)}" - ${moderationResult.blockedCategories.join(', ')}`);
    throw new Error(`Content blocked for: ${moderationResult.blockedCategories.join(', ')}`);
  }
  
  console.log('✅ Reddit post passed content moderation');

  // Create slug
  const createSlug = title =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
      .slice(0, 60);

  // Extract subreddit name
  const subreddit =
    redditPost.parsedCommunityName ||
    redditPost.communityName?.replace('r/', '') ||
    'reddit';

  const story = {
    title: redditPost.title || 'Viral Reddit Post',
    slug: createSlug(redditPost.title || 'viral-reddit-post'),
    excerpt: (redditPost.body || redditPost.text || '').slice(0, 200) + '...',
    category: mapSubredditToCategory(subreddit),
    status: 'published',
    trending: true,
    featured: (redditPost.upvotes || redditPost.score || 0) > 1000,
    author: 'Apify Reddit Scraper',
    persona: {
      name: 'The Reddit Curator',
      avatar: '/assets/personas/reddit-curator.jpg',
      bio: 'Bringing you the most viral Reddit content via Apify',
    },
    content: {
      sections: [],
    },
    imageUrl: '', // Will be set after fetching
    sourceUrl: redditPost.url,
    sourceUsername: redditPost.username
      ? `u/${redditPost.username}`
      : 'unknown',
    sourcePlatform: 'reddit',
    isScraped: true,
    viewCount: (redditPost.upvotes || redditPost.score || 0) * 10,
    upvoteCount: redditPost.upvotes || redditPost.score || 0,
    commentCount: redditPost.numberOfComments || redditPost.comments || 0,
    tags: ['reddit', subreddit, 'viral', 'apify'],
  };

  // Build story sections
  const sections = [];

  // Hero section
  sections.push({
    type: 'hero',
    content: `From r/${subreddit}: ${redditPost.title}`,
    metadata: {
      author: redditPost.username,
      subreddit: subreddit,
      score: redditPost.upvotes || 0,
    },
  });

  // Original post content
  if (redditPost.body) {
    sections.push({
      type: 'describe',
      title: 'The Original Post',
      content: redditPost.body,
    });
  }

  // Add a relevant image for visual interest
  console.log(`📸 Fetching image for r/${subreddit}...`);
  const imageData = await getRelevantImage(subreddit, redditPost.title);
  console.log(`✅ Got image: ${imageData.url.slice(0, 50)}...`);
  story.imageUrl = imageData.url; // Set the main image

  sections.push({
    type: 'image',
    content: `Visual representation of this ${subreddit} moment`,
    metadata: {
      image_url: imageData.url,
      attribution: `Photo by ${imageData.photographer}`,
      source: imageData.pexelsUrl,
    },
  });

  // Images from post
  if (redditPost.imageUrl) {
    sections.push({
      type: 'image',
      content: 'Image from the original Reddit post',
      metadata: {
        image_url: redditPost.imageUrl,
        attribution: `Posted by u/${redditPost.author}`,
        source: redditPost.url,
      },
    });
  }

  // Videos from post
  if (redditPost.videoUrl) {
    sections.push({
      type: 'media_embed',
      content: '',
      metadata: {
        media: {
          type: 'video',
          embedUrl: redditPost.videoUrl,
          title: 'Video from Reddit post',
          platform: 'Reddit',
          confidence: 1.0,
        },
      },
    });
  }

  // Top comments if available
  const comments = redditPost.topComments || redditPost.comments || [];
  if (comments.length > 0) {
    const topComments = comments
      .filter(c => c && (c.body || c.text))
      .slice(0, 5);

    if (topComments.length > 0) {
      sections.push({
        type: 'comments-1',
        title: 'Reddit Reacts',
        content: `The community had a lot to say about this one:`,
        metadata: {
          platform: 'reddit',
          comments: topComments.map(c => ({
            content: c.body || c.text || 'Comment text unavailable',
            author: c.username || c.author || 'Anonymous',
            upvotes: c.upvotes || c.score || 0,
            timestamp: '2h ago',
          })),
        },
      });
    }
  }

  // Terry's commentary
  const upvotes = redditPost.upvotes || redditPost.score || 0;
  sections.push({
    type: 'terry_corner',
    title: "The Terry's Take",
    content: `Another gem from the depths of r/${subreddit}. ${upvotes > 0 ? `${upvotes.toLocaleString()} upvotes` : 'Fresh content'} worth of internet validation. Peak human condition, documented for posterity.`,
  });

  // Outro
  sections.push({
    type: 'outro',
    content: `This Reddit drama brought to you by r/${subreddit} and the power of Apify scrapers. The internet never disappoints.`,
  });

  story.content.sections = sections;
  return story;
}

/**
 * Fetch image from Pexels API
 */
async function fetchPexelsImage(query) {
  const pexelsKey = process.env.PEXELS_API_KEY;
  if (!pexelsKey) return null;

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`,
      {
        headers: {
          Authorization: pexelsKey,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[0];
      return {
        url: photo.src.large,
        photographer: photo.photographer,
        pexelsUrl: photo.url,
      };
    }
  } catch (error) {
    console.error('Pexels API error:', error);
  }

  return null;
}

/**
 * Get a relevant stock image based on subreddit/title
 */
async function getRelevantImage(subreddit, title) {
  // Search terms based on subreddit
  const searchMap = {
    AmItheAsshole: 'argument debate drama',
    relationship_advice: 'couple relationship love',
    tifu: 'mistake fail accident',
    TrueOffMyChest: 'confession secret therapy',
    antiwork: 'office work stress',
    MaliciousCompliance: 'revenge satisfaction success',
    entitledparents: 'family parent argument',
    ChoosingBeggars: 'entitled demanding person',
    PublicFreakout: 'crowd chaos public',
    facepalm: 'facepalm mistake fail',
  };

  const searchQuery = searchMap[subreddit] || 'reddit social media';
  const pexelsImage = await fetchPexelsImage(searchQuery);

  if (pexelsImage) {
    return pexelsImage;
  }

  // Fallback to default
  return {
    url: '/assets/img/reddit-default.jpg',
    photographer: 'ThreadJuice',
    pexelsUrl: '#',
  };
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
  };
  return mappings[subreddit] || 'viral';
}

/**
 * Save story to database
 */
async function saveToDatabase(story) {
  const { supabase } = getClients();

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        title: story.title,
        slug: story.slug,
        hook: story.excerpt,
        content: JSON.stringify(story.content),
        featured_image: story.imageUrl,
        category: story.category,
        persona_id: 1, // Default persona ID
        status: story.status,
        view_count: story.viewCount,
        share_count: story.upvoteCount, // Use upvotes as share count
        featured: story.featured,
        trending_score: story.trending ? 8 : 5,
        subreddit: story.sourcePlatform,
        layout_style: 1,
        seo_title: story.title,
        seo_description: story.excerpt,
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
  const command = args[0] || 'scrape';

  try {
    if (command === 'scrape') {
      const timeframe = args[1] || 'day';
      const limit = parseInt(args[2]) || 10;

      console.log(
        `🎯 Scraping viral Reddit content (${timeframe}, ${limit} posts)`
      );

      // Scrape viral content
      const posts = await scrapeViralReddit({
        timeframe,
        postsPerSubreddit: Math.ceil(limit / 5),
      });

      console.log(`\n📦 Processing ${posts.length} Reddit posts...`);

      let savedCount = 0;
      for (const post of posts.slice(0, limit)) {
        try {
          // Convert to story format
          const story = await convertRedditToStory(post);

          // Save to database
          await saveToDatabase(story);
          savedCount++;

          console.log(`✅ Saved: "${story.title.slice(0, 50)}..."`);
          console.log(
            `   📊 ${story.upvoteCount} upvotes, ${story.commentCount} comments`
          );
          console.log(`   🔗 http://localhost:4242/blog/${story.slug}`);
        } catch (error) {
          if (error.message.includes('duplicate key')) {
            console.log(
              `⏭️  Skipped duplicate: "${post.title?.slice(0, 40) || 'post'}..."`
            );
          } else {
            console.error(`❌ Failed to save post: ${error.message}`);
          }
        }
      }

      console.log(`\n🎉 Successfully scraped and saved ${savedCount} stories!`);
    } else if (command === 'test') {
      // Test Apify connection
      const { apify } = getClients();
      const user = await apify.user().get();
      console.log(`✅ Apify connection successful! User: ${user.username}`);
    } else {
      console.log('Usage:');
      console.log('  npm run apify:reddit scrape [timeframe] [limit]');
      console.log('  npm run apify:reddit test');
      console.log('');
      console.log('Examples:');
      console.log('  npm run apify:reddit scrape day 10');
      console.log('  npm run apify:reddit scrape week 20');
    }
  } catch (error) {
    console.error('❌ Apify Reddit scraping failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
