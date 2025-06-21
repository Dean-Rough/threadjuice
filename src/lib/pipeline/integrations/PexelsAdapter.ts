/**
 * Pexels Image Adapter for Pipeline Integration
 * 
 * Bridges the existing ImageService with the pipeline architecture.
 * Focuses on Pexels API integration with intelligent image selection.
 */

import { imageService, ImageService, ImageResult } from '@/lib/imageService';
import { intelligentImageRouter } from '@/lib/intelligentImageRouter';

export interface ImageSearchOptions {
  strategy?: 'smart' | 'basic' | 'fallback';
  safeSearch?: boolean;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'small' | 'medium' | 'large';
  maxResults?: number;
}

export class PexelsAdapter {
  private service: ImageService;
  private cache: Map<string, ImageResult[]> = new Map();
  private cacheExpiry = 3600000; // 1 hour

  constructor() {
    this.service = imageService;
  }

  /**
   * Find the best image for content using intelligent routing
   */
  async findImage(
    title: string,
    content: string,
    category: string,
    options: ImageSearchOptions = {}
  ): Promise<ImageResult> {
    const cacheKey = this.generateCacheKey(title, category);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`📸 Using cached image for "${title}"`);
      return cached;
    }

    try {
      console.log(`🔍 Searching for image: "${title}" in category "${category}"`);

      let result: ImageResult;

      switch (options.strategy || 'smart') {
        case 'smart':
          result = await this.smartImageSearch(title, content, category);
          break;
        case 'basic':
          result = await this.basicImageSearch(title, category);
          break;
        case 'fallback':
          result = this.service.getFallbackImage(category);
          break;
        default:
          result = await this.smartImageSearch(title, content, category);
      }

      // Cache the result
      this.addToCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('❌ Image search failed:', error);
      // Always return a fallback on error
      return this.service.getFallbackImage(category);
    }
  }

  /**
   * Smart image search using content analysis
   */
  private async smartImageSearch(
    title: string,
    content: string,
    category: string
  ): Promise<ImageResult> {
    // Use intelligent routing to determine the best approach
    const analysis = intelligentImageRouter.analyzeContent(title, content, category);

    console.log(`🧠 Smart search analysis:`, {
      entities: analysis.entities.length,
      visualConcepts: analysis.visualConcepts.slice(0, 3),
      mood: analysis.mood,
      setting: analysis.setting,
    });

    // Try Wikipedia for known entities first
    if (analysis.shouldUseWikipedia && analysis.entities.length > 0) {
      for (const entity of analysis.entities.slice(0, 2)) {
        try {
          const entityImages = await this.service.searchWikipediaEntityImages(entity);
          if (entityImages.length > 0) {
            console.log(`✅ Found Wikipedia image for entity: ${entity}`);
            return entityImages[0];
          }
        } catch (error) {
          console.log(`⚠️ Wikipedia search failed for ${entity}`);
        }
      }
    }

    // Generate smart search keywords
    const stockPrompt = intelligentImageRouter.generateStockImagePrompt(title, content, category);
    const keywords = stockPrompt.split(' ').filter(k => k.length > 0);

    // Try Pexels with smart keywords
    const pexelsResults = await this.service.searchPexelsImages(keywords);
    if (pexelsResults.length > 0) {
      return this.selectBestImage(pexelsResults, analysis);
    }

    // Fallback to category-based search
    return this.basicImageSearch(title, category);
  }

  /**
   * Basic image search using title and category
   */
  private async basicImageSearch(
    title: string,
    category: string
  ): Promise<ImageResult> {
    // Generate basic keywords
    const keywords = this.service.generateImageKeywords(title, category, []);

    // Try multiple search strategies
    const searchStrategies = [
      keywords,
      [category, ...keywords.slice(0, 2)],
      [category],
    ];

    for (const strategy of searchStrategies) {
      const results = await this.service.searchPexelsImages(strategy);
      if (results.length > 0) {
        console.log(`✅ Found image with strategy: ${strategy.join(', ')}`);
        return results[0];
      }
    }

    // Final fallback
    return this.service.getFallbackImage(category);
  }

  /**
   * Select the best image from results based on content analysis
   */
  private selectBestImage(
    images: ImageResult[],
    analysis: ReturnType<typeof intelligentImageRouter.analyzeContent>
  ): ImageResult {
    // Score images based on relevance
    const scoredImages = images.map(image => {
      let score = 0;

      // Prefer landscape orientation for hero images
      if (image.width && image.height && image.width > image.height) {
        score += 2;
      }

      // Prefer images with good aspect ratio
      if (image.width && image.height) {
        const aspectRatio = image.width / image.height;
        if (aspectRatio >= 1.3 && aspectRatio <= 2.0) {
          score += 3;
        }
      }

      // Check alt text relevance
      const altLower = image.alt_text.toLowerCase();
      for (const concept of analysis.visualConcepts) {
        if (altLower.includes(concept.toLowerCase())) {
          score += 5;
        }
      }

      // Mood matching
      if (altLower.includes(analysis.mood)) {
        score += 3;
      }

      return { image, score };
    });

    // Sort by score and return the best
    scoredImages.sort((a, b) => b.score - a.score);
    return scoredImages[0].image;
  }

  /**
   * Search for multiple images
   */
  async findMultipleImages(
    items: Array<{
      title: string;
      content: string;
      category: string;
    }>,
    options: ImageSearchOptions = {}
  ): Promise<ImageResult[]> {
    const results: ImageResult[] = [];

    for (const item of items) {
      try {
        const image = await this.findImage(
          item.title,
          item.content,
          item.category,
          options
        );
        results.push(image);

        // Rate limit between searches
        if (items.indexOf(item) < items.length - 1) {
          await this.delay(500);
        }
      } catch (error) {
        console.error(`Failed to find image for "${item.title}":`, error);
        results.push(this.service.getFallbackImage(item.category));
      }
    }

    return results;
  }

  /**
   * Process and validate image for storage
   */
  async processImage(image: ImageResult): Promise<{
    processed: boolean;
    url: string;
    metadata: Record<string, any>;
  }> {
    try {
      const processed = await this.service.processImageForStorage(image);
      return {
        processed: true,
        url: processed.processed_url,
        metadata: processed.metadata,
      };
    } catch (error) {
      console.error('Image processing failed:', error);
      return {
        processed: false,
        url: image.url,
        metadata: {
          error: 'Processing failed',
          original: image,
        },
      };
    }
  }

  /**
   * Cache management
   */
  private generateCacheKey(title: string, category: string): string {
    return `${category}:${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  }

  private getFromCache(key: string): ImageResult | null {
    const cached = this.cache.get(key);
    if (cached && cached.length > 0) {
      // Return a random image from cache for variety
      return cached[Math.floor(Math.random() * cached.length)];
    }
    return null;
  }

  private addToCache(key: string, image: ImageResult): void {
    const existing = this.cache.get(key) || [];
    existing.push(image);
    this.cache.set(key, existing);

    // Clean old cache entries
    setTimeout(() => {
      this.cache.delete(key);
    }, this.cacheExpiry);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('📸 Image cache cleared');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const pexelsAdapter = new PexelsAdapter();