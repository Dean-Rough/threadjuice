/**
 * Reddit Media Extractor
 * Extracts videos and media from Reddit posts using the JSON API
 */

import { IPlatformExtractor, MediaEmbed } from '../mediaEnricher';

export class RedditExtractor implements IPlatformExtractor {
  /**
   * Search Reddit for posts matching query and context
   */
  async search(query: string, context: string): Promise<MediaEmbed | null> {
    // Reddit doesn't have a public search API without auth
    // In production, you'd use the Reddit API with proper OAuth
    // For now, we'll use mock data
    return this.mockSearch(query, context);
  }

  /**
   * Extract media from a Reddit post URL using the .json trick
   */
  async extractFromUrl(url: string): Promise<MediaEmbed | null> {
    try {
      // Add .json to Reddit URL to get JSON data
      const jsonUrl = url.replace(/\/$/, '') + '.json';
      
      const response = await fetch(jsonUrl, {
        headers: {
          'User-Agent': 'ThreadJuice/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit fetch error: ${response.status}`);
      }

      const data = await response.json();
      const post = data[0]?.data?.children?.[0]?.data;
      
      if (!post) {
        return null;
      }

      // Check for Reddit video
      if (post.secure_media?.reddit_video) {
        const video = post.secure_media.reddit_video;
        return {
          type: 'video',
          embedUrl: video.fallback_url,
          originalUrl: url,
          thumbnailUrl: post.thumbnail,
          title: post.title,
          author: post.author,
          platform: 'Reddit',
          confidence: 0.95,
          metadata: {
            duration: video.duration,
            width: video.width,
            height: video.height,
            hasAudio: video.has_audio !== false
          }
        };
      }

      // Check for external video (YouTube, etc)
      if (post.secure_media?.oembed) {
        const oembed = post.secure_media.oembed;
        return {
          type: 'video',
          embedHtml: oembed.html,
          originalUrl: url,
          thumbnailUrl: oembed.thumbnail_url || post.thumbnail,
          title: post.title,
          author: post.author,
          platform: 'Reddit',
          confidence: 0.9
        };
      }

      // Check for image
      if (post.post_hint === 'image' && post.url) {
        return {
          type: 'reddit_post',
          embedUrl: post.url,
          originalUrl: url,
          thumbnailUrl: post.thumbnail,
          title: post.title,
          author: post.author,
          platform: 'Reddit',
          confidence: 0.9
        };
      }

      // No media found, return post embed
      return {
        type: 'reddit_post',
        embedId: post.id,
        originalUrl: url,
        title: post.title,
        author: post.author,
        platform: 'Reddit',
        confidence: 0.8,
        embedHtml: this.buildRedditEmbed(url, post.title)
      };

    } catch (error) {
      console.error('Reddit extraction failed:', error);
      return null;
    }
  }

  /**
   * Mock search for development
   */
  private async mockSearch(query: string, context: string): Promise<MediaEmbed> {
    const mockPosts = {
      video: {
        url: 'https://www.reddit.com/r/PublicFreakout/comments/example',
        title: 'Shocking video shows incident at store',
        author: 'reddit_user123',
        videoUrl: 'https://v.redd.it/example/DASH_720.mp4',
        thumbnail: 'https://b.thumbs.redditmedia.com/example.jpg'
      },
      discussion: {
        url: 'https://www.reddit.com/r/AmItheAsshole/comments/example2',
        title: 'AITA for telling my boss the truth?',
        author: 'throwaway12345',
        thumbnail: null
      }
    };

    const selected = context.includes('video') ? mockPosts.video : mockPosts.discussion;

    if (selected.videoUrl) {
      return {
        type: 'video',
        embedUrl: selected.videoUrl,
        originalUrl: selected.url,
        thumbnailUrl: selected.thumbnail || undefined,
        title: selected.title,
        author: selected.author,
        platform: 'Reddit',
        confidence: 0.7
      };
    }

    return {
      type: 'reddit_post',
      originalUrl: selected.url,
      title: selected.title,
      author: selected.author,
      platform: 'Reddit',
      confidence: 0.7,
      embedHtml: this.buildRedditEmbed(selected.url, selected.title)
    };
  }

  /**
   * Build Reddit embed HTML
   */
  private buildRedditEmbed(url: string, title: string): string {
    return `<blockquote class="reddit-card"><a href="${url}">${title}</a></blockquote><script async src="//embed.redditmedia.com/widgets/platform.js" charset="UTF-8"></script>`;
  }

  /**
   * Build embed URL (not applicable for Reddit)
   */
  buildEmbedUrl(id: string): string {
    return `https://www.reddit.com/comments/${id}`;
  }

  /**
   * Validate Reddit ID
   */
  validateId(id: string): boolean {
    return /^[a-z0-9]{5,10}$/.test(id);
  }
}

// Export singleton instance
export const redditExtractor = new RedditExtractor();