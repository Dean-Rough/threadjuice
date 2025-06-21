/**
 * Test Nitter Scraper Integration
 * Demonstrates the new social drama aggregator in action
 */

import { NextRequest, NextResponse } from 'next/server.js';
import { socialDramaAggregator } from '@/lib/socialDramaAggregator';
import { nitterScraper } from '@/lib/nitterScraper';
import { twitterToStoryConverter } from '@/lib/twitterToStoryConverter';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Testing Nitter scraper and social drama aggregator

    // Test 1: Quick health check of all systems
    // Checking system health
    const healthCheck = await socialDramaAggregator.getSystemHealth();

    // Test 2: Run smart drama detection (tries best available source)
    // Running smart drama detection
    const smartResults = await socialDramaAggregator.smartDramaDetection();

    // Test 3: Get quick drama check (fastest source)
    // Quick drama check
    const quickDramas = await socialDramaAggregator.getQuickDrama();

    // Test 4: Full aggregation from all sources
    // Full social drama aggregation
    const fullResults = await socialDramaAggregator.aggregateDramaContent();

    // Test 5: Convert best drama to ThreadJuice story if found
    let convertedStory = null;
    if (fullResults.best_dramas.length > 0) {
      // Converting best drama to ThreadJuice story
      const bestDrama = fullResults.best_dramas[0];
      convertedStory = await twitterToStoryConverter.convertDramaToStory(bestDrama);
    }

    // Test 6: Check Nitter instance health
    // Checking Nitter instance health
    const nitterHealth = await nitterScraper.checkInstanceHealth();

    const testResults = {
      success: true,
      execution_time: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      
      system_status: {
        twitter_api: healthCheck.twitter_api,
        nitter: healthCheck.nitter,
        overall: healthCheck.overall_status,
        working_instances: nitterHealth.filter(i => i.working).length,
        total_instances: nitterHealth.length
      },

      smart_detection: {
        source_used: smartResults.source_used,
        dramas_found: smartResults.dramas.length,
        backup_available: smartResults.backup_available,
        performance: smartResults.performance
      },

      quick_check: {
        dramas_found: quickDramas.length,
        high_quality_dramas: quickDramas.filter(d => d.drama_score >= 80).length
      },

      full_aggregation: {
        sources_attempted: fullResults.results.length,
        sources_successful: fullResults.results.filter(r => r.source !== 'failed').length,
        total_tweets_analyzed: fullResults.summary.total_tweets,
        drama_threads_found: fullResults.summary.drama_threads_found,
        recommended_stories: fullResults.summary.recommended_stories,
        conversion_rate: fullResults.summary.total_tweets > 0 ? 
          `${Math.round((fullResults.summary.drama_threads_found / fullResults.summary.total_tweets) * 100)}%` : '0%'
      },

      story_conversion: convertedStory ? {
        title: convertedStory.title,
        category: convertedStory.category,
        author: convertedStory.author,
        excerpt: convertedStory.excerpt,
        estimated_views: convertedStory.viewCount,
        trending_potential: convertedStory.trending
      } : null,

      nitter_instances: nitterHealth.map(instance => ({
        url: instance.instance,
        status: instance.working ? 'healthy' : 'down',
        response_time: `${instance.responseTime}ms`
      })),

      sample_dramas: fullResults.best_dramas.slice(0, 3).map(drama => ({
        topic: drama.topic,
        drama_score: drama.drama_score,
        participants: drama.participants.length,
        controversy_indicators: drama.controversy_indicators.slice(0, 2)
      })),

      recommendations: [
        fullResults.summary.total_tweets > 0 ? 
          `✅ Found ${fullResults.summary.total_tweets} tweets to analyze` :
          `⚠️ No tweets found - check Nitter instances`,
        
        healthCheck.overall_status === 'healthy' ?
          `✅ All systems operational` :
          healthCheck.overall_status === 'degraded' ?
          `⚠️ Some systems degraded - backup available` :
          `❌ All systems down - check API keys and Nitter instances`,
        
        fullResults.summary.recommended_stories > 0 ?
          `🎯 ${fullResults.summary.recommended_stories} high-quality stories ready for publication` :
          `💡 No high-quality dramas found - try different search terms`,

        nitterHealth.filter(i => i.working).length > 0 ?
          `🕸️ ${nitterHealth.filter(i => i.working).length}/${nitterHealth.length} Nitter instances working` :
          `❌ All Nitter instances down - scraping unavailable`
      ]
    };

    // Test completed
    
    return NextResponse.json(testResults, { status: 200 });

  } catch (error) {
    console.error('❌ Nitter test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      execution_time: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      debug_info: {
        error_type: error instanceof Error ? error.constructor.name : 'UnknownError',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
      }
    }, { status: 500 });
  }
}