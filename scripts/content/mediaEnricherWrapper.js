/**
 * JavaScript wrapper for TypeScript media enricher
 * This allows the story generator to use the media enrichment system
 */

// Mock implementation for media enrichment
// In production, this would be compiled from TypeScript
export class MediaEnricher {
  constructor() {
    this.platformExtractors = new Map();
  }

  registerExtractor(type, extractor) {
    this.platformExtractors.set(type, extractor);
  }

  detectReferences(sections) {
    const mediaRegex = /\[MEDIA:\s*type="([^"]+)"\s*query="([^"]+)"\s*context="([^"]+)"\]/g;
    const references = [];
    
    sections.forEach((section, index) => {
      if (section.content && typeof section.content === 'string') {
        let match;
        const content = section.content;
        mediaRegex.lastIndex = 0;
        
        while ((match = mediaRegex.exec(content)) !== null) {
          references.push({
            sectionIndex: index,
            type: match[1],
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

  async processStory(story) {
    if (!story.content?.sections) {
      return story;
    }

    const references = this.detectReferences(story.content.sections);
    if (references.length === 0) {
      return story;
    }

    console.log(`🎬 Found ${references.length} media references to enrich`);
    
    // For now, just remove the placeholders and add mock media sections
    const enrichedSections = [];
    
    story.content.sections.forEach((section, index) => {
      // Add the original section with placeholders removed
      const cleanedSection = { ...section };
      if (references.some(r => r.sectionIndex === index)) {
        cleanedSection.content = section.content.replace(
          /\[MEDIA:\s*type="[^"]+"\s*query="[^"]+"\s*context="[^"]+"\]/g,
          ''
        ).trim();
      }
      enrichedSections.push(cleanedSection);
      
      // Add media embeds after sections that had placeholders
      const sectionRefs = references.filter(r => r.sectionIndex === index);
      sectionRefs.forEach(ref => {
        enrichedSections.push({
          type: 'media_embed',
          content: '',
          metadata: {
            media: {
              type: ref.type,
              query: ref.query,
              context: ref.context,
              // Mock data for demonstration
              embedUrl: ref.type === 'tweet' 
                ? 'https://twitter.com/user/status/123456789'
                : ref.type === 'tiktok'
                ? 'https://www.tiktok.com/@user/video/123456789'
                : 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              title: `${ref.type} about ${ref.query}`,
              platform: ref.type === 'tweet' ? 'Twitter' : ref.type === 'tiktok' ? 'TikTok' : 'YouTube',
              confidence: 0.85
            }
          }
        });
      });
    });

    return {
      ...story,
      content: {
        ...story.content,
        sections: enrichedSections
      }
    };
  }
}

// Mock platform extractors
export const youtubeExtractor = {
  search: async (query, context) => ({ type: 'video', embedUrl: 'https://youtube.com/embed/mock' })
};

export const twitterExtractor = {
  search: async (query, context) => ({ type: 'tweet', embedUrl: 'https://twitter.com/mock/status/123' })
};

export const tiktokExtractor = {
  search: async (query, context) => ({ type: 'tiktok', embedUrl: 'https://tiktok.com/@mock/video/123' })
};

export const redditExtractor = {
  search: async (query, context) => ({ type: 'reddit', embedUrl: 'https://reddit.com/r/mock' })
};

export const mediaEnricher = new MediaEnricher();