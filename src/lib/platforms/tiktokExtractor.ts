/**
 * TikTok Media Extractor
 * Extracts TikTok video embeds using oEmbed API
 */

import { IPlatformExtractor, MediaEmbed } from '../mediaEnricher';

export class TikTokExtractor implements IPlatformExtractor {
  /**
   * Search for TikTok videos (using mock data since search API requires auth)
   */
  async search(query: string, context: string): Promise<MediaEmbed | null> {
    // TikTok doesn't provide a public search API
    // In production, you'd need to use their API with proper auth
    // For now, we'll use mock data based on context
    return this.mockSearch(query, context);
  }

  /**
   * Get TikTok embed via oEmbed API
   */
  async getEmbedFromUrl(url: string): Promise<MediaEmbed | null> {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error(`TikTok oEmbed error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract video ID from URL
      const videoIdMatch = url.match(/video\/(\d+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      return {
        type: 'tiktok',
        embedId: videoId || '',
        embedUrl: url,
        originalUrl: url,
        embedHtml: data.html,
        thumbnailUrl: data.thumbnail_url,
        title: data.title,
        author: data.author_name,
        platform: 'TikTok',
        confidence: 0.9 // High confidence since it's a direct URL
      };
    } catch (error) {
      console.error('TikTok oEmbed failed:', error);
      return null;
    }
  }

  /**
   * Mock search for development and demo
   */
  private async mockSearch(query: string, context: string): Promise<MediaEmbed> {
    const mockVideos = {
      dance: {
        id: '7318335390845095173',
        url: 'https://www.tiktok.com/@username/video/7318335390845095173',
        title: 'Viral Dance Challenge',
        author: 'DanceCreator'
      },
      reaction: {
        id: '7318335390845095174',
        url: 'https://www.tiktok.com/@reactor/video/7318335390845095174',
        title: 'Reacting to Drama - Part 1',
        author: 'DramaReactor'
      },
      storytime: {
        id: '7318335390845095175',
        url: 'https://www.tiktok.com/@storyteller/video/7318335390845095175',
        title: 'STORYTIME: What Really Happened',
        author: 'StoryTeller'
      },
      apology: {
        id: '7318335390845095176',
        url: 'https://www.tiktok.com/@influencer/video/7318335390845095176',
        title: 'Addressing the Situation...',
        author: 'InfluencerName'
      }
    };

    // Select based on context
    let selected = mockVideos.storytime;
    if (context.toLowerCase().includes('dance')) selected = mockVideos.dance;
    else if (context.toLowerCase().includes('reaction')) selected = mockVideos.reaction;
    else if (context.toLowerCase().includes('apology')) selected = mockVideos.apology;

    // Build embed HTML (simplified version)
    const embedHtml = `
      <blockquote class="tiktok-embed" cite="${selected.url}" data-video-id="${selected.id}" style="max-width: 605px;min-width: 325px;">
        <section>
          <a target="_blank" title="@${selected.author}" href="https://www.tiktok.com/@${selected.author}">@${selected.author}</a>
          <p>${selected.title}</p>
        </section>
      </blockquote>
      <script async src="https://www.tiktok.com/embed.js"></script>
    `;

    return {
      type: 'tiktok',
      embedId: selected.id,
      embedUrl: selected.url,
      originalUrl: selected.url,
      embedHtml: embedHtml,
      title: selected.title,
      author: selected.author,
      platform: 'TikTok',
      confidence: 0.7
    };
  }

  /**
   * Build TikTok embed URL
   */
  buildEmbedUrl(videoId: string): string {
    return `https://www.tiktok.com/embed/v3/${videoId}`;
  }

  /**
   * Validate TikTok video ID
   */
  validateId(id: string): boolean {
    return /^\d{15,20}$/.test(id);
  }
}

// Export singleton instance
export const tiktokExtractor = new TikTokExtractor();