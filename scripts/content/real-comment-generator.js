/**
 * Real Comment Generator
 * Fetches actual comments from Reddit and Twitter for stories
 */

import { redditScraper } from '../scrapers/reddit-scraper.js';
import { twitterScraper } from '../scrapers/twitter-scraper.js';

/**
 * Generate real comments based on story context
 */
export async function generateRealComments(platform = 'reddit', storyContext = {}) {
  const { category = 'general', title = '', query = '' } = storyContext;
  
  console.log(`🔍 Fetching real ${platform} comments for: "${query || title}"`);
  
  try {
    switch (platform) {
      case 'reddit':
        return await generateRedditComments(query || title, category);
      
      case 'twitter':
        return await generateTwitterComments(query || title, category);
      
      case 'tiktok':
        // TikTok doesn't have easy scraping, use curated responses
        return generateTikTokStyleComments(category);
      
      default:
        console.log(`⚠️  Unknown platform ${platform}, using Reddit`);
        return await generateRedditComments(query || title, category);
    }
  } catch (error) {
    console.error(`❌ Error fetching real comments:`, error);
    // Fallback to template comments
    return generateFallbackComments(platform, category);
  }
}

/**
 * Get real Reddit comments
 */
async function generateRedditComments(query, category) {
  try {
    const comments = await redditScraper.getFormattedComments(query, category);
    
    if (comments.length > 0) {
      console.log(`✅ Found ${comments.length} real Reddit comments`);
      
      // Format for our comment component
      return comments.map(comment => ({
        content: comment.content,
        author: comment.author,
        upvotes: comment.upvotes,
        awards: comment.awards || 0,
        timestamp: '2h ago', // Reddit doesn't give exact times in .json
        isOP: comment.isOP || false
      }));
    }
    
    console.log('⚠️  No Reddit comments found, using fallback');
    return generateFallbackComments('reddit', category);
  } catch (error) {
    console.error('Reddit scraping error:', error);
    return generateFallbackComments('reddit', category);
  }
}

/**
 * Get real Twitter comments/replies
 */
async function generateTwitterComments(query, category) {
  try {
    const tweets = await twitterScraper.getFormattedTweets(query, category);
    
    if (tweets.length > 0) {
      console.log(`✅ Found ${tweets.length} real tweets`);
      
      // Return formatted for TwitterQuote component
      return tweets.map(tweet => ({
        content: tweet.content,
        author: tweet.author,
        handle: tweet.handle,
        timestamp: '2h',
        retweets: tweet.retweets,
        likes: tweet.likes,
        replies: tweet.replies,
        verified: tweet.verified,
        url: tweet.url,
        tweetId: tweet.tweetId
      }));
    }
    
    console.log('⚠️  No tweets found, using fallback');
    return generateFallbackComments('twitter', category);
  } catch (error) {
    console.error('Twitter scraping error:', error);
    return generateFallbackComments('twitter', category);
  }
}

/**
 * Generate TikTok-style comments (no easy scraping available)
 */
function generateTikTokStyleComments(category) {
  const tiktokComments = {
    general: [
      { content: 'WAIT WHAT?! I need part 47 immediately 😭', author: 'user93847', likes: 23456 },
      { content: 'Not me watching this whole saga instead of doing homework', author: 'procrastinator22', likes: 12345 },
      { content: 'This is better than Netflix I swear', author: 'bingewatcher', likes: 34567 },
      { content: 'The absolute CHAOS... I live for this drama', author: 'dramaqueen', likes: 45678 }
    ],
    celebrity: [
      { content: 'the way they thought we wouldn\'t notice 💀', author: 'detectivemode', likes: 56789 },
      { content: 'their PR team is STRESSED stressed', author: 'prnightmare', likes: 23456 },
      { content: 'bestie really said let me end my whole career', author: 'cancelled2023', likes: 34567 },
      { content: 'imagine being their manager rn', author: 'stressedaf', likes: 12345 }
    ],
    food: [
      { content: 'Gordon Ramsay has been real quiet since this dropped', author: 'foodcritic101', likes: 45678 },
      { content: 'jail. immediately. no trial.', author: 'foodpolice', likes: 34567 },
      { content: 'my ancestors are crying', author: 'traditional_foodie', likes: 23456 },
      { content: 'this is why I have trust issues', author: 'nevereatingout', likes: 12345 }
    ]
  };

  const comments = tiktokComments[category] || tiktokComments.general;
  
  return comments.map(c => ({
    ...c,
    timestamp: '2h ago',
    verified: c.likes > 30000
  }));
}

/**
 * Fallback comments when scraping fails
 */
function generateFallbackComments(platform, category) {
  console.log(`⚠️  Using fallback ${platform} comments for ${category}`);
  
  const fallbackTemplates = {
    reddit: {
      general: [
        { content: 'This is the kind of content I come to Reddit for. Pure gold.', author: 'redditor123', upvotes: 4523 },
        { content: 'OP delivered. What a wild ride from start to finish.', author: 'storytime_fan', upvotes: 3421 },
        { content: 'I was not prepared for that plot twist. Absolutely unhinged.', author: 'plot_twist_lover', upvotes: 2345 },
        { content: 'The fact that this actually happened... I can\'t even.', author: 'shocked_reader', upvotes: 1234 }
      ],
      celebrity: [
        { content: 'Celebrity PR teams are working overtime after this one.', author: 'pr_insider', upvotes: 5678 },
        { content: 'The way they thought they could control the narrative... hilarious.', author: 'media_watcher', upvotes: 4567 },
        { content: 'This is going to be in every tabloid by tomorrow.', author: 'gossip_guru', upvotes: 3456 },
        { content: 'Their publicist just quit after reading this, guaranteed.', author: 'industry_insider', upvotes: 2345 }
      ]
    },
    twitter: {
      general: [
        { content: 'This whole thread is unhinged and I\'m here for it', author: '@chaos_lover', likes: 12453, retweets: 3421 },
        { content: 'The way this escalated... I can\'t breathe 💀', author: '@dead_rn', likes: 9876, retweets: 2345 },
        { content: 'Quote tweeting for posterity before it gets deleted', author: '@archive_queen', likes: 7654, retweets: 1234 },
        { content: 'Not the plot twist in tweet 7/23 😭😭😭', author: '@plot_twist', likes: 5432, retweets: 987 }
      ]
    },
    tiktok: {
      general: [
        { content: 'WAIT WHAT?! I need part 47 immediately 😭', author: 'user93847', likes: 23456 },
        { content: 'Not me watching this whole saga instead of doing homework', author: 'procrastinator22', likes: 12345 },
        { content: 'This is better than Netflix I swear', author: 'bingewatcher', likes: 34567 },
        { content: 'The absolute CHAOS... I live for this drama', author: 'dramaqueen', likes: 45678 }
      ]
    }
  };

  const platformComments = fallbackTemplates[platform] || fallbackTemplates.reddit;
  const categoryComments = platformComments[category] || platformComments.general;
  
  return categoryComments.map(c => ({
    ...c,
    timestamp: '2h ago',
    awards: Math.floor(Math.random() * 5),
    isOP: false
  }));
}

export default generateRealComments;