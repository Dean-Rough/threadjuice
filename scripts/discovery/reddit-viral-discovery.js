#!/usr/bin/env node

/**
 * Reddit Viral Content Discovery
 * Finds the most viral Reddit content based on engagement metrics
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
 * Subreddits to monitor for viral content
 */
const TARGET_SUBREDDITS = [
  // Drama and relationships
  'AmItheAsshole',
  'relationship_advice',
  'tifu',
  'TrueOffMyChest',
  'confessions',
  
  // Workplace drama
  'antiwork',
  'WorkReform',
  'MaliciousCompliance',
  'pettyrevenge',
  'ProRevenge',
  
  // Family drama
  'JUSTNOMIL',
  'entitledparents',
  'raisedbynarcissists',
  
  // Social drama
  'ChoosingBeggars',
  'niceguys',
  'Nicegirls',
  'Tinder',
  
  // Public freakouts
  'PublicFreakout',
  'ActualPublicFreakouts',
  'iamatotalpieceofshit',
  
  // General entertainment
  'HolUp',
  'facepalm',
  'therewasanattempt',
  'Whatcouldgowrong',
  
  // Tech and gaming
  'pcmasterrace',
  'gaming',
  'LivestreamFail',
  
  // News and politics (controversial)
  'news',
  'worldnews',
  'politics',
  'Conservative',
  'WhitePeopleTwitter',
  'BlackPeopleTwitter'
];

/**
 * Engagement score calculation
 */
function calculateEngagementScore(post) {
  const score = post.score || 0;
  const comments = post.num_comments || 0;
  const awards = post.total_awards_received || 0;
  
  // Weight formula: upvotes + (comments * 3) + (awards * 100)
  // Comments are weighted higher because they indicate discussion
  // Awards are weighted highest because they cost real money
  return score + (comments * 3) + (awards * 100);
}

/**
 * Fetch posts from a subreddit
 */
async function fetchSubredditPosts(subreddit, timeframe = 'day', limit = 25) {
  const urls = [
    `https://www.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`,
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
    `https://www.reddit.com/r/${subreddit}/controversial.json?t=${timeframe}&limit=${limit}`
  ];
  
  const allPosts = [];
  
  for (const url of urls) {
    try {
      console.log(`📡 Fetching from r/${subreddit} (${url.includes('top') ? 'top' : url.includes('hot') ? 'hot' : 'controversial'})...`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ThreadJuice/1.0 (Viral Content Discovery)'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Failed to fetch ${url}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      const posts = data.data.children
        .filter(child => child.kind === 't3') // Only posts, not comments
        .map(child => ({
          ...child.data,
          engagement_score: calculateEngagementScore(child.data),
          source_sort: url.includes('top') ? 'top' : url.includes('hot') ? 'hot' : 'controversial'
        }));
      
      allPosts.push(...posts);
      
      // Rate limiting - Reddit allows 60 requests per minute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error fetching from r/${subreddit}:`, error.message);
    }
  }
  
  return allPosts;
}

/**
 * Check if post already exists in database
 */
async function postExists(supabase, redditId) {
  const { data, error } = await supabase
    .from('posts')
    .select('id')
    .eq('source_id', redditId)
    .single();
  
  return !!data;
}

/**
 * Filter posts for quality and virality
 */
function filterViralPosts(posts) {
  return posts.filter(post => {
    // Basic quality filters
    if (post.removed || post.locked) return false;
    if (post.score < 100) return false; // Minimum 100 upvotes
    if (post.num_comments < 20) return false; // Minimum 20 comments
    if (post.over_18 && !['relationship_advice', 'tifu'].includes(post.subreddit)) return false; // Allow NSFW only in certain subs
    
    // Content quality filters
    if (post.selftext && post.selftext.length < 100) return false; // Text posts need substance
    if (post.title.length < 20) return false; // Title too short
    
    // Engagement ratio check
    const engagementRatio = post.num_comments / (post.score / 100);
    if (engagementRatio < 0.5) return false; // Low discussion relative to upvotes
    
    return true;
  });
}

/**
 * Discover viral content across Reddit
 */
async function discoverViralContent(options = {}) {
  const {
    timeframe = 'day',
    limit = 10,
    subreddits = TARGET_SUBREDDITS,
    minEngagement = 5000
  } = options;
  
  console.log('🔍 Starting Reddit viral content discovery...');
  console.log(`📊 Timeframe: ${timeframe}, Min engagement: ${minEngagement}`);
  console.log(`📋 Monitoring ${subreddits.length} subreddits`);
  
  const allPosts = [];
  const supabase = getSupabase();
  
  // Fetch from each subreddit
  for (const subreddit of subreddits) {
    const posts = await fetchSubredditPosts(subreddit, timeframe, 50);
    allPosts.push(...posts);
    console.log(`✅ Found ${posts.length} posts from r/${subreddit}`);
  }
  
  // Filter and sort by engagement
  const viralPosts = filterViralPosts(allPosts)
    .filter(post => post.engagement_score >= minEngagement)
    .sort((a, b) => b.engagement_score - a.engagement_score);
  
  console.log(`\n🎯 Found ${viralPosts.length} viral posts above threshold`);
  
  // Check for duplicates and prepare for import
  const newPosts = [];
  for (const post of viralPosts.slice(0, limit)) {
    const exists = await postExists(supabase, post.id);
    if (!exists) {
      newPosts.push({
        reddit_id: post.id,
        url: `https://reddit.com${post.permalink}`,
        title: post.title,
        subreddit: post.subreddit,
        score: post.score,
        comments: post.num_comments,
        engagement_score: post.engagement_score,
        created_utc: post.created_utc,
        author: post.author,
        is_video: post.is_video,
        has_media: !!(post.preview?.images?.length || post.is_video),
        source_sort: post.source_sort
      });
    }
  }
  
  console.log(`\n📦 ${newPosts.length} new posts ready for import`);
  
  return newPosts;
}

/**
 * Import discovered posts to database
 */
async function importPosts(posts) {
  if (posts.length === 0) {
    console.log('⚠️  No new posts to import');
    return;
  }
  
  console.log(`\n🚀 Importing ${posts.length} viral posts...`);
  
  for (const post of posts) {
    try {
      console.log(`\n📝 Processing: "${post.title.slice(0, 60)}..."`);
      console.log(`   💬 r/${post.subreddit} | ⬆️ ${post.score} | 💭 ${post.comments} comments`);
      console.log(`   🔥 Engagement score: ${post.engagement_score}`);
      
      // Use the Reddit scraper to get full content
      const { execSync } = await import('child_process');
      execSync(`node scripts/scraping/scrape-reddit-story.js ${post.url}`, {
        stdio: 'inherit'
      });
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to import post:`, error.message);
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
      const timeframe = args[1] || 'day'; // hour, day, week, month, year, all
      const limit = parseInt(args[2]) || 10;
      
      const posts = await discoverViralContent({
        timeframe,
        limit,
        minEngagement: timeframe === 'hour' ? 1000 : 5000
      });
      
      if (args.includes('--dry-run')) {
        console.log('\n🔍 Dry run - found posts:');
        posts.forEach((post, i) => {
          console.log(`\n${i + 1}. ${post.title}`);
          console.log(`   r/${post.subreddit} | Score: ${post.score} | Comments: ${post.comments}`);
          console.log(`   ${post.url}`);
        });
      } else {
        await importPosts(posts);
      }
      
    } else if (command === 'monitor') {
      // Continuous monitoring mode
      console.log('👁️  Starting continuous monitoring mode...');
      
      const interval = parseInt(args[1]) || 30; // minutes
      
      const monitor = async () => {
        console.log(`\n⏰ Running discovery at ${new Date().toLocaleTimeString()}`);
        
        const posts = await discoverViralContent({
          timeframe: 'hour',
          limit: 5,
          minEngagement: 1000
        });
        
        await importPosts(posts);
        
        console.log(`\n💤 Next run in ${interval} minutes...`);
      };
      
      // Run immediately
      await monitor();
      
      // Then run on interval
      setInterval(monitor, interval * 60 * 1000);
      
    } else if (command === 'trending') {
      // Get trending from specific subreddits
      const subreddit = args[1];
      if (!subreddit) {
        console.error('❌ Please specify a subreddit');
        process.exit(1);
      }
      
      const posts = await discoverViralContent({
        timeframe: 'day',
        limit: 5,
        subreddits: [subreddit],
        minEngagement: 100
      });
      
      await importPosts(posts);
      
    } else {
      console.log('Usage:');
      console.log('  npm run discover:reddit discover [timeframe] [limit] [--dry-run]');
      console.log('  npm run discover:reddit monitor [interval-minutes]');
      console.log('  npm run discover:reddit trending <subreddit>');
      console.log('');
      console.log('Timeframes: hour, day, week, month, year, all');
      console.log('Example: npm run discover:reddit discover week 20');
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}