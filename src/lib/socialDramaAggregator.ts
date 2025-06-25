/**
 * Social Drama Aggregator
 * Combines Twitter API and Nitter scraping for maximum drama coverage
 */

import { TwitterDramaData, DramaThread } from './twitterDramaDetector';
import { twitterApiClient } from './twitterApiClient';
import { nitterScraper } from './nitterScraper';
import { twitterDramaDetector } from './twitterDramaDetector';

export interface DramaSourceResult {
  source: 'twitter_api' | 'nitter' | 'failed';
  tweets: TwitterDramaData[];
  error?: string;
  metadata: {
    query_time: number;
    instance_used?: string;
    api_calls_remaining?: number;
  };
}

class SocialDramaAggregator {
  /**
   * Get drama content from all available sources
   */
  async aggregateDramaContent(): Promise<{
    results: DramaSourceResult[];
    best_dramas: DramaThread[];
    summary: {
      total_tweets: number;
      drama_threads_found: number;
      sources_used: string[];
      recommended_stories: number;
    };
  }> {
    console.log('🎭 Starting social drama aggregation...');

    const results: DramaSourceResult[] = [];

    // Try Twitter API first (if configured and not rate limited)
    const twitterResult = await this.tryTwitterAPI();
    results.push(twitterResult);

    // Try Nitter as backup/supplement
    const nitterResult = await this.tryNitter();
    results.push(nitterResult);

    // Combine all tweets
    const allTweets = results
      .filter(r => r.source !== 'failed')
      .flatMap(r => r.tweets);

    // Analyze for drama potential
    const dramaThreads = twitterDramaDetector.analyzeTrendingTopics(allTweets);

    // Sort by drama score
    const bestDramas = dramaThreads
      .sort((a, b) => b.drama_score - a.drama_score)
      .slice(0, 5); // Top 5 dramas

    const summary = {
      total_tweets: allTweets.length,
      drama_threads_found: dramaThreads.length,
      sources_used: results
        .filter(r => r.source !== 'failed')
        .map(r => r.source),
      recommended_stories: bestDramas.filter(d => d.drama_score >= 70).length,
    };

    console.log(
      `📊 Aggregation complete: ${summary.total_tweets} tweets, ${summary.drama_threads_found} dramas found`
    );

    return {
      results,
      best_dramas: bestDramas,
      summary,
    };
  }

  /**
   * Try Twitter API for drama content
   */
  private async tryTwitterAPI(): Promise<DramaSourceResult> {
    const startTime = Date.now();

    try {
      console.log('🔑 Attempting Twitter API...');

      // Check if API is configured and available
      if (!twitterApiClient.isConfigured()) {
        return {
          source: 'failed',
          tweets: [],
          error: 'Twitter API not configured',
          metadata: { query_time: Date.now() - startTime },
        };
      }

      // Try to get drama tweets
      const tweets = await twitterApiClient.searchDramaTweets({
        maxResults: 10,
        timeWindow: '4h',
      });

      console.log(`✅ Twitter API: ${tweets.length} tweets retrieved`);

      return {
        source: 'twitter_api',
        tweets,
        metadata: {
          query_time: Date.now() - startTime,
          api_calls_remaining: 'unknown', // Would need to track this
        },
      };
    } catch (error) {
      console.log(
        `❌ Twitter API failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      return {
        source: 'failed',
        tweets: [],
        error: error instanceof Error ? error.message : 'Twitter API error',
        metadata: { query_time: Date.now() - startTime },
      };
    }
  }

  /**
   * Try Nitter for drama content
   */
  private async tryNitter(): Promise<DramaSourceResult> {
    const startTime = Date.now();

    try {
      console.log('🕸️ Attempting Nitter scraping...');

      // Get drama content from Nitter
      const tweets = await nitterScraper.findDramaContent();

      console.log(`✅ Nitter: ${tweets.length} tweets scraped`);

      return {
        source: 'nitter',
        tweets,
        metadata: {
          query_time: Date.now() - startTime,
          instance_used: 'multiple', // Nitter tries multiple instances
        },
      };
    } catch (error) {
      console.log(
        `❌ Nitter failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      return {
        source: 'failed',
        tweets: [],
        error: error instanceof Error ? error.message : 'Nitter scraping error',
        metadata: { query_time: Date.now() - startTime },
      };
    }
  }

  /**
   * Get quick drama check (fastest available source)
   */
  async getQuickDrama(): Promise<DramaThread[]> {
    console.log('⚡ Quick drama check...');

    // Try Nitter first (usually faster and no rate limits)
    try {
      const tweets = await nitterScraper.searchDramaTweets({
        query: 'ratio OR "unpopular opinion" OR "hot take"',
        maxResults: 15,
      });

      if (tweets.length > 0) {
        const dramas = twitterDramaDetector.analyzeTrendingTopics(tweets);
        return dramas.filter(d => d.drama_score >= 60);
      }
    } catch (error) {
      console.log('⚠️ Quick Nitter check failed, trying Twitter API...');
    }

    // Fallback to Twitter API
    try {
      const tweets = await twitterApiClient.searchDramaTweets({
        maxResults: 10,
        timeWindow: '2h',
      });

      const dramas = twitterDramaDetector.analyzeTrendingTopics(tweets);
      return dramas.filter(d => d.drama_score >= 60);
    } catch (error) {
      console.log('❌ Both quick sources failed');
      return [];
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    twitter_api: { available: boolean; error?: string };
    nitter: { available: boolean; working_instances: number; error?: string };
    overall_status: 'healthy' | 'degraded' | 'down';
  }> {
    // Check Twitter API
    const twitterHealth = {
      available: false,
      error: undefined as string | undefined,
    };
    try {
      if (twitterApiClient.isConfigured()) {
        // Quick test call with minimum required results
        await twitterApiClient.searchDramaTweets({ maxResults: 10 });
        twitterHealth.available = true;
      } else {
        twitterHealth.error = 'Not configured';
      }
    } catch (error) {
      twitterHealth.error =
        error instanceof Error ? error.message : 'Unknown error';
    }

    // Check Nitter instances
    const nitterHealth = {
      available: false,
      working_instances: 0,
      error: undefined as string | undefined,
    };
    try {
      const instanceHealth = await nitterScraper.checkInstanceHealth();
      nitterHealth.working_instances = instanceHealth.filter(
        i => i.working
      ).length;
      nitterHealth.available = nitterHealth.working_instances > 0;

      if (!nitterHealth.available) {
        nitterHealth.error = 'All Nitter instances down';
      }
    } catch (error) {
      nitterHealth.error =
        error instanceof Error ? error.message : 'Health check failed';
    }

    // Determine overall status
    let overall_status: 'healthy' | 'degraded' | 'down';
    if (twitterHealth.available && nitterHealth.available) {
      overall_status = 'healthy';
    } else if (twitterHealth.available || nitterHealth.available) {
      overall_status = 'degraded';
    } else {
      overall_status = 'down';
    }

    return {
      twitter_api: twitterHealth,
      nitter: nitterHealth,
      overall_status,
    };
  }

  /**
   * Smart drama detection - uses best available source
   */
  async smartDramaDetection(): Promise<{
    dramas: DramaThread[];
    source_used: string;
    backup_available: boolean;
    performance: {
      query_time: number;
      tweets_analyzed: number;
      drama_conversion_rate: string;
    };
  }> {
    const startTime = Date.now();
    let tweets: TwitterDramaData[] = [];
    let sourceUsed = 'none';
    let backupAvailable = false;

    // Strategy 1: Try Twitter API if available and not rate limited
    try {
      if (twitterApiClient.isConfigured()) {
        tweets = await twitterApiClient.searchDramaTweets({ maxResults: 10 });
        sourceUsed = 'twitter_api';
        backupAvailable = true; // Nitter is always backup
        console.log(
          `✅ Smart detection: Twitter API (${tweets.length} tweets)`
        );
      }
    } catch (error) {
      console.log('⚠️ Twitter API unavailable, using Nitter...');
    }

    // Strategy 2: Use Nitter if Twitter API failed or unavailable
    if (tweets.length === 0) {
      try {
        tweets = await nitterScraper.findDramaContent();
        sourceUsed = 'nitter';
        console.log(`✅ Smart detection: Nitter (${tweets.length} tweets)`);
      } catch (error) {
        console.log('❌ Nitter also failed');
      }
    }

    // Analyze drama potential
    const dramas = twitterDramaDetector.analyzeTrendingTopics(tweets);
    const highQualityDramas = dramas.filter(d => d.drama_score >= 70);

    const performance = {
      query_time: Date.now() - startTime,
      tweets_analyzed: tweets.length,
      drama_conversion_rate:
        tweets.length > 0
          ? `${Math.round((dramas.length / tweets.length) * 100)}%`
          : '0%',
    };

    return {
      dramas: highQualityDramas,
      source_used: sourceUsed,
      backup_available: backupAvailable,
      performance,
    };
  }
}

// Export singleton instance
export const socialDramaAggregator = new SocialDramaAggregator();
export default socialDramaAggregator;
