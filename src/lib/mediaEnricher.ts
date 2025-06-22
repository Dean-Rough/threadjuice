/**
 * Media Enrichment Service
 * Detects media references in stories and enriches them with actual embeds
 */

export interface MediaReference {
  sectionIndex: number;
  type: 'video' | 'tweet' | 'tiktok' | 'reddit_post' | 'youtube';
  query: string;
  context: string;
  fullMatch: string;
  position: number;
}

export interface MediaEmbed {
  type: 'video' | 'tweet' | 'tiktok' | 'reddit_post' | 'youtube';
  embedId?: string;
  embedUrl?: string;
  embedHtml?: string;
  thumbnailUrl?: string;
  title?: string;
  author?: string;
  platform: string;
  originalUrl?: string;
  confidence: number; // 0-1 score of how confident we are this is the right media
}

export interface EnrichedSection {
  type: string;
  content: string;
  title?: string;
  metadata?: any;
  mediaEmbed?: MediaEmbed;
}

export class MediaEnricher {
  public platformExtractors: Map<string, IPlatformExtractor>;

  constructor() {
    this.platformExtractors = new Map();
    // Platform extractors will be registered here
  }

  /**
   * Register a platform extractor
   */
  registerExtractor(type: string, extractor: IPlatformExtractor) {
    this.platformExtractors.set(type, extractor);
  }

  /**
   * Parse media placeholders from story content
   */
  detectReferences(sections: any[]): MediaReference[] {
    const mediaRegex = /\[MEDIA:\s*type="([^"]+)"\s*query="([^"]+)"\s*context="([^"]+)"\]/g;
    const references: MediaReference[] = [];
    
    sections.forEach((section, index) => {
      if (section.content && typeof section.content === 'string') {
        let match;
        const content = section.content;
        mediaRegex.lastIndex = 0; // Reset regex state
        
        while ((match = mediaRegex.exec(content)) !== null) {
          references.push({
            sectionIndex: index,
            type: match[1] as any,
            query: match[2],
            context: match[3],
            fullMatch: match[0],
            position: match.index
          });
        }
      }
    });
    
    return references;
  }

  /**
   * Find actual media for a reference
   */
  async findMedia(ref: MediaReference): Promise<MediaEmbed | null> {
    const extractor = this.platformExtractors.get(ref.type);
    if (!extractor) {
      console.warn(`No extractor found for media type: ${ref.type}`);
      return null;
    }

    try {
      return await extractor.search(ref.query, ref.context);
    } catch (error) {
      console.error(`Failed to find ${ref.type} media:`, error);
      return null;
    }
  }

  /**
   * Enrich story sections with media embeds
   */
  async enrichStory(sections: any[], references: MediaReference[]): Promise<EnrichedSection[]> {
    // Find media for each reference
    const mediaResults = await Promise.all(
      references.map(ref => this.findMedia(ref))
    );

    // Create a map of section index to media embeds
    const sectionMediaMap = new Map<number, MediaEmbed[]>();
    references.forEach((ref, i) => {
      const media = mediaResults[i];
      if (media) {
        const existing = sectionMediaMap.get(ref.sectionIndex) || [];
        existing.push(media);
        sectionMediaMap.set(ref.sectionIndex, existing);
      }
    });

    // Build enriched sections
    const enrichedSections: EnrichedSection[] = [];
    
    sections.forEach((section, index) => {
      // Add the original section
      const enrichedSection: EnrichedSection = { ...section };
      
      // Remove media placeholders from content
      if (references.some(r => r.sectionIndex === index)) {
        enrichedSection.content = section.content.replace(
          /\[MEDIA:\s*type="[^"]+"\s*query="[^"]+"\s*context="[^"]+"\]/g,
          ''
        ).trim();
      }
      
      enrichedSections.push(enrichedSection);
      
      // Add media embeds after the section
      const sectionMedia = sectionMediaMap.get(index);
      if (sectionMedia) {
        sectionMedia.forEach(media => {
          enrichedSections.push({
            type: 'media_embed',
            content: '',
            metadata: {
              media
            }
          });
        });
      }
    });

    return enrichedSections;
  }

  /**
   * Process a complete story
   */
  async processStory(story: any): Promise<any> {
    if (!story.content?.sections) {
      return story;
    }

    const references = this.detectReferences(story.content.sections);
    if (references.length === 0) {
      return story;
    }

    console.log(`🎬 Enriching ${references.length} media references`);
    const enrichedSections = await this.enrichStory(story.content.sections, references);

    return {
      ...story,
      content: {
        ...story.content,
        sections: enrichedSections
      }
    };
  }
}

/**
 * Platform extractor interface
 */
export interface IPlatformExtractor {
  search(query: string, context: string): Promise<MediaEmbed | null>;
  buildEmbedUrl(id: string): string;
  validateId(id: string): boolean;
}

// Export singleton instance
export const mediaEnricher = new MediaEnricher();