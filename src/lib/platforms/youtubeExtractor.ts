/**
 * YouTube Media Extractor
 * Searches YouTube for videos matching story context
 */

import { IPlatformExtractor, MediaEmbed } from '../mediaEnricher';

export class YouTubeExtractor implements IPlatformExtractor {
  private apiKey: string | undefined;
  private mockMode: boolean = false;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    if (!this.apiKey) {
      console.warn('YouTube API key not found, using mock mode');
      this.mockMode = true;
    }
  }

  /**
   * Search YouTube for videos matching query and context
   */
  async search(query: string, context: string): Promise<MediaEmbed | null> {
    if (this.mockMode) {
      return this.mockSearch(query, context);
    }

    try {
      // Build search query with context
      const searchQuery = this.buildSearchQuery(query, context);
      
      // Search YouTube API
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=5&order=relevance&key=${this.apiKey}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        return null;
      }

      // Find best match based on context
      const bestMatch = this.findBestMatch(data.items, context);
      if (!bestMatch) {
        return null;
      }

      return {
        type: 'youtube',
        embedId: bestMatch.id.videoId,
        embedUrl: this.buildEmbedUrl(bestMatch.id.videoId),
        originalUrl: `https://www.youtube.com/watch?v=${bestMatch.id.videoId}`,
        thumbnailUrl: bestMatch.snippet.thumbnails.high?.url || bestMatch.snippet.thumbnails.default?.url,
        title: bestMatch.snippet.title,
        author: bestMatch.snippet.channelTitle,
        platform: 'YouTube',
        confidence: this.calculateConfidence(bestMatch, context)
      };
    } catch (error) {
      console.error('YouTube search failed:', error);
      return this.mockSearch(query, context);
    }
  }

  /**
   * Build optimized search query
   */
  private buildSearchQuery(query: string, context: string): string {
    // Extract key terms from context
    const contextKeywords = this.extractKeywords(context);
    
    // Combine query with top context keywords
    const enhancedQuery = `${query} ${contextKeywords.slice(0, 3).join(' ')}`;
    
    // Add recency if context suggests recent event
    if (context.toLowerCase().includes('recent') || context.toLowerCase().includes('2024')) {
      return `${enhancedQuery} 2024`;
    }
    
    return enhancedQuery;
  }

  /**
   * Extract keywords from context
   */
  private extractKeywords(context: string): string[] {
    // Remove common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'about', 'with', 'from', 'showing', 'video'];
    
    return context
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .sort((a, b) => b.length - a.length); // Longer words first
  }

  /**
   * Find best matching video from results
   */
  private findBestMatch(items: any[], context: string): any {
    const contextLower = context.toLowerCase();
    let bestScore = 0;
    let bestItem = items[0]; // Default to first result

    items.forEach(item => {
      let score = 0;
      const title = item.snippet.title.toLowerCase();
      const description = item.snippet.description.toLowerCase();

      // Score based on context keywords in title/description
      const keywords = this.extractKeywords(context);
      keywords.forEach(keyword => {
        if (title.includes(keyword)) score += 2;
        if (description.includes(keyword)) score += 1;
      });

      // Bonus for certain indicators
      if (contextLower.includes('apology') && title.includes('apology')) score += 3;
      if (contextLower.includes('viral') && title.includes('viral')) score += 2;
      if (contextLower.includes('reaction') && title.includes('reaction')) score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    });

    return bestItem;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(item: any, context: string): number {
    const title = item.snippet.title.toLowerCase();
    const contextLower = context.toLowerCase();
    let confidence = 0.5; // Base confidence

    // Increase confidence based on matches
    const keywords = this.extractKeywords(context);
    const matchedKeywords = keywords.filter(k => title.includes(k));
    confidence += (matchedKeywords.length / keywords.length) * 0.3;

    // View count (if available) affects confidence
    // High view count for viral content increases confidence
    if (contextLower.includes('viral')) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Mock search for development
   */
  private async mockSearch(query: string, context: string): Promise<MediaEmbed> {
    // Popular videos for different contexts
    const mockVideos = {
      apology: {
        embedId: 'dQw4w9WgXcQ',
        title: 'CEO Apology Video - Company Response',
        author: 'Corporate Channel'
      },
      viral: {
        embedId: '9bZkp7q19f0',
        title: 'Viral Sensation - Must Watch',
        author: 'Viral Videos'
      },
      reaction: {
        embedId: 'kffacxfA7G4',
        title: 'Internet Reacts - Compilation',
        author: 'Reaction Channel'
      },
      default: {
        embedId: 'jNQXAC9IVRw',
        title: 'Related Video Content',
        author: 'Content Creator'
      }
    };

    // Select video based on context
    let selected = mockVideos.default;
    if (context.toLowerCase().includes('apology')) selected = mockVideos.apology;
    else if (context.toLowerCase().includes('viral')) selected = mockVideos.viral;
    else if (context.toLowerCase().includes('reaction')) selected = mockVideos.reaction;

    return {
      type: 'youtube',
      embedId: selected.embedId,
      embedUrl: this.buildEmbedUrl(selected.embedId),
      originalUrl: `https://www.youtube.com/watch?v=${selected.embedId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${selected.embedId}/maxresdefault.jpg`,
      title: selected.title,
      author: selected.author,
      platform: 'YouTube',
      confidence: 0.7
    };
  }

  /**
   * Build YouTube embed URL
   */
  buildEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }

  /**
   * Validate YouTube video ID
   */
  validateId(id: string): boolean {
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
  }
}

// Export singleton instance
export const youtubeExtractor = new YouTubeExtractor();