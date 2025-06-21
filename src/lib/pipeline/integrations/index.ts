/**
 * Pipeline Service Integrations
 * 
 * Central export point for all service adapters.
 * These adapters bridge existing services with the pipeline architecture.
 */

export { redditAdapter, RedditAdapter } from './RedditAdapter';
export type { RedditFetchOptions } from './RedditAdapter';

export { openAIAdapter, OpenAIAdapter } from './OpenAIAdapter';
export type { StoryGenerationOptions, GeneratedStory, StorySection } from './OpenAIAdapter';

export { pexelsAdapter, PexelsAdapter } from './PexelsAdapter';
export type { ImageSearchOptions } from './PexelsAdapter';

export { klipyAdapter, KlipyAdapter } from './KlipyAdapter';
export type { GifSelectionOptions, EnhancedGifResult } from './KlipyAdapter';

export { twitterAdapter, TwitterAdapter } from './TwitterAdapter';
export type { TwitterFetchOptions, ProcessedTwitterThread } from './TwitterAdapter';

/**
 * Service availability checks
 */
export const checkServiceAvailability = () => {
  return {
    reddit: {
      available: !!process.env.REDDIT_CLIENT_ID && !!process.env.REDDIT_CLIENT_SECRET,
      message: 'Reddit API credentials required',
    },
    openai: {
      available: !!process.env.OPENAI_API_KEY,
      message: 'OpenAI API key required',
    },
    pexels: {
      available: !!process.env.PEXELS_API_KEY,
      message: 'Pexels API key required (images will use fallbacks)',
    },
    klipy: {
      available: true, // Klipy key is hardcoded in service
      message: 'Klipy service ready',
    },
    twitter: {
      available: twitterAdapter.isAvailable(),
      message: 'Twitter API credentials optional',
    },
  };
};

/**
 * Initialize all services
 */
export const initializeServices = async () => {
  const availability = checkServiceAvailability();
  
  console.log('🚀 Initializing pipeline services...');
  
  for (const [service, status] of Object.entries(availability)) {
    console.log(`  ${status.available ? '✅' : '⚠️'} ${service}: ${status.message}`);
  }

  // Pre-authenticate Reddit if available
  if (availability.reddit.available) {
    try {
      await redditAdapter.fetchPosts({ subreddit: 'test', limit: 1 });
      console.log('  ✅ Reddit authenticated successfully');
    } catch (error) {
      console.error('  ❌ Reddit authentication failed:', error);
    }
  }

  return availability;
};