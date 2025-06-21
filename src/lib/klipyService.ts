/**
 * Klipy API Service for Emotion-Based GIF Reactions
 * Fetches appropriate reaction GIFs based on sentiment analysis
 */

export interface GifResult {
  id: string;
  url: string;
  title: string;
  width: number;
  height: number;
  aspectRatio: number;
  preview?: string;
  caption?: string;
}

export interface GifSearchOptions {
  emotion: string;
  searchTerms: string[];
  context: string;
  safeSearch?: boolean;
  intensity?: number;
  limit?: number;
}

export class KlipyService {
  private appKey: string;
  private cache: Map<string, GifResult[]> = new Map();
  private rateLimitDelay = 500; // ms between requests (increased for rate limiting)
  private baseUrl = 'https://api.klipy.co/api/v1';
  private customerId = 'threadjuice-user-001'; // Static customer ID for our app

  constructor() {
    // Use environment variable for Klipy API key
    this.appKey = process.env.NEXT_PUBLIC_KLIPY_API_KEY || process.env.KLIPY_API_KEY || '';
    
    if (!this.appKey) {
      console.warn('Klipy API key not found in environment variables. GIF reactions will be disabled.');
      return;
    }
  }

  /**
   * Search for appropriate reaction GIF based on emotion
   */
  async searchReactionGif(options: GifSearchOptions): Promise<GifResult | null> {
    if (!this.appKey) {
      console.warn('Klipy service not initialized');
      return null;
    }

    const { searchTerms, context, safeSearch = true, limit = 5 } = options;
    
    try {
      // Try each search term until we find good results (limit to first 2 for rate limiting)
      for (const searchTerm of searchTerms.slice(0, 2)) {
        const cacheKey = `${searchTerm}-${safeSearch}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
          const cached = this.cache.get(cacheKey)!;
          if (cached.length > 0) {
            return this.selectBestGif(cached, context);
          }
        }

        // Rate limiting
        await this.delay(this.rateLimitDelay);

        // Build Klipy API URL with correct format
        const url = `${this.baseUrl}/${this.appKey}/gifs/search`;
        const params = new URLSearchParams({
          q: searchTerm,
          customer_id: this.customerId,
          per_page: Math.min(limit, 24).toString(),
          content_filter: safeSearch ? 'medium' : 'low'
        });

        console.log(`🔌 Klipy API call: ${url}?${params.toString()}`);

        const response = await fetch(`${url}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.warn(`Klipy API error for "${searchTerm}": ${response.status} - ${response.statusText}`);
          // If rate limited (429), don't try more terms
          if (response.status === 429) {
            console.log('🚫 Rate limited - stopping search attempts');
            break;
          }
          continue;
        }

        const data = await response.json();
        console.log(`📊 Klipy response:`, data);

        if (data.result && data.data && data.data.length > 0) {
          const transformedGifs = data.data.map((gif: any) => this.transformKlipyResult(gif, context));
          
          // Cache results
          this.cache.set(cacheKey, transformedGifs);
          
          return this.selectBestGif(transformedGifs, context);
        }
      }

      console.warn(`No GIFs found for terms: ${searchTerms.join(', ')}`);
      return null;

    } catch (error) {
      console.error('Error fetching GIF from Klipy:', error);
      return null;
    }
  }

  /**
   * Get trending reaction GIFs
   */
  async getTrendingReactions(limit: number = 10): Promise<GifResult[]> {
    if (!this.appKey) return [];

    try {
      const url = `${this.baseUrl}/${this.appKey}/gifs/trending`;
      const params = new URLSearchParams({
        customer_id: this.customerId,
        per_page: Math.min(limit, 24).toString()
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Klipy trending API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result && data.data) {
        return data.data.map((gif: any) => this.transformKlipyResult(gif, 'Trending reaction'));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
      return [];
    }
  }

  /**
   * Transform Giphy API result to our format (legacy)
   */
  private transformGiphyResult(gif: any, context: string): GifResult {
    const original = gif.images.original;
    const preview = gif.images.preview_gif;
    
    return {
      id: gif.id,
      url: original.url,
      title: gif.title || 'Reaction GIF',
      width: parseInt(original.width),
      height: parseInt(original.height),
      aspectRatio: parseInt(original.width) / parseInt(original.height),
      preview: preview?.url,
      caption: context
    };
  }

  /**
   * Transform Klipy API result to our format
   */
  private transformKlipyResult(gif: any, context: string): GifResult {
    // Klipy API format: { id, slug, title, file: { gif: url, width, height }, type }
    const file = gif.file || {};
    const width = file.width || 400;
    const height = file.height || 300;
    
    return {
      id: gif.id || gif.slug || Math.random().toString(36),
      url: file.gif || file.url || gif.url,
      title: gif.title || 'Reaction GIF',
      width: width,
      height: height,
      aspectRatio: width / height,
      preview: file.thumbnail || file.preview || file.gif,
      caption: context
    };
  }

  /**
   * Select the best GIF from results
   */
  private selectBestGif(gifs: GifResult[], context: string): GifResult {
    // Prefer GIFs with good aspect ratios (not too tall/wide)
    const goodAspectRatio = gifs.filter(gif => 
      gif.aspectRatio >= 0.8 && gif.aspectRatio <= 2.0
    );

    // Use filtered results if available, otherwise use all
    const candidates = goodAspectRatio.length > 0 ? goodAspectRatio : gifs;
    
    // For now, return the first result
    // Could add more sophisticated selection logic here
    const selected = candidates[0];
    
    return {
      ...selected,
      caption: context
    };
  }

  /**
   * Rate limiting delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const giphyService = new KlipyService();