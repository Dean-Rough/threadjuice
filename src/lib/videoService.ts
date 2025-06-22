/**
 * Video and Embed Service for ThreadJuice
 * 
 * Handles video content from multiple sources:
 * - Pexels Videos API
 * - YouTube embeds
 * - Twitter/X embeds
 * - TikTok embeds
 * - Instagram posts
 * - Reddit posts
 */

export interface VideoResult {
  id: string;
  url: string;
  embedUrl?: string;
  thumbnail: string;
  title: string;
  description?: string;
  duration?: number;
  width: number;
  height: number;
  platform: 'pexels' | 'youtube' | 'twitter' | 'tiktok' | 'instagram' | 'reddit' | 'generic';
  author?: string;
  authorUrl?: string;
  license?: string;
  metadata?: Record<string, any>;
}

export interface EmbedContent {
  type: 'video' | 'social' | 'iframe';
  platform: string;
  embedCode?: string;
  url: string;
  title?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  metadata?: Record<string, any>;
}

class VideoService {
  private pexelsApiKey: string | undefined;
  private cache: Map<string, VideoResult[]> = new Map();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
  }

  /**
   * Search for videos on Pexels
   */
  async searchPexelsVideos(query: string, options?: {
    orientation?: 'landscape' | 'portrait' | 'square';
    minDuration?: number;
    maxDuration?: number;
    perPage?: number;
  }): Promise<VideoResult[]> {
    if (!this.pexelsApiKey) {
      console.warn('No Pexels API key found');
      return [];
    }

    // Check cache
    const cacheKey = `pexels:${query}:${JSON.stringify(options || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        query,
        per_page: (options?.perPage || 5).toString(),
        ...(options?.orientation && { orientation: options.orientation }),
        ...(options?.minDuration && { min_duration: options.minDuration.toString() }),
        ...(options?.maxDuration && { max_duration: options.maxDuration.toString() }),
      });

      const response = await fetch(
        `https://api.pexels.com/videos/search?${params}`,
        {
          headers: {
            'Authorization': this.pexelsApiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();
      
      const results: VideoResult[] = data.videos?.map((video: any) => ({
        id: `pexels-${video.id}`,
        url: video.video_files?.[0]?.link || '',
        thumbnail: video.image,
        title: video.url.split('/').pop()?.replace(/-/g, ' ') || 'Video',
        duration: video.duration,
        width: video.width,
        height: video.height,
        platform: 'pexels',
        author: video.user?.name,
        authorUrl: video.user?.url,
        license: 'Pexels License',
        metadata: {
          videoFiles: video.video_files,
          videoPictures: video.video_pictures,
        }
      })) || [];

      // Cache results
      this.cache.set(cacheKey, results);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      return results;
    } catch (error) {
      console.error('Pexels video search failed:', error);
      return [];
    }
  }

  /**
   * Extract video/embed info from a URL
   */
  async extractEmbedFromUrl(url: string): Promise<EmbedContent | null> {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return {
        type: 'video',
        platform: 'youtube',
        url,
        embedCode: `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        aspectRatio: '16:9',
        metadata: { videoId }
      };
    }

    // Twitter/X
    const twitterMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    if (twitterMatch) {
      const tweetId = twitterMatch[1];
      return {
        type: 'social',
        platform: 'twitter',
        url,
        aspectRatio: 'auto',
        metadata: { tweetId }
      };
    }

    // TikTok
    const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    if (tiktokMatch) {
      const videoId = tiktokMatch[1];
      return {
        type: 'video',
        platform: 'tiktok',
        url,
        aspectRatio: '9:16',
        metadata: { videoId }
      };
    }

    // Instagram
    const instagramMatch = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    if (instagramMatch) {
      const postId = instagramMatch[1];
      return {
        type: 'social',
        platform: 'instagram',
        url,
        aspectRatio: 'auto',
        metadata: { postId }
      };
    }

    // Reddit
    const redditMatch = url.match(/reddit\.com\/r\/\w+\/comments\/(\w+)/);
    if (redditMatch) {
      const postId = redditMatch[1];
      return {
        type: 'social',
        platform: 'reddit',
        url,
        aspectRatio: 'auto',
        metadata: { postId }
      };
    }

    return null;
  }

  /**
   * Get contextual video suggestions based on story content
   */
  async getContextualVideos(context: {
    title: string;
    category: string;
    platform: string;
    keywords?: string[];
  }): Promise<VideoResult[]> {
    // Build search query based on context
    const searchTerms = [];
    
    // Category-specific terms
    const categoryVideoTerms: Record<string, string[]> = {
      'workplace': ['office', 'meeting', 'computer', 'desk'],
      'relationships': ['couple', 'dating', 'love', 'argument'],
      'technology': ['tech', 'computer', 'phone', 'app'],
      'celebrity': ['celebrity', 'famous', 'red carpet', 'paparazzi'],
      'sports': ['sports', 'athlete', 'game', 'competition'],
      'food': ['cooking', 'restaurant', 'food', 'chef'],
      'travel': ['travel', 'vacation', 'tourist', 'destination'],
      'gaming': ['gaming', 'video game', 'esports', 'controller'],
      'parenting': ['family', 'children', 'parenting', 'kids'],
      'money': ['money', 'finance', 'cash', 'banking'],
    };

    const categoryTerms = categoryVideoTerms[context.category] || [context.category];
    searchTerms.push(...categoryTerms);

    // Platform-specific adjustments
    if (context.platform === 'tiktok') {
      searchTerms.push('social media', 'phone', 'recording');
    } else if (context.platform === 'twitter') {
      searchTerms.push('typing', 'computer', 'reaction');
    }

    // Add keywords if provided
    if (context.keywords?.length) {
      searchTerms.push(...context.keywords.slice(0, 2));
    }

    // Search for videos
    const query = searchTerms.slice(0, 3).join(' ');
    return this.searchPexelsVideos(query, {
      orientation: 'landscape',
      maxDuration: 60, // Max 1 minute for embedded videos
    });
  }

  /**
   * Create curated video library for common scenarios
   */
  getCuratedVideoLibrary(): Record<string, EmbedContent> {
    return {
      'dramatic_reaction': {
        type: 'video',
        platform: 'generic',
        url: '/assets/videos/dramatic-reaction.mp4',
        thumbnail: '/assets/videos/dramatic-reaction-thumb.jpg',
        title: 'Dramatic Reaction',
        aspectRatio: '16:9',
      },
      'mind_blown': {
        type: 'video',
        platform: 'generic',
        url: '/assets/videos/mind-blown.mp4',
        thumbnail: '/assets/videos/mind-blown-thumb.jpg',
        title: 'Mind Blown',
        aspectRatio: '16:9',
      },
      'typing_furiously': {
        type: 'video',
        platform: 'generic',
        url: '/assets/videos/typing-furiously.mp4',
        thumbnail: '/assets/videos/typing-furiously-thumb.jpg',
        title: 'Typing Furiously',
        aspectRatio: '16:9',
      },
      'scrolling_phone': {
        type: 'video',
        platform: 'generic',
        url: '/assets/videos/scrolling-phone.mp4',
        thumbnail: '/assets/videos/scrolling-phone-thumb.jpg',
        title: 'Scrolling Through Phone',
        aspectRatio: '9:16',
      },
    };
  }
}

export const videoService = new VideoService();