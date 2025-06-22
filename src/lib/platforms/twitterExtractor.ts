/**
 * Twitter/X Media Extractor
 * Extracts tweet embeds and media from Twitter/X
 */

import { IPlatformExtractor, MediaEmbed } from '../mediaEnricher';

export class TwitterExtractor implements IPlatformExtractor {
  private bearerToken: string | undefined;
  private mockMode: boolean = false;

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!this.bearerToken) {
      console.warn('Twitter Bearer Token not found, using mock mode');
      this.mockMode = true;
    }
  }

  /**
   * Search Twitter for tweets matching query and context
   */
  async search(query: string, context: string): Promise<MediaEmbed | null> {
    if (this.mockMode) {
      return this.mockSearch(query, context);
    }

    try {
      // Build Twitter API v2 search query
      const searchQuery = this.buildTwitterQuery(query, context);
      
      // Search using Twitter API v2 with media fields
      const searchUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(searchQuery)}&max_results=10&tweet.fields=public_metrics,created_at,author_id,attachments&expansions=author_id,attachments.media_keys&media.fields=url,preview_image_url,duration_ms,type,variants`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.data || data.data.length === 0) {
        return null;
      }

      // Find best matching tweet
      const bestTweet = this.findBestTweet(data.data, context);
      if (!bestTweet) {
        return null;
      }

      // Get author info
      const author = data.includes?.users?.find((u: any) => u.id === bestTweet.author_id);
      
      // Check for media attachments
      let mediaUrl, mediaType;
      if (bestTweet.attachments?.media_keys && data.includes?.media) {
        const mediaKey = bestTweet.attachments.media_keys[0];
        const media = data.includes.media.find((m: any) => m.media_key === mediaKey);
        
        if (media) {
          mediaType = media.type;
          if (media.type === 'video' && media.variants) {
            // Get highest quality video variant
            const videoVariant = media.variants
              .filter((v: any) => v.content_type === 'video/mp4')
              .sort((a: any, b: any) => (b.bit_rate || 0) - (a.bit_rate || 0))[0];
            mediaUrl = videoVariant?.url;
          } else if (media.type === 'photo') {
            mediaUrl = media.url;
          }
        }
      }

      // If we found media, return it
      if (mediaUrl && context.toLowerCase().includes('video')) {
        return {
          type: 'video',
          embedUrl: mediaUrl,
          originalUrl: `https://twitter.com/${author?.username || 'user'}/status/${bestTweet.id}`,
          thumbnailUrl: data.includes?.media?.[0]?.preview_image_url,
          title: bestTweet.text.substring(0, 100) + '...',
          author: author?.name || author?.username || 'Unknown',
          platform: 'Twitter',
          confidence: this.calculateConfidence(bestTweet, context)
        };
      }

      // Otherwise return tweet embed
      return {
        type: 'tweet',
        embedId: bestTweet.id,
        embedUrl: `https://twitter.com/${author?.username || 'user'}/status/${bestTweet.id}`,
        originalUrl: `https://twitter.com/${author?.username || 'user'}/status/${bestTweet.id}`,
        embedHtml: this.buildEmbedHtml(bestTweet.id),
        title: bestTweet.text.substring(0, 100) + '...',
        author: author?.name || author?.username || 'Unknown',
        platform: 'Twitter',
        confidence: this.calculateConfidence(bestTweet, context),
        metadata: mediaUrl ? { mediaUrl, mediaType } : undefined
      };
    } catch (error) {
      console.error('Twitter search failed:', error);
      return this.mockSearch(query, context);
    }
  }

  /**
   * Build optimized Twitter search query
   */
  private buildTwitterQuery(query: string, context: string): string {
    // Extract key terms from query
    const terms = query.split(' ').filter(t => t.length > 2);
    
    // Add context modifiers
    let enhancedQuery = terms.join(' ');
    
    if (context.includes('viral')) {
      enhancedQuery += ' min_retweets:100';
    }
    
    if (context.includes('recent') || context.includes('2024')) {
      enhancedQuery += ' -is:retweet';
    }
    
    return enhancedQuery;
  }

  /**
   * Find best matching tweet
   */
  private findBestTweet(tweets: any[], context: string): any {
    const contextLower = context.toLowerCase();
    let bestScore = 0;
    let bestTweet = tweets[0];

    tweets.forEach(tweet => {
      let score = 0;
      const text = tweet.text.toLowerCase();
      
      // Score based on engagement
      const metrics = tweet.public_metrics;
      if (metrics) {
        score += Math.log(metrics.retweet_count + 1);
        score += Math.log(metrics.like_count + 1) * 0.5;
        score += Math.log(metrics.reply_count + 1) * 0.3;
      }

      // Context matching
      if (contextLower.includes('viral') && metrics?.retweet_count > 1000) score += 5;
      if (contextLower.includes('ratio') && metrics?.reply_count > metrics?.like_count) score += 3;
      
      if (score > bestScore) {
        bestScore = score;
        bestTweet = tweet;
      }
    });

    return bestTweet;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(tweet: any, context: string): number {
    let confidence = 0.6;
    
    const metrics = tweet.public_metrics;
    if (metrics?.retweet_count > 1000) confidence += 0.2;
    if (context.toLowerCase().includes('viral') && metrics?.retweet_count > 5000) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  /**
   * Build embed HTML
   */
  private buildEmbedHtml(tweetId: string): string {
    // Twitter's oEmbed would return this, but we can construct it
    return `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Loading tweet...</p></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
  }

  /**
   * Mock search for development
   */
  private async mockSearch(query: string, context: string): Promise<MediaEmbed> {
    const mockTweets = {
      apology: {
        id: '1234567890123456789',
        username: 'CEOExample',
        text: 'I want to apologize for our recent actions. We failed our community and we will do better.',
        author: 'Example CEO'
      },
      viral: {
        id: '9876543210987654321',
        username: 'ViralTweeter',
        text: 'This is the most unhinged take I\'ve ever seen and I can\'t stop thinking about it',
        author: 'Viral Account'
      },
      ratio: {
        id: '1111222233334444555',
        username: 'BadTakeHaver',
        text: 'Unpopular opinion: Pizza is better cold than hot',
        author: 'Controversial User'
      }
    };

    // Select based on context
    let selected = mockTweets.viral;
    if (context.toLowerCase().includes('apology')) selected = mockTweets.apology;
    else if (context.toLowerCase().includes('ratio')) selected = mockTweets.ratio;

    return {
      type: 'tweet',
      embedId: selected.id,
      embedUrl: `https://twitter.com/${selected.username}/status/${selected.id}`,
      originalUrl: `https://twitter.com/${selected.username}/status/${selected.id}`,
      embedHtml: this.buildEmbedHtml(selected.id),
      title: selected.text,
      author: selected.author,
      platform: 'Twitter',
      confidence: 0.75
    };
  }

  /**
   * Build Twitter embed URL
   */
  buildEmbedUrl(tweetId: string): string {
    return `https://twitter.com/i/status/${tweetId}`;
  }

  /**
   * Validate tweet ID
   */
  validateId(id: string): boolean {
    return /^\d{15,20}$/.test(id);
  }
}

// Export singleton instance
export const twitterExtractor = new TwitterExtractor();