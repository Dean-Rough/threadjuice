#!/usr/bin/env node

/**
 * Twitter Viral Content Discovery
 * Finds the most viral Twitter content based on engagement metrics
 */

import { TwitterApi } from 'twitter-api-v2';
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

// Initialize Twitter API
function getTwitterClient() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    throw new Error('Missing TWITTER_BEARER_TOKEN in environment variables');
  }
  
  return new TwitterApi(bearerToken);
}

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
 * Search queries for viral content
 */
const VIRAL_QUERIES = [
  // Drama and controversy
  'min_retweets:1000 min_replies:500 -is:retweet lang:en',
  '"ratio\'d" min_retweets:500 lang:en',
  '"community notes" min_retweets:1000 lang:en',
  '"deleted their tweet" min_retweets:500 lang:en',
  
  // Viral moments
  '"going viral" min_retweets:2000 lang:en',
  '"broke the internet" min_retweets:1000 lang:en',
  '"can\'t believe" min_retweets:5000 lang:en',
  '"plot twist" min_retweets:2000 lang:en',
  
  // Drama threads
  '🧵 min_retweets:1000 min_replies:200 lang:en',
  '"a thread" min_retweets:2000 lang:en',
  '"let me explain" min_retweets:1000 lang:en',
  
  // Hot takes
  '"unpopular opinion" min_retweets:1000 lang:en',
  '"hot take" min_retweets:1000 lang:en',
  '"hear me out" min_retweets:2000 lang:en',
  
  // Breaking news
  '"BREAKING:" min_retweets:5000 lang:en',
  '"UPDATE:" min_retweets:2000 lang:en',
  
  // Celebrity drama
  'from:PopBase min_retweets:1000',
  'from:PopCrave min_retweets:1000',
  'from:DramaAlert min_retweets:500',
  
  // Tech drama
  'from:verge min_retweets:500',
  'from:TechCrunch min_retweets:500',
  '"app store" min_retweets:1000 lang:en',
  
  // Food drama
  '"worst restaurant" min_retweets:1000 lang:en',
  '"food poisoning" min_retweets:500 lang:en',
  'from:GordonRamsay min_retweets:1000'
];

/**
 * Engagement score calculation for tweets
 */
function calculateTwitterEngagement(tweet) {
  const metrics = tweet.public_metrics || {};
  const likes = metrics.like_count || 0;
  const retweets = metrics.retweet_count || 0;
  const replies = metrics.reply_count || 0;
  const quotes = metrics.quote_count || 0;
  
  // Weight formula: likes + (retweets * 3) + (replies * 2) + (quotes * 4)
  // Quotes are weighted highest as they indicate viral discussions
  // Retweets spread the content
  // Replies indicate controversy/discussion
  return likes + (retweets * 3) + (replies * 2) + (quotes * 4);
}

/**
 * Search for viral tweets
 */
async function searchViralTweets(client, query, maxResults = 100) {
  try {
    console.log(`🔍 Searching: "${query.slice(0, 50)}..."`);
    
    const tweets = await client.v2.search(query, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': [
        'author_id',
        'created_at',
        'public_metrics',
        'conversation_id',
        'referenced_tweets',
        'attachments',
        'entities',
        'context_annotations'
      ],
      'expansions': [
        'author_id',
        'referenced_tweets.id',
        'attachments.media_keys'
      ],
      'user.fields': [
        'name',
        'username',
        'verified',
        'public_metrics'
      ],
      'media.fields': [
        'url',
        'preview_image_url',
        'type'
      ]
    });
    
    if (!tweets.data || tweets.data.length === 0) {
      return [];
    }
    
    // Process tweets with user data
    const users = tweets.includes?.users || [];
    const media = tweets.includes?.media || [];
    const userMap = new Map(users.map(u => [u.id, u]));
    const mediaMap = new Map(media.map(m => [m.media_key, m]));
    
    return tweets.data.map(tweet => {
      const author = userMap.get(tweet.author_id);
      const tweetMedia = tweet.attachments?.media_keys?.map(key => mediaMap.get(key)).filter(Boolean) || [];
      
      return {
        id: tweet.id,
        text: tweet.text,
        author_id: tweet.author_id,
        author_username: author?.username || 'unknown',
        author_name: author?.name || 'Unknown',
        author_verified: author?.verified || false,
        created_at: tweet.created_at,
        metrics: tweet.public_metrics,
        engagement_score: calculateTwitterEngagement(tweet),
        conversation_id: tweet.conversation_id,
        is_thread: tweet.conversation_id === tweet.id,
        has_media: tweetMedia.length > 0,
        media: tweetMedia,
        url: `https://twitter.com/${author?.username}/status/${tweet.id}`
      };
    });
    
  } catch (error) {
    console.error(`❌ Search failed for query "${query.slice(0, 30)}...":`, error.message);
    return [];
  }
}

/**
 * Get viral threads (multi-tweet stories)
 */
async function getViralThreads(client, authorId, conversationId, maxTweets = 20) {
  try {
    const thread = await client.v2.search(
      `from:${authorId} conversation_id:${conversationId}`,
      {
        max_results: maxTweets,
        'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'conversation_id'],
        sort_order: 'recency'
      }
    );
    
    return thread.data || [];
  } catch (error) {
    console.error('❌ Failed to fetch thread:', error.message);
    return [];
  }
}

/**
 * Check if tweet already exists in database
 */
async function tweetExists(supabase, tweetId) {
  const { data, error } = await supabase
    .from('posts')
    .select('id')
    .eq('source_id', `twitter_${tweetId}`)
    .single();
  
  return !!data;
}

/**
 * Filter tweets for quality
 */
function filterQualityTweets(tweets) {
  return tweets.filter(tweet => {
    // Basic quality filters
    if (!tweet.text || tweet.text.length < 20) return false;
    if (tweet.engagement_score < 1000) return false;
    
    // Filter out basic replies unless they're viral
    if (tweet.text.startsWith('@') && tweet.engagement_score < 5000) return false;
    
    // Filter out link-only tweets
    if (tweet.text.match(/^https?:\/\/\S+$/)) return false;
    
    // Filter out spam patterns
    const spamPatterns = [
      /follow\s+for\s+follow/i,
      /check\s+my\s+bio/i,
      /click\s+link\s+in\s+bio/i,
      /retweet\s+to\s+win/i
    ];
    
    if (spamPatterns.some(pattern => pattern.test(tweet.text))) return false;
    
    return true;
  });
}

/**
 * Discover viral Twitter content
 */
async function discoverViralContent(options = {}) {
  const {
    maxResults = 50,
    minEngagement = 5000,
    includeThreads = true
  } = options;
  
  console.log('🔍 Starting Twitter viral content discovery...');
  console.log(`📊 Min engagement: ${minEngagement}, Include threads: ${includeThreads}`);
  
  const client = getTwitterClient();
  const supabase = getSupabase();
  const allTweets = [];
  
  // Search with different queries
  for (const query of VIRAL_QUERIES) {
    const tweets = await searchViralTweets(client.readOnly, query, 100);
    allTweets.push(...tweets);
    
    if (tweets.length > 0) {
      console.log(`✅ Found ${tweets.length} tweets for query`);
    }
    
    // Rate limiting - Twitter allows 300 requests per 15 minutes for search
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Filter and sort by engagement
  const viralTweets = filterQualityTweets(allTweets)
    .filter(tweet => tweet.engagement_score >= minEngagement)
    .sort((a, b) => b.engagement_score - a.engagement_score)
    .slice(0, maxResults);
  
  console.log(`\n🎯 Found ${viralTweets.length} viral tweets above threshold`);
  
  // Find threads and drama
  const contentToImport = [];
  
  for (const tweet of viralTweets) {
    const exists = await tweetExists(supabase, tweet.id);
    if (exists) continue;
    
    // Check if it's a thread starter
    if (includeThreads && tweet.is_thread) {
      const threadTweets = await getViralThreads(
        client.readOnly,
        tweet.author_id,
        tweet.conversation_id
      );
      
      if (threadTweets.length > 2) {
        contentToImport.push({
          type: 'thread',
          mainTweet: tweet,
          threadTweets: threadTweets,
          totalEngagement: tweet.engagement_score,
          url: tweet.url
        });
        console.log(`🧵 Found thread with ${threadTweets.length} tweets`);
      } else {
        contentToImport.push({
          type: 'single',
          tweet: tweet,
          url: tweet.url
        });
      }
    } else {
      contentToImport.push({
        type: 'single',
        tweet: tweet,
        url: tweet.url
      });
    }
  }
  
  console.log(`\n📦 ${contentToImport.length} items ready for import`);
  
  return contentToImport;
}

/**
 * Import discovered content to database
 */
async function importContent(content) {
  if (content.length === 0) {
    console.log('⚠️  No new content to import');
    return;
  }
  
  console.log(`\n🚀 Importing ${content.length} viral items...`);
  
  for (const item of content) {
    try {
      if (item.type === 'thread') {
        console.log(`\n🧵 Processing thread: "${item.mainTweet.text.slice(0, 60)}..."`);
        console.log(`   👤 @${item.mainTweet.author_username} | 🔥 ${item.totalEngagement} engagement`);
        
        // Use the Twitter scraper for threads
        const { execSync } = await import('child_process');
        execSync(`node scripts/scraping/scrape-twitter-story.js thread ${item.url}`, {
          stdio: 'inherit'
        });
        
      } else {
        console.log(`\n🐦 Processing tweet: "${item.tweet.text.slice(0, 60)}..."`);
        console.log(`   👤 @${item.tweet.author_username} | 🔥 ${item.tweet.engagement_score} engagement`);
        
        // For single viral tweets, we might want to find the drama around them
        // Check if there are quote tweets indicating drama
        if (item.tweet.metrics.quote_count > 100) {
          const { execSync } = await import('child_process');
          execSync(`node scripts/scraping/scrape-twitter-story.js drama ${item.url}`, {
            stdio: 'inherit'
          });
        }
      }
      
      // Rate limit between imports
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to import item:`, error.message);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'discover';
  
  try {
    if (command === 'discover') {
      // Discovery mode - find viral content
      const limit = parseInt(args[1]) || 20;
      
      const content = await discoverViralContent({
        maxResults: limit,
        minEngagement: 5000,
        includeThreads: true
      });
      
      if (args.includes('--dry-run')) {
        console.log('\n🔍 Dry run - found content:');
        content.forEach((item, i) => {
          if (item.type === 'thread') {
            console.log(`\n${i + 1}. 🧵 THREAD by @${item.mainTweet.author_username}`);
            console.log(`   "${item.mainTweet.text.slice(0, 100)}..."`);
            console.log(`   Engagement: ${item.totalEngagement} | Tweets: ${item.threadTweets.length}`);
          } else {
            console.log(`\n${i + 1}. 🐦 TWEET by @${item.tweet.author_username}`);
            console.log(`   "${item.tweet.text.slice(0, 100)}..."`);
            console.log(`   Engagement: ${item.tweet.engagement_score}`);
          }
          console.log(`   ${item.url}`);
        });
      } else {
        await importContent(content);
      }
      
    } else if (command === 'monitor') {
      // Continuous monitoring mode
      console.log('👁️  Starting continuous monitoring mode...');
      
      const interval = parseInt(args[1]) || 15; // minutes
      
      const monitor = async () => {
        console.log(`\n⏰ Running discovery at ${new Date().toLocaleTimeString()}`);
        
        const content = await discoverViralContent({
          maxResults: 10,
          minEngagement: 2000,
          includeThreads: true
        });
        
        await importContent(content);
        
        console.log(`\n💤 Next run in ${interval} minutes...`);
      };
      
      // Run immediately
      await monitor();
      
      // Then run on interval
      setInterval(monitor, interval * 60 * 1000);
      
    } else if (command === 'trending') {
      // Get current trending topics
      console.log('📈 Fetching trending topics...');
      
      const client = getTwitterClient();
      
      // Get trending topics for US (WOEID: 23424977)
      const trends = await client.v1.trends('23424977');
      
      console.log('\n🔥 Current trending topics:');
      trends[0].trends.slice(0, 20).forEach((trend, i) => {
        console.log(`${i + 1}. ${trend.name} (${trend.tweet_volume || 'N/A'} tweets)`);
      });
      
      // Search for viral content in top trends
      const topTrends = trends[0].trends
        .filter(t => t.tweet_volume && t.tweet_volume > 10000)
        .slice(0, 5);
      
      for (const trend of topTrends) {
        console.log(`\n🔍 Searching viral content for: ${trend.name}`);
        
        const tweets = await searchViralTweets(
          client.readOnly,
          `${trend.name} min_retweets:1000 -is:retweet lang:en`,
          20
        );
        
        const viral = tweets
          .filter(t => calculateTwitterEngagement(t) > 5000)
          .slice(0, 3);
        
        if (viral.length > 0) {
          console.log(`✅ Found ${viral.length} viral tweets`);
          // Import them...
        }
      }
      
    } else {
      console.log('Usage:');
      console.log('  npm run discover:twitter discover [limit] [--dry-run]');
      console.log('  npm run discover:twitter monitor [interval-minutes]');
      console.log('  npm run discover:twitter trending');
      console.log('');
      console.log('Example: npm run discover:twitter discover 50');
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}