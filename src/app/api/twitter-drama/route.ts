/**
 * Real-Time Twitter Drama Detection API
 * Fetches live Twitter data and converts high-drama tweets to ThreadJuice stories
 */

import { NextRequest, NextResponse } from 'next/server';
import { twitterApiClient } from '@/lib/twitterApiClient';
import { twitterDramaDetector } from '@/lib/twitterDramaDetector';
import { twitterToStoryConverter } from '@/lib/twitterToStoryConverter';
import { twitterRateLimiter } from '@/lib/twitterRateLimiter';

export async function GET(request: NextRequest) {
  try {
    console.log('🎭 Starting real-time Twitter drama detection...');
    
    // Check for testing override
    const { searchParams } = new URL(request.url);
    const forceRun = searchParams.get('force') === 'true';
    
    // Check rate limits first (FREE TIER: 100 calls/month)
    const rateLimitCheck = twitterRateLimiter.shouldRunDramaDetection();
    if (!rateLimitCheck.should_run && !forceRun) {
      const usageStats = twitterRateLimiter.getUsageStats();
      const timing = twitterRateLimiter.getOptimalCallTiming();
      
      return NextResponse.json({
        success: false,
        error: 'Rate limit protection',
        message: rateLimitCheck.reason,
        rate_limit_info: {
          monthly_usage: usageStats.monthly,
          daily_usage: usageStats.daily,
          optimal_timing: timing,
          free_tier_limits: {
            monthly_limit: 100,
            recommended_daily_limit: 3
          }
        }
      }, { status: 429 });
    }
    
    // Check Twitter API configuration
    const config = twitterApiClient.getConfig();
    if (!config.configured) {
      return NextResponse.json({
        success: false,
        error: 'Twitter API not configured',
        message: 'Please add your Twitter API credentials to environment variables',
        required_env_vars: [
          'TWITTER_BEARER_TOKEN',
          'TWITTER_DRAMA_ENABLED=true'
        ]
      }, { status: 400 });
    }

    console.log('✅ Twitter API configured and within rate limits, fetching drama tweets...');

    // Fetch recent high-engagement tweets (conservative limits for free tier)
    const twitterTweets = await twitterApiClient.searchDramaTweets({
      timeWindow: '4h', // Longer window to catch more drama
      maxResults: 10    // Small batch for free tier
    });

    console.log(`📥 Retrieved ${twitterTweets.length} tweets from Twitter API`);

    if (twitterTweets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tweets found in current time window',
        drama_threads: [],
        stories_generated: [],
        config
      });
    }

    // Analyze tweets for drama potential
    const dramaThreads = twitterDramaDetector.analyzeTrendingTopics(twitterTweets);
    console.log(`🔥 Detected ${dramaThreads.length} potential drama threads`);

    // Convert high-drama threads to ThreadJuice stories
    const stories = await twitterToStoryConverter.convertMultipleDramas(dramaThreads);
    console.log(`📝 Generated ${stories.length} ThreadJuice stories`);

    // Return comprehensive results
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      source: 'live_twitter_api',
      pipeline_stats: {
        tweets_analyzed: twitterTweets.length,
        drama_threads_detected: dramaThreads.length,
        stories_generated: stories.length,
        conversion_rate: `${Math.round((stories.length / Math.max(twitterTweets.length, 1)) * 100)}%`
      },
      drama_analysis: dramaThreads.map(thread => ({
        tweet_id: thread.original_tweet.id,
        tweet_preview: thread.original_tweet.text.substring(0, 100) + '...',
        drama_score: thread.drama_score,
        engagement: {
          likes: thread.original_tweet.metrics.likes,
          retweets: thread.original_tweet.metrics.retweets,
          replies: thread.original_tweet.metrics.replies,
          quotes: thread.original_tweet.metrics.quotes
        },
        controversy_indicators: thread.controversy_indicators,
        topic: thread.topic,
        author: `@${thread.original_tweet.author.username}`
      })),
      generated_stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        category: story.category,
        author: story.author,
        trending: story.trending,
        featured: story.featured,
        drama_score: story.twitter_metadata?.drama_score,
        estimated_engagement: {
          views: story.viewCount,
          upvotes: story.upvoteCount,
          comments: story.commentCount,
          shares: story.shareCount
        }
      })),
      config: {
        drama_enabled: config.dramaEnabled,
        max_stories_per_day: config.maxStoriesPerDay,
        min_engagement_threshold: config.minEngagement,
        min_drama_score: config.minDramaScore
      }
    };

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('❌ Twitter drama detection failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Twitter drama detection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, options } = await request.json();

    switch (action) {
      case 'setup_stream_rules':
        // Configure Twitter streaming rules for real-time drama detection
        await twitterApiClient.setupDramaStreamRules();
        
        return NextResponse.json({
          success: true,
          message: 'Twitter drama stream rules configured',
          action: 'setup_stream_rules'
        });

      case 'test_credentials':
        // Test Twitter API credentials
        const config = twitterApiClient.getConfig();
        
        if (!config.configured) {
          return NextResponse.json({
            success: false,
            error: 'Twitter API credentials missing',
            config
          }, { status: 400 });
        }

        // Try a simple API call to verify credentials work
        try {
          const testTweets = await twitterApiClient.searchDramaTweets({
            maxResults: 10
          });
          
          return NextResponse.json({
            success: true,
            message: 'Twitter API credentials working',
            test_results: {
              tweets_retrieved: testTweets.length,
              api_accessible: true
            },
            config
          });
        } catch (apiError) {
          return NextResponse.json({
            success: false,
            error: 'Twitter API credentials invalid or expired',
            details: apiError instanceof Error ? apiError.message : 'API test failed',
            config
          }, { status: 401 });
        }

      case 'get_trending_topics':
        // Get current trending topics for drama monitoring
        const trends = await twitterApiClient.getTrendingTopics();
        
        return NextResponse.json({
          success: true,
          trending_topics: trends.slice(0, 10).map(trend => ({
            name: trend.name,
            tweet_volume: trend.tweet_volume,
            url: trend.url
          })),
          action: 'get_trending_topics'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          available_actions: [
            'setup_stream_rules',
            'test_credentials', 
            'get_trending_topics'
          ]
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Twitter drama POST action failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Action failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}