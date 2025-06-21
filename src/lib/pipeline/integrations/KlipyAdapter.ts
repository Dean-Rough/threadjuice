/**
 * Klipy GIF Adapter for Pipeline Integration
 * 
 * Bridges the existing KlipyService with the pipeline architecture.
 * Handles emotion-based GIF selection with caching and fallbacks.
 */

import { giphyService, KlipyService, GifResult, GifSearchOptions } from '@/lib/klipyService';
import { EmotionalAnalysis } from '@/lib/sentimentAnalyzer';

export interface GifSelectionOptions {
  maxGifs?: number;
  safeSearch?: boolean;
  preferredAspectRatio?: number;
  cacheResults?: boolean;
}

export interface EnhancedGifResult extends GifResult {
  emotion: string;
  context: string;
  relevanceScore: number;
}

export class KlipyAdapter {
  private service: KlipyService;
  private emotionSearchCache: Map<string, GifResult[]> = new Map();

  constructor() {
    this.service = giphyService;
  }

  /**
   * Find reaction GIFs based on emotional analysis
   */
  async findReactionGifs(
    emotions: EmotionalAnalysis[],
    options: GifSelectionOptions = {}
  ): Promise<EnhancedGifResult[]> {
    const { maxGifs = 3, safeSearch = true } = options;
    const gifs: EnhancedGifResult[] = [];

    // Process emotions in order of intensity
    const sortedEmotions = [...emotions]
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, maxGifs);

    console.log(`🎭 Finding GIFs for ${sortedEmotions.length} emotions`);

    for (const [index, emotion] of sortedEmotions.entries()) {
      try {
        const gif = await this.findGifForEmotion(emotion, { safeSearch });
        
        if (gif) {
          gifs.push({
            ...gif,
            emotion: emotion.emotion,
            context: emotion.context,
            relevanceScore: this.calculateRelevance(gif, emotion),
          });
          console.log(`✅ Found GIF for ${emotion.emotion}`);
        }

        // Rate limiting between API calls
        if (index < sortedEmotions.length - 1) {
          await this.delay(500);
        }
      } catch (error) {
        console.error(`❌ Failed to find GIF for ${emotion.emotion}:`, error);
      }
    }

    return gifs;
  }

  /**
   * Find a single GIF for an emotion
   */
  private async findGifForEmotion(
    emotion: EmotionalAnalysis,
    options: { safeSearch: boolean }
  ): Promise<GifResult | null> {
    const cacheKey = `${emotion.emotion}-${options.safeSearch}`;

    // Check cache first
    const cached = this.getCachedGifs(cacheKey);
    if (cached.length > 0) {
      return this.selectFromCache(cached, emotion);
    }

    try {
      // Search with Klipy service
      const searchOptions: GifSearchOptions = {
        emotion: emotion.emotion,
        searchTerms: emotion.giffSearchTerms,
        context: emotion.context,
        safeSearch: options.safeSearch,
        intensity: emotion.intensity,
        limit: 10, // Get more for better selection
      };

      const result = await this.service.searchReactionGif(searchOptions);

      if (result) {
        // Cache for future use
        this.addToCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error(`Klipy search failed for ${emotion.emotion}:`, error);
      
      // Try fallback search with simpler terms
      return this.fallbackSearch(emotion, options);
    }
  }

  /**
   * Fallback search with simplified terms
   */
  private async fallbackSearch(
    emotion: EmotionalAnalysis,
    options: { safeSearch: boolean }
  ): Promise<GifResult | null> {
    // Simplified search terms for better results
    const fallbackTerms = this.generateFallbackTerms(emotion.emotion);

    console.log(`🔄 Trying fallback search with: ${fallbackTerms.join(', ')}`);

    try {
      const result = await this.service.searchReactionGif({
        emotion: emotion.emotion,
        searchTerms: fallbackTerms,
        context: 'reaction',
        safeSearch: options.safeSearch,
        limit: 5,
      });

      return result;
    } catch (error) {
      console.error('Fallback search also failed:', error);
      return null;
    }
  }

  /**
   * Generate fallback search terms based on emotion
   */
  private generateFallbackTerms(emotion: string): string[] {
    const fallbackMap: Record<string, string[]> = {
      'shocked': ['omg', 'surprised', 'wow', 'shock'],
      'amused': ['funny', 'laugh', 'lol', 'hilarious'],
      'outraged': ['angry', 'mad', 'furious', 'rage'],
      'satisfied': ['happy', 'pleased', 'smile', 'yes'],
      'awkward': ['cringe', 'uncomfortable', 'embarrassed'],
      'confused': ['confused', 'what', 'huh', 'puzzled'],
      'excited': ['excited', 'happy', 'celebration', 'party'],
      'sad': ['sad', 'crying', 'tears', 'depressed'],
      'disgusted': ['disgusted', 'gross', 'ew', 'yuck'],
      'proud': ['proud', 'success', 'win', 'achievement'],
    };

    return fallbackMap[emotion] || ['reaction', emotion];
  }

  /**
   * Calculate relevance score for GIF selection
   */
  private calculateRelevance(gif: GifResult, emotion: EmotionalAnalysis): number {
    let score = 50; // Base score

    // Title relevance
    const titleLower = gif.title.toLowerCase();
    for (const term of emotion.giffSearchTerms) {
      if (titleLower.includes(term.toLowerCase())) {
        score += 10;
      }
    }

    // Emotion match
    if (titleLower.includes(emotion.emotion)) {
      score += 20;
    }

    // Aspect ratio preference (landscape preferred)
    if (gif.aspectRatio && gif.aspectRatio >= 1.3 && gif.aspectRatio <= 2.0) {
      score += 10;
    }

    // Intensity bonus
    score += emotion.intensity * 10;

    return Math.min(score, 100);
  }

  /**
   * Get trending reaction GIFs
   */
  async getTrendingGifs(limit: number = 10): Promise<GifResult[]> {
    try {
      const trending = await this.service.getTrendingReactions(limit);
      console.log(`✅ Found ${trending.length} trending GIFs`);
      return trending;
    } catch (error) {
      console.error('Failed to get trending GIFs:', error);
      return [];
    }
  }

  /**
   * Batch process multiple emotion searches
   */
  async batchFindGifs(
    emotionSets: EmotionalAnalysis[][],
    options: GifSelectionOptions = {}
  ): Promise<EnhancedGifResult[][]> {
    const results: EnhancedGifResult[][] = [];

    for (const emotions of emotionSets) {
      const gifs = await this.findReactionGifs(emotions, options);
      results.push(gifs);

      // Rate limit between batches
      if (emotionSets.indexOf(emotions) < emotionSets.length - 1) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Cache management
   */
  private getCachedGifs(key: string): GifResult[] {
    return this.emotionSearchCache.get(key) || [];
  }

  private addToCache(key: string, gif: GifResult): void {
    const existing = this.getCachedGifs(key);
    existing.push(gif);
    
    // Keep only the last 5 results per emotion
    if (existing.length > 5) {
      existing.shift();
    }
    
    this.emotionSearchCache.set(key, existing);
  }

  private selectFromCache(cached: GifResult[], emotion: EmotionalAnalysis): GifResult {
    // Select based on relevance or random for variety
    if (Math.random() > 0.7) {
      // 30% chance of random selection for variety
      return cached[Math.floor(Math.random() * cached.length)];
    }

    // Otherwise, calculate relevance and pick the best
    const scored = cached.map(gif => ({
      gif,
      score: this.calculateRelevance(gif, emotion),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].gif;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.emotionSearchCache.clear();
    this.service.clearCache();
    console.log('🎭 GIF cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const adapterCache = {
      emotions: this.emotionSearchCache.size,
      totalGifs: Array.from(this.emotionSearchCache.values()).reduce(
        (sum, gifs) => sum + gifs.length,
        0
      ),
    };

    const serviceCache = this.service.getCacheStats();

    return {
      adapter: adapterCache,
      service: serviceCache,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const klipyAdapter = new KlipyAdapter();