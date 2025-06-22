#!/usr/bin/env node

/**
 * Twitter Story Scraper
 * Scrapes Twitter threads and drama for ThreadJuice stories
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
 * Determine if URL is a thread or single tweet
 */
function analyzeTwitterUrl(url) {
  const match = url.match(/twitter\.com\/([^\/]+)\/status\/(\d+)/);
  if (!match) {
    throw new Error('Invalid Twitter URL');
  }
  
  return {
    username: match[1],
    tweetId: match[2],
    url: url
  };
}

/**
 * Initialize Twitter API client
 */
function getTwitterClient() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    throw new Error('Missing TWITTER_BEARER_TOKEN in environment variables');
  }
  
  return new TwitterApi(bearerToken);
}

/**
 * Scrape Twitter thread (sequential tweets)
 */
async function scrapeTwitterThread(startUrl) {
  console.log(`🐦 Scraping Twitter thread: ${startUrl}`);
  
  try {
    const client = getTwitterClient();
    const urlInfo = analyzeTwitterUrl(startUrl);
    
    // Get the initial tweet
    const mainTweet = await client.v2.singleTweet(urlInfo.tweetId, {
      'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'conversation_id', 'attachments'],
      'expansions': ['author_id', 'attachments.media_keys'],
      'user.fields': ['name', 'username', 'verified'],
      'media.fields': ['url', 'preview_image_url', 'type']
    });
    
    if (!mainTweet.data) {
      throw new Error('Tweet not found or private');
    }
    
    // Get thread tweets (same author, same conversation) with media
    const threadSearch = await client.v2.search(
      `from:${mainTweet.includes.users[0].username} conversation_id:${mainTweet.data.conversation_id}`,
      {
        max_results: 50,
        'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'conversation_id', 'attachments'],
        'expansions': ['attachments.media_keys'],
        'media.fields': ['url', 'preview_image_url', 'type', 'width', 'height', 'duration_ms'],
        sort_order: 'recency'
      }
    );
    
    const threadTweets = (threadSearch.data && threadSearch.data.length > 0) ? threadSearch.data : [mainTweet.data];
    const author = mainTweet.includes.users[0];
    const allMedia = [...(mainTweet.includes?.media || []), ...(threadSearch.includes?.media || [])];
    const mediaMap = new Map(allMedia.map(m => [m.media_key, m]));
    
    console.log(`✅ Found thread with ${threadTweets.length} tweets by @${author.username}`);
    
    const processedTweets = threadTweets.map(tweet => {
      // Extract media for this tweet
      const tweetMedia = [];
      if (tweet.attachments?.media_keys) {
        tweet.attachments.media_keys.forEach(key => {
          const media = mediaMap.get(key);
          if (media) {
            tweetMedia.push({
              type: media.type,
              url: media.url || media.preview_image_url,
              width: media.width,
              height: media.height,
              duration: media.duration_ms
            });
          }
        });
      }
      
      return {
        id: tweet.id,
        username: author.username,
        content: tweet.text,
        timestamp: new Date(tweet.created_at),
        likes: tweet.public_metrics.like_count,
        retweets: tweet.public_metrics.retweet_count,
        replies: tweet.public_metrics.reply_count,
        media: tweetMedia,
        url: `https://twitter.com/${author.username}/status/${tweet.id}`
      };
    });
    
    const totalEngagement = processedTweets.reduce((sum, t) => sum + t.likes + t.retweets, 0);
    
    return {
      type: 'thread',
      author: `@${author.username}`,
      tweets: processedTweets,
      totalEngagement: totalEngagement
    };
  } catch (error) {
    console.error('Error scraping thread:', error);
    throw error;
  }
}

/**
 * Scrape Twitter drama (arguments/conversations)
 */
async function scrapeTwitterDrama(urls) {
  console.log(`⚔️ Scraping Twitter drama...`);
  
  const client = getTwitterClient();
  const conversation = [];
  const participants = new Set();
  
  // For each URL in the drama, fetch the tweet and context
  for (const url of urls) {
    try {
      const urlInfo = analyzeTwitterUrl(url);
      
      // Get the main tweet with media
      const mainTweet = await client.v2.singleTweet(urlInfo.tweetId, {
        'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'conversation_id', 'referenced_tweets', 'attachments'],
        'expansions': ['author_id', 'referenced_tweets.id', 'attachments.media_keys'],
        'user.fields': ['name', 'username', 'verified'],
        'media.fields': ['url', 'preview_image_url', 'type', 'width', 'height', 'duration_ms']
      });
      
      if (!mainTweet.data) continue;
      
      const author = mainTweet.includes.users[0];
      participants.add(`@${author.username}`);
      
      // Get replies and quotes for drama context with media
      const replies = await client.v2.search(
        `conversation_id:${mainTweet.data.conversation_id} -from:${author.username}`,
        {
          max_results: 50,
          'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'referenced_tweets', 'attachments'],
          'expansions': ['author_id', 'attachments.media_keys'],
          'user.fields': ['name', 'username'],
          'media.fields': ['url', 'preview_image_url', 'type', 'width', 'height', 'duration_ms']
        }
      );
      
      // Create media map for all tweets
      const allMedia = [...(mainTweet.includes?.media || []), ...(replies.includes?.media || [])];
      const mediaMap = new Map(allMedia.map(m => [m.media_key, m]));
      
      // Extract media for main tweet
      const mainTweetMedia = [];
      if (mainTweet.data.attachments?.media_keys) {
        mainTweet.data.attachments.media_keys.forEach(key => {
          const media = mediaMap.get(key);
          if (media) {
            mainTweetMedia.push({
              type: media.type,
              url: media.url || media.preview_image_url,
              width: media.width,
              height: media.height,
              duration: media.duration_ms
            });
          }
        });
      }
      
      // Add main tweet to conversation
      conversation.push({
        id: mainTweet.data.id,
        author: `@${author.username}`,
        content: mainTweet.data.text,
        replyTo: null,
        likes: mainTweet.data.public_metrics.like_count,
        retweets: mainTweet.data.public_metrics.retweet_count,
        quotes: mainTweet.data.public_metrics.quote_count,
        timestamp: new Date(mainTweet.data.created_at),
        media: mainTweetMedia
      });
      
      // Add replies to conversation
      if (replies.data) {
        const users = new Map(replies.includes.users.map(u => [u.id, u]));
        
        replies.data.forEach(reply => {
          const replyAuthor = users.get(reply.author_id);
          if (replyAuthor) {
            participants.add(`@${replyAuthor.username}`);
            
            // Extract media for this reply
            const replyMedia = [];
            if (reply.attachments?.media_keys) {
              reply.attachments.media_keys.forEach(key => {
                const media = mediaMap.get(key);
                if (media) {
                  replyMedia.push({
                    type: media.type,
                    url: media.url || media.preview_image_url,
                    width: media.width,
                    height: media.height,
                    duration: media.duration_ms
                  });
                }
              });
            }
            
            conversation.push({
              id: reply.id,
              author: `@${replyAuthor.username}`,
              content: reply.text,
              replyTo: reply.referenced_tweets?.[0]?.id || mainTweet.data.id,
              likes: reply.public_metrics.like_count,
              retweets: reply.public_metrics.retweet_count,
              quotes: reply.public_metrics.quote_count,
              timestamp: new Date(reply.created_at),
              media: replyMedia
            });
          }
        });
      }
      
      console.log(`✅ Found drama with ${conversation.length} tweets and ${participants.size} participants`);
      
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  
  return {
    type: 'drama',
    participants: Array.from(participants),
    conversation: conversation,
    totalEngagement: conversation.reduce((sum, t) => sum + t.likes + t.retweets, 0)
  };
}

/**
 * Convert Twitter thread to ThreadJuice story
 */
function convertThreadToStory(threadData) {
  const story = {
    title: `Twitter Thread: ${threadData.author}'s Viral Story`,
    slug: createSlug(`twitter-thread-${threadData.author}-${Date.now()}`),
    excerpt: threadData.tweets[0].content.slice(0, 200) + '...',
    category: 'social-media',
    status: 'published',
    trending: true,
    featured: false,
    author: 'Twitter Scraper',
    persona: {
      name: 'The Twitter Curator',
      avatar: '/assets/personas/twitter-curator.jpg',
      bio: 'Documenting the chaos of Twitter, one thread at a time'
    },
    content: {
      sections: []
    },
    imageUrl: '/assets/img/twitter-thread.jpg',
    sourceUrl: threadData.tweets[0].url || '#',
    sourceUsername: threadData.author,
    sourcePlatform: 'twitter',
    isScraped: true,
    viewCount: Math.floor(threadData.totalEngagement / 10),
    upvoteCount: threadData.totalEngagement,
    commentCount: threadData.tweets.reduce((sum, t) => sum + t.replies, 0),
    tags: ['twitter', 'thread', 'viral']
  };

  const sections = [];

  // Hero section
  sections.push({
    type: 'hero',
    content: `${threadData.author} posted a thread that's got everyone talking`,
    metadata: {
      author: threadData.author,
      engagement: threadData.totalEngagement
    }
  });

  // Add each tweet as a twitter_quote section
  threadData.tweets.forEach((tweet, index) => {
    sections.push({
      type: 'twitter_quote',
      content: tweet.content,
      metadata: {
        author: tweet.username,
        handle: tweet.username,
        timestamp: '2h',
        likes: tweet.likes,
        retweets: tweet.retweets,
        verified: tweet.likes > 10000
      }
    });

    // Add ALL media from the tweet
    if (tweet.media && tweet.media.length > 0) {
      tweet.media.forEach(media => {
        if (media.type === 'photo') {
          sections.push({
            type: 'image',
            content: `Image from @${tweet.username}'s tweet`,
            metadata: {
              image_url: media.url,
              attribution: `Posted by @${tweet.username}`,
              source: tweet.url,
              width: media.width,
              height: media.height
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
                title: `Video from @${tweet.username}`,
                platform: 'Twitter',
                confidence: 1.0,
                width: media.width,
                height: media.height,
                duration: media.duration
              }
            }
          });
        } else if (media.type === 'animated_gif') {
          sections.push({
            type: 'reaction_gif',
            content: `GIF from @${tweet.username}`,
            metadata: {
              gifUrl: media.url,
              width: media.width,
              height: media.height
            }
          });
        }
      });
    }
  });

  // Add commentary
  sections.push({
    type: 'terry_corner',
    title: "The Terry's Take",
    content: "Another day, another Twitter thread that could've been a blog post. But here we are, consuming content 280 characters at a time like digital crackheads."
  });

  // Outro
  sections.push({
    type: 'outro',
    content: `This thread garnered ${threadData.totalEngagement.toLocaleString()} total engagements. Twitter remains undefeated in the drama department.`
  });

  story.content.sections = sections;
  return story;
}

/**
 * Convert Twitter drama to ThreadJuice story
 */
function convertDramaToStory(dramaData) {
  const story = {
    title: `Twitter Drama: ${dramaData.participants.slice(0, 2).join(' vs ')}`,
    slug: createSlug(`twitter-drama-${Date.now()}`),
    excerpt: 'The gloves came off in this Twitter showdown...',
    category: 'drama',
    status: 'published',
    trending: true,
    featured: true,
    author: 'Twitter Scraper',
    persona: {
      name: 'The Drama Chronicler',
      avatar: '/assets/personas/drama-chronicler.jpg',
      bio: 'If it\'s messy and on Twitter, I\'m documenting it'
    },
    content: {
      sections: []
    },
    imageUrl: '/assets/img/twitter-drama.jpg',
    sourceUrl: '#',
    sourceUsername: dramaData.participants[0],
    sourcePlatform: 'twitter',
    isScraped: true,
    viewCount: Math.floor(dramaData.totalEngagement / 5),
    upvoteCount: dramaData.totalEngagement,
    commentCount: dramaData.conversation.length * 100,
    tags: ['twitter', 'drama', 'viral', 'argument']
  };

  const sections = [];

  // Hero section
  sections.push({
    type: 'hero',
    content: `When ${dramaData.participants.join(' and ')} started arguing, Twitter grabbed the popcorn`,
    metadata: {
      participants: dramaData.participants,
      engagement: dramaData.totalEngagement
    }
  });

  // Introduction
  sections.push({
    type: 'describe',
    title: 'The Setup',
    content: `What started as a simple tweet quickly escalated into a full-blown Twitter war. Here's how it all went down...`
  });

  // Add the conversation as a twitter conversation component
  sections.push({
    type: 'twitter-conversation',
    title: 'The Full Exchange',
    content: 'Read the tweets that set Twitter ablaze:',
    metadata: {
      conversation: dramaData.conversation.map(tweet => ({
        id: tweet.id,
        author: tweet.author,
        handle: tweet.author.replace('@', ''),
        content: tweet.content,
        timestamp: '2h',
        likes: tweet.likes,
        retweets: tweet.retweets,
        replies: tweet.quotes || 0,
        verified: tweet.likes > 20000,
        isOP: tweet.author === dramaData.participants[0]
      }))
    }
  });

  // Add any media from the conversation
  const mediaFound = dramaData.conversation.filter(t => t.media && t.media.length > 0);
  if (mediaFound.length > 0) {
    sections.push({
      type: 'describe',
      title: 'The Receipts',
      content: 'Of course, screenshots were involved. They always are.'
    });

    mediaFound.forEach(tweet => {
      tweet.media.forEach(mediaUrl => {
        sections.push({
          type: 'image',
          content: `Evidence posted by ${tweet.author}`,
          metadata: {
            image_url: mediaUrl,
            attribution: tweet.author,
            source: '#'
          }
        });
      });
    });
  }

  // Commentary
  sections.push({
    type: 'terry_corner',
    title: "The Terry's Take",
    content: "Watching grown adults have public meltdowns on Twitter is like watching a car crash in slow motion. You know you should look away, but you just can't. Pass the popcorn."
  });

  // Outro
  sections.push({
    type: 'outro',
    content: `Final score: ${dramaData.totalEngagement.toLocaleString()} engagements, countless quote tweets, and at least one person going private. Just another day on Twitter dot com.`
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
 * Save story to database
 */
async function saveToDatabase(story) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('posts')
    .insert([{
      ...story,
      content: JSON.stringify(story.content),
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
  const mode = args[0]; // 'thread' or 'drama'
  
  if (!mode || !['thread', 'drama'].includes(mode)) {
    console.error('❌ Please specify mode: thread or drama');
    console.log('Usage:');
    console.log('  Thread: npm run scrape:twitter thread <twitter-url>');
    console.log('  Drama:  npm run scrape:twitter drama <url1> <url2> ...');
    process.exit(1);
  }

  try {
    let story;

    if (mode === 'thread') {
      const threadUrl = args[1];
      if (!threadUrl || !threadUrl.includes('twitter.com')) {
        console.error('❌ Please provide a Twitter thread URL');
        process.exit(1);
      }

      // Scrape thread
      const threadData = await scrapeTwitterThread(threadUrl);
      console.log(`✅ Scraped thread with ${threadData.tweets.length} tweets`);
      
      // Convert to story
      story = convertThreadToStory(threadData);
      
    } else if (mode === 'drama') {
      const dramaUrls = args.slice(1).filter(url => url.includes('twitter.com'));
      if (dramaUrls.length === 0) {
        console.error('❌ Please provide at least one Twitter URL for the drama');
        process.exit(1);
      }

      // Scrape drama
      const dramaData = await scrapeTwitterDrama(dramaUrls);
      console.log(`✅ Scraped drama with ${dramaData.conversation.length} tweets`);
      
      // Convert to story
      story = convertDramaToStory(dramaData);
    }

    console.log(`📝 Converted to ThreadJuice story`);
    
    // Save to database
    await saveToDatabase(story);
    console.log(`✅ Saved to database: ${story.slug}`);
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