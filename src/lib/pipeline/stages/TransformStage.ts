/**
 * Transform Stage
 * 
 * Transforms the analyzed and enriched content into the final story format.
 * Builds the story structure with all sections, images, and GIFs.
 */

import { BasePipelineStage } from '../core/PipelineStage';
import { PipelineContext, StorySection, ProcessedStory, MediaAssets } from '../core/PipelineContext';

export interface TransformOptions {
  includeGifs?: boolean;
  includeTerryCommentary?: boolean;
  includeComments?: boolean;
  sectionOrder?: string[];
}

export class TransformStage extends BasePipelineStage {
  name = 'TransformStage';
  description = 'Transforms content into final story format';

  private options: TransformOptions;

  constructor(options: TransformOptions = {}) {
    super();
    this.options = {
      includeGifs: true,
      includeTerryCommentary: true,
      includeComments: true,
      ...options,
    };
  }

  async process(context: PipelineContext): Promise<PipelineContext> {
    this.log('Transforming content into story format');

    // Build the story structure
    const story = await this.buildStory(context);
    const media = this.buildMediaAssets(context);

    // Store in context
    context.output.story = story;
    context.output.media = media;

    this.log(`Story transformed: ${story.content.sections.length} sections`);

    return context;
  }

  private async buildStory(context: PipelineContext): Promise<ProcessedStory> {
    const sections: StorySection[] = [];

    // Add hero image
    if (context.enrichments.primaryImage) {
      sections.push({
        type: 'image',
        content: context.enrichments.primaryImage.alt_text,
        metadata: {
          image_source: context.enrichments.primaryImage.source_name,
          image_url: context.enrichments.primaryImage.url,
          attribution: context.enrichments.primaryImage.author,
          source: context.enrichments.primaryImage.source_url,
          license_type: context.enrichments.primaryImage.license_type,
        },
      });
    }

    // Transform based on source type
    if (context.source.type === 'reddit') {
      sections.push(...this.transformRedditContent(context));
    } else if (context.source.type === 'ai-generated') {
      sections.push(...this.transformAIContent(context));
    }

    // Add reaction GIFs at strategic points
    if (this.options.includeGifs && context.enrichments.reactionGifs.length > 0) {
      sections.push(...this.insertReactionGifs(sections, context));
    }

    // Add Terry's commentary
    if (this.options.includeTerryCommentary && context.analysis.metaphor) {
      sections.push({
        type: 'terry_corner',
        title: "The Terry's Take",
        content: context.analysis.metaphor.terryVoice,
        metadata: {
          enhanced: true,
        },
      });
    }

    // Create the story object
    const story: ProcessedStory = {
      id: `story-${Date.now()}`,
      title: context.source.rawData.generatedTitle || context.source.rawData.title || 'Untitled Story',
      slug: this.createSlug(context.source.rawData.title || ''),
      excerpt: this.createExcerpt(context),
      category: context.source.metadata.subreddit || 'general',
      author: this.getAuthor(context),
      content: { sections },
      tags: this.generateTags(context),
      metadata: {
        source: context.source.type,
        sourceUrl: context.source.metadata.url,
        fetchedAt: context.source.metadata.fetchedAt,
        sentiment: context.analysis.sentiment[0]?.emotion,
        viral_score: this.calculateViralScore(context),
      },
    };

    return story;
  }

  private transformRedditContent(context: PipelineContext): StorySection[] {
    const sections: StorySection[] = [];
    const post = context.source.rawData;

    // Check if we have generated sections
    if (post.generatedSections && Array.isArray(post.generatedSections)) {
      // Use the AI-generated sections
      for (const genSection of post.generatedSections) {
        sections.push({
          type: genSection.type,
          title: genSection.title,
          content: genSection.content,
          metadata: {
            wordCount: genSection.wordCount,
          },
        });
      }
    } else {
      // Fallback to extracting from raw content
      const content = post.generatedContent || post.content || '';
      
      sections.push({
        type: 'describe-1',
        title: 'The Setup',
        content: this.extractSection(content, 0, 0.25) || post.title,
      });

      sections.push({
        type: 'describe-2',
        title: 'The Situation Unfolds',
        content: this.extractSection(content, 0.25, 0.5) || 'The story continues...',
      });

      sections.push({
        type: 'discussion',
        title: 'What Really Happened',
        content: this.extractSection(content, 0.5, 0.75) || 'The truth emerges...',
      });

      sections.push({
        type: 'outro',
        title: 'The Aftermath',
        content: this.extractSection(content, 0.75, 1.0) || 'And that\'s how it ended.',
      });
    }

    // Add comments if available
    if (this.options.includeComments && post.comments && post.comments.length > 0) {
      sections.push({
        type: 'comments-1',
        title: 'Reddit Reactions',
        content: 'The internet had THOUGHTS about this situation:',
        metadata: {
          comments: post.comments.slice(0, 5).map((c: any) => ({
            author: c.author,
            content: c.content,
            score: c.score,
          })),
        },
      });
    }

    return sections;
  }

  private transformAIContent(context: PipelineContext): StorySection[] {
    // For AI content, we'll need the actual generated story
    // This is a placeholder structure
    return [
      {
        type: 'describe-1',
        title: 'The Beginning',
        content: 'AI-generated story content would go here...',
      },
    ];
  }

  private insertReactionGifs(
    sections: StorySection[], 
    context: PipelineContext
  ): StorySection[] {
    const gifSections: StorySection[] = [];
    const gifs = context.enrichments.reactionGifs;

    // Insert GIFs at strategic positions
    if (gifs[0]) {
      // After the first major section
      gifSections.push({
        type: 'reaction-gif',
        content: gifs[0].caption || 'Everyone reading this:',
        metadata: {
          gif: gifs[0],
          emotion: context.analysis.sentiment[0]?.emotion,
        },
      });
    }

    return gifSections;
  }

  private buildMediaAssets(context: PipelineContext): MediaAssets {
    return {
      primaryImage: context.enrichments.primaryImage!,
      reactionGifs: context.enrichments.reactionGifs.map((gif, index) => ({
        position: index,
        emotion: context.analysis.sentiment[index]?.emotion || 'reaction',
        gif,
      })),
      extractedMedia: context.analysis.links
        .filter(link => link.type === 'image' || link.type === 'video')
        .map(link => ({
          url: link.url,
          type: link.type as 'image' | 'video',
          source: context.source.type as 'reddit' | 'twitter',
        })),
    };
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 60);
  }

  private createExcerpt(context: PipelineContext): string {
    const content = context.source.rawData.content || context.source.rawData.title || '';
    return content.substring(0, 150).trim() + '...';
  }

  private getAuthor(context: PipelineContext): string {
    // Map to our personas
    const personas = ['The Terry', 'The Snarky Sage', 'The Down-to-Earth Buddy'];
    return personas[Math.floor(Math.random() * personas.length)];
  }

  private generateTags(context: PipelineContext): string[] {
    const tags = [context.source.metadata.subreddit || 'general'];
    
    // Add keywords as tags
    tags.push(...context.analysis.keywords.slice(0, 5));
    
    // Add emotion as tag
    if (context.analysis.sentiment[0]) {
      tags.push(context.analysis.sentiment[0].emotion);
    }

    return [...new Set(tags)];
  }

  private calculateViralScore(context: PipelineContext): number {
    let score = 5; // Base score

    // Increase based on engagement
    if (context.source.metadata.engagement) {
      const { upvotes = 0, comments = 0 } = context.source.metadata.engagement;
      if (upvotes > 10000) score += 2;
      if (comments > 1000) score += 2;
    }

    // Increase based on emotional intensity
    const intensity = context.analysis.sentiment[0]?.intensity || 0;
    score += Math.floor(intensity * 2);

    return Math.min(score, 10);
  }

  private extractSection(content: string, start: number, end: number): string {
    const words = content.split(' ');
    const startIndex = Math.floor(words.length * start);
    const endIndex = Math.floor(words.length * end);
    return words.slice(startIndex, endIndex).join(' ');
  }

  private generateMockComments(platform: 'reddit' | 'twitter'): any[] {
    // In production, these would come from actual comments
    return [
      {
        author: 'RedditUser123',
        content: 'This is absolutely wild!',
      },
      {
        author: 'throwaway9876',
        content: 'Play stupid games, win stupid prizes.',
      },
    ];
  }

  async validate(context: PipelineContext): Promise<boolean> {
    return !!context.analysis && !!context.enrichments;
  }
}