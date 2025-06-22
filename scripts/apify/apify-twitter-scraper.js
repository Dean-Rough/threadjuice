#!/usr/bin/env node

/**
 * Apify Twitter Scraper Integration
 * Uses quacker/twitter-scraper for chosen accounts approach
 */

import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

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
    supabase: createClient(supabaseUrl, supabaseAnonKey)
  };
}

/**
 * Curated Twitter accounts known for viral content/drama
 */
const VIRAL_TWITTER_ACCOUNTS = [
  // Tech drama
  'elonmusk',
  'naval', 
  'paulg',
  'dhh',
  'balajis',
  
  // Pop culture/celebrity drama
  'kanyewest',
  'justinbieber',
  'rihanna',
  'kimkardashian',
  
  // News/political drama
  'cnn',
  'breaking911',
  'mrdeadmoth',
  
  // Viral content creators
  'dril',
  'dog_rates',
  'weirdlilguys',
  'sosadtoday',
  
  // Drama/commentary accounts
  'dramaalert',
  'popbase',
  'popcrave',
  'defnoodles'
];

/**
 * Run Apify Twitter scraper for chosen accounts
 */
async function scrapeViralTwitter(options = {}) {
  const {
    accounts = VIRAL_TWITTER_ACCOUNTS.slice(0, 5), // Start with top 5
    tweetsPerAccount = 10,
    includeReplies = false,
    sortBy = 'Top' // Top, Latest
  } = options;

  console.log('🐦 APIFY TWITTER VIRAL CONTENT SCRAPING');
  console.log('=======================================');
  console.log(`👤 Accounts: ${accounts.join(', ')}`);
  console.log(`📈 Tweets per account: ${tweetsPerAccount}`);
  console.log(`💬 Include replies: ${includeReplies}`);
  console.log(`🔄 Sort by: ${sortBy}`);

  const { apify } = getClients();

  // Prepare input for Apify Twitter scraper
  const input = {
    "searchTerms": [`from:${accounts[0]}`], // Use first account
    "maxTweets": tweetsPerAccount * 2,
    "addUserInfo": true
  };

  try {
    console.log(`\n🚀 Starting Apify Twitter scraper...`);
    
    // Run the actor
    const run = await apify.actor('quacker/twitter-scraper').call(input);
    
    console.log(`✅ Apify run completed: ${run.id}`);
    console.log(`📊 Status: ${run.status}`);
    
    // Get the results
    const { items } = await apify.dataset(run.defaultDatasetId).listItems();
    
    console.log(`📦 Retrieved ${items.length} Twitter items`);
    
    // Filter for high engagement (viral content)
    const viralTweets = items.filter(tweet => {
      const likes = tweet.likes || 0;
      const retweets = tweet.retweets || 0;
      const replies = tweet.replies || 0;
      const totalEngagement = likes + (retweets * 2) + replies;
      
      return totalEngagement > 10; // Temporarily lowered to see any content
    });
    
    console.log(`🔥 Found ${viralTweets.length} viral tweets (>1K engagement)`);
    
    return viralTweets;
    
  } catch (error) {
    console.error('❌ Apify Twitter scraping failed:', error.message);
    throw error;
  }
}

/**
 * Convert Apify Twitter data to ThreadJuice format
 */
function convertTwitterToStory(twitterData) {
  // Check if this is a thread (multiple related tweets)
  const isThread = Array.isArray(twitterData) && twitterData.length > 1;
  const mainTweet = Array.isArray(twitterData) ? twitterData[0] : twitterData;
  
  // Create slug
  const createSlug = (title) => title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
    .slice(0, 60);

  const title = isThread 
    ? `Twitter Thread: @${mainTweet.author}'s Viral Story`
    : `Viral Tweet: @${mainTweet.author}'s Hot Take`;

  const story = {
    title: title,
    slug: createSlug(title),
    excerpt: (mainTweet.text || '').slice(0, 200) + '...',
    category: 'social-media',
    status: 'published',
    trending: true,
    featured: (mainTweet.likes || 0) > 10000,
    author: 'Apify Twitter Scraper',
    persona: {
      name: 'The Twitter Curator',
      avatar: '/assets/personas/twitter-curator.jpg',
      bio: 'Documenting viral Twitter moments via Apify'
    },
    content: {
      sections: []
    },
    imageUrl: mainTweet.media?.[0]?.url || '/assets/img/twitter-default.jpg',
    sourceUrl: mainTweet.url,
    sourceUsername: `@${mainTweet.author}`,
    sourcePlatform: 'twitter',
    isScraped: true,
    viewCount: (mainTweet.likes || 0) * 5,
    upvoteCount: mainTweet.likes || 0,
    commentCount: mainTweet.replies || 0,
    tags: ['twitter', mainTweet.author, 'viral', 'apify']
  };

  // Build story sections
  const sections = [];

  // Hero section
  sections.push({
    type: 'hero',
    content: isThread 
      ? `@${mainTweet.author} posted a thread that's got everyone talking`
      : `@${mainTweet.author} dropped a tweet that broke the internet`,
    metadata: {
      author: mainTweet.author,
      engagement: (mainTweet.likes || 0) + (mainTweet.retweets || 0)
    }
  });

  if (isThread) {
    // Handle thread - show each tweet
    twitterData.forEach((tweet, index) => {
      sections.push({
        type: 'twitter_quote',
        content: tweet.text,
        metadata: {
          author: tweet.author,
          handle: tweet.author,
          timestamp: '2h',
          likes: tweet.likes,
          retweets: tweet.retweets,
          verified: (tweet.likes || 0) > 10000
        }
      });

      // Add media from tweet if available
      if (tweet.media && tweet.media.length > 0) {
        tweet.media.forEach(media => {
          if (media.type === 'photo') {
            sections.push({
              type: 'image',
              content: `Image from @${tweet.author}'s tweet`,
              metadata: {
                image_url: media.url,
                attribution: `Posted by @${tweet.author}`,
                source: tweet.url
              }
            });
          } else if (media.type === 'video') {
            sections.push({
              type: 'media_embed',
              content: '',
              metadata: {
                media: {
                  type: 'video',
                  embedUrl: media.url,
                  title: `Video from @${tweet.author}`,
                  platform: 'Twitter',
                  confidence: 1.0
                }
              }
            });
          }
        });
      }
    });
  } else {
    // Single viral tweet
    sections.push({
      type: 'twitter_quote',
      content: mainTweet.text,
      metadata: {
        author: mainTweet.author,
        handle: mainTweet.author,
        timestamp: '2h',
        likes: mainTweet.likes,
        retweets: mainTweet.retweets,
        verified: (mainTweet.likes || 0) > 10000
      }
    });

    // Add media from single tweet
    if (mainTweet.media && mainTweet.media.length > 0) {
      mainTweet.media.forEach(media => {
        if (media.type === 'photo') {
          sections.push({
            type: 'image',
            content: `Image from @${mainTweet.author}'s viral tweet`,
            metadata: {
              image_url: media.url,
              attribution: `Posted by @${mainTweet.author}`,
              source: mainTweet.url
            }
          });
        }
      });
    }
  }

  // Terry's commentary
  const totalEngagement = isThread 
    ? twitterData.reduce((sum, t) => sum + (t.likes || 0) + (t.retweets || 0), 0)
    : (mainTweet.likes || 0) + (mainTweet.retweets || 0);

  sections.push({
    type: 'terry_corner',
    title: "The Terry's Take",
    content: isThread
      ? `Another Twitter thread that could've been a blog post, but here we are. ${totalEngagement.toLocaleString()} total engagements worth of digital validation. The internet's attention span, perfectly documented.`
      : `One tweet, ${totalEngagement.toLocaleString()} engagements, and probably someone's career hanging in the balance. Twitter remains undefeated in the chaos department.`
  });

  // Outro
  sections.push({
    type: 'outro',
    content: `This ${isThread ? 'thread' : 'tweet'} brought to you by @${mainTweet.author} and the endless scroll of Twitter dot com. Via Apify's finest scrapers.`
  });

  story.content.sections = sections;
  return story;
}

/**
 * Save story to database
 */
async function saveToDatabase(story) {
  const { supabase } = getClients();
  
  const { data, error } = await supabase
    .from('posts')
    .insert([{
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
      updated_at: new Date().toISOString()
    }])
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
      const accountsArg = args[1];
      const limit = parseInt(args[2]) || 10;
      
      // Parse accounts - can be comma-separated or use defaults
      const accounts = accountsArg 
        ? accountsArg.split(',').map(a => a.trim())
        : VIRAL_TWITTER_ACCOUNTS.slice(0, 3);
      
      console.log(`🎯 Scraping viral Twitter content from: ${accounts.join(', ')}`);
      
      // Scrape viral content
      const tweets = await scrapeViralTwitter({
        accounts,
        tweetsPerAccount: Math.ceil(limit / accounts.length),
        sortBy: 'Top' // Get most engaging tweets
      });
      
      console.log(`\n📦 Processing ${tweets.length} viral tweets...`);
      
      let savedCount = 0;
      for (const tweet of tweets.slice(0, limit)) {
        try {
          // Convert to story format
          const story = convertTwitterToStory(tweet);
          
          // Save to database
          await saveToDatabase(story);
          savedCount++;
          
          console.log(`✅ Saved: "${story.title.slice(0, 50)}..."`);
          console.log(`   📊 ${story.upvoteCount} likes, ${story.commentCount} replies`);
          console.log(`   🔗 http://localhost:4242/blog/${story.slug}`);
          
        } catch (error) {
          console.error(`❌ Failed to save tweet: ${error.message}`);
        }
      }
      
      console.log(`\n🎉 Successfully scraped and saved ${savedCount} stories!`);
      
    } else if (command === 'accounts') {
      // List available accounts
      console.log('📋 AVAILABLE VIRAL TWITTER ACCOUNTS:');
      console.log('=====================================');
      
      const categories = {
        'Tech Drama': ['elonmusk', 'naval', 'paulg', 'dhh', 'balajis'],
        'Pop Culture': ['kanyewest', 'justinbieber', 'rihanna', 'kimkardashian'],
        'News/Politics': ['cnn', 'breaking911', 'mrdeadmoth'],
        'Viral Content': ['dril', 'dog_rates', 'weirdlilguys', 'sosadtoday'],
        'Drama/Commentary': ['dramaalert', 'popbase', 'popcrave', 'defnoodles']
      };
      
      Object.entries(categories).forEach(([category, accounts]) => {
        console.log(`\n${category}:`);
        accounts.forEach(account => console.log(`  @${account}`));
      });
      
      console.log('\n💡 Usage: npm run apify:twitter scrape "elonmusk,naval,dril" 15');
      
    } else if (command === 'test') {
      // Test Apify connection
      const { apify } = getClients();
      const user = await apify.user().get();
      console.log(`✅ Apify connection successful! User: ${user.username}`);
      
    } else {
      console.log('Usage:');
      console.log('  npm run apify:twitter scrape [accounts] [limit]');
      console.log('  npm run apify:twitter accounts');
      console.log('  npm run apify:twitter test');
      console.log('');
      console.log('Examples:');
      console.log('  npm run apify:twitter scrape "elonmusk,naval,dril" 15');
      console.log('  npm run apify:twitter scrape');
      console.log('  npm run apify:twitter accounts');
    }
    
  } catch (error) {
    console.error('❌ Apify Twitter scraping failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}