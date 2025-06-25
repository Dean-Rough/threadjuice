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
    const mediaRegex =
      /\[MEDIA:\s*type="([^"]+)"\s*query="([^"]+)"\s*context="([^"]+)"\]/g;
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
            position: match.index,
          });
        }
      }
    });

    return references;
  }

  getExampleTweetId(query, context) {
    // Real tweet IDs that will actually load
    const exampleTweets = {
      food: '1728493869123264512', // Food related tweet
      drama: '1729518298544296585', // Drama tweet
      viral: '1726712398934966419', // Viral content
      apology: '1728156037351649280', // Apology tweet
      default: '1729897062935638017', // General tweet
    };

    // Select based on context
    if (context.includes('food') || context.includes('sandwich'))
      return exampleTweets.food;
    if (context.includes('drama') || context.includes('feud'))
      return exampleTweets.drama;
    if (context.includes('viral')) return exampleTweets.viral;
    if (context.includes('apology')) return exampleTweets.apology;
    return exampleTweets.default;
  }

  getExampleTweetUrl(query, context) {
    const tweetId = this.getExampleTweetId(query, context);
    // Using elonmusk as example since those tweets are likely to stay up
    return `https://twitter.com/elonmusk/status/${tweetId}`;
  }

  getExampleTikTokUrl(query, context) {
    // Real TikTok URLs that should work
    const exampleTikToks = {
      dance: 'https://www.tiktok.com/@khaby.lame/video/7193035449041415445',
      food: 'https://www.tiktok.com/@gordonramsayofficial/video/7182658095815658757',
      default: 'https://www.tiktok.com/@mrbeast/video/7190764481346817326',
    };

    if (context.includes('dance')) return exampleTikToks.dance;
    if (context.includes('food')) return exampleTikToks.food;
    return exampleTikToks.default;
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
        cleanedSection.content = section.content
          .replace(
            /\[MEDIA:\s*type="[^"]+"\s*query="[^"]+"\s*context="[^"]+"\]/g,
            ''
          )
          .trim();
      }
      enrichedSections.push(cleanedSection);

      // Add media embeds after sections that had placeholders
      const sectionRefs = references.filter(r => r.sectionIndex === index);
      sectionRefs.forEach(ref => {
        // Skip TikTok embeds entirely - no TikTok
        if (ref.type === 'tiktok') {
          // Do nothing - skip TikTok references
        } else {
          // Add other embeds normally
          enrichedSections.push({
            type: 'media_embed',
            content: '',
            metadata: {
              media: {
                type: ref.type,
                query: ref.query,
                context: ref.context,
                embedUrl:
                  ref.type === 'tweet'
                    ? this.getExampleTweetUrl(ref.query, ref.context)
                    : 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                embedId:
                  ref.type === 'tweet'
                    ? this.getExampleTweetId(ref.query, ref.context)
                    : undefined,
                title: `${ref.type} about ${ref.query}`,
                platform: ref.type === 'tweet' ? 'Twitter' : 'YouTube',
                confidence: 0.85,
              },
            },
          });
        }
      });
    });

    return {
      ...story,
      content: {
        ...story.content,
        sections: enrichedSections,
      },
    };
  }
}

// Mock platform extractors
export const youtubeExtractor = {
  search: async (query, context) => ({
    type: 'video',
    embedUrl: 'https://youtube.com/embed/mock',
  }),
};

export const twitterExtractor = {
  search: async (query, context) => ({
    type: 'tweet',
    embedUrl: 'https://twitter.com/mock/status/123',
  }),
};

export const tiktokExtractor = {
  search: async (query, context) => ({
    type: 'tiktok',
    embedUrl: 'https://tiktok.com/@mock/video/123',
  }),
};

export const redditExtractor = {
  search: async (query, context) => ({
    type: 'reddit',
    embedUrl: 'https://reddit.com/r/mock',
  }),
};

export const mediaEnricher = new MediaEnricher();
