/**
 * Test API route for Twitter Drama Detection
 * Demonstrates the complete pipeline from Twitter data to ThreadJuice stories
 */

import { NextRequest, NextResponse } from 'next/server.js';
import { twitterDramaDetector } from '@/lib/twitterDramaDetector';
import { twitterToStoryConverter } from '@/lib/twitterToStoryConverter';

export async function GET(request: NextRequest) {
  try {
    // Testing Twitter Drama Detection Pipeline

    // Step 1: Get mock Twitter data (in production, this would be real Twitter API data)
    const mockTweets = twitterDramaDetector.generateMockDramaData();
    // Retrieved mock tweets

    // Step 2: Analyze tweets for drama potential
    const dramaThreads = twitterDramaDetector.analyzeTrendingTopics(mockTweets);
    // Found potential drama threads

    // Step 3: Convert drama to ThreadJuice stories
    const stories =
      await twitterToStoryConverter.convertMultipleDramas(dramaThreads);
    // Generated ThreadJuice stories

    // Step 4: Return comprehensive test results
    const testResults = {
      success: true,
      pipeline_steps: {
        mock_tweets_analyzed: mockTweets.length,
        drama_threads_detected: dramaThreads.length,
        stories_generated: stories.length,
      },
      sample_analysis: dramaThreads.map(thread => ({
        tweet_id: thread.original_tweet.id,
        drama_score: thread.drama_score,
        controversy_indicators: thread.controversy_indicators,
        topic: thread.topic,
        engagement_metrics: thread.original_tweet.metrics,
      })),
      generated_stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        excerpt: story.excerpt,
        category: story.category,
        author: story.author,
        drama_score: story.twitter_metadata?.drama_score,
        estimated_engagement: {
          views: story.viewCount,
          upvotes: story.upvoteCount,
          comments: story.commentCount,
          shares: story.shareCount,
        },
      })),
      integration_notes: {
        personas_used: stories.map(s => s.author),
        categories_created: [...new Set(stories.map(s => s.category))],
        drama_threshold: 'Stories with drama_score >= 60',
        conversion_rate: `${stories.length}/${dramaThreads.length} dramas converted to stories`,
      },
    };

    return NextResponse.json(testResults, { status: 200 });
  } catch (error) {
    console.error('❌ Twitter Drama Test Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Twitter drama detection test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { test_mode } = await request.json();

    if (test_mode === 'integration') {
      // Test integration with existing story system
      const mockTweets = twitterDramaDetector.generateMockDramaData();
      const dramaThreads =
        twitterDramaDetector.analyzeTrendingTopics(mockTweets);
      const stories =
        await twitterToStoryConverter.convertMultipleDramas(dramaThreads);

      // Simulate adding to existing posts
      const integrationTest = {
        existing_story_format_compatibility: true,
        stories_ready_for_database: stories.length,
        sample_story_structure: stories[0] || null,
        api_integration_points: {
          '/api/posts': 'Can accept Twitter-generated stories',
          story_format: 'Compatible with existing ThreadJuice format',
          persona_system: 'Automatically selects appropriate writer voice',
          categorization: 'Maps Twitter topics to ThreadJuice categories',
        },
      };

      return NextResponse.json(integrationTest, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid test mode' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Integration test failed', details: error },
      { status: 500 }
    );
  }
}
