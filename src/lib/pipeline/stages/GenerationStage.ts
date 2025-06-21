/**
 * Generation Stage
 * 
 * Uses OpenAI to generate story content from source material.
 * Transforms raw Reddit posts and AI prompts into engaging narratives.
 */

import { BasePipelineStage } from '../core/PipelineStage';
import { PipelineContext, RedditStoryContext, AIStoryContext } from '../core/PipelineContext';
import { openAIAdapter } from '../integrations';
import { redditAdapter } from '../integrations';

export interface GenerationOptions {
  personaId: string;
  temperature?: number;
  maxTokens?: number;
  includeComments?: boolean;
  fetchComments?: boolean;
  maxComments?: number;
}

export class GenerationStage extends BasePipelineStage {
  name = 'GenerationStage';
  description = 'Generates story content using OpenAI';

  private options: GenerationOptions;

  constructor(options: GenerationOptions) {
    super();
    this.options = {
      temperature: 0.7,
      maxTokens: 2000,
      includeComments: true,
      fetchComments: true,
      maxComments: 10,
      ...options,
    };
  }

  async process(context: PipelineContext): Promise<PipelineContext> {
    this.log(`Generating story with persona: ${this.options.personaId}`);

    try {
      if (context instanceof RedditStoryContext) {
        await this.generateRedditStory(context);
      } else if (context instanceof AIStoryContext) {
        await this.generateAIStory(context);
      } else if (context.source.type === 'twitter') {
        await this.generateTwitterStory(context);
      } else {
        throw new Error(`Unsupported context type: ${context.source.type}`);
      }

      return context;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`Story generation failed: ${errorMessage}`);
      throw error;
    }
  }

  private async generateRedditStory(context: RedditStoryContext): Promise<void> {
    // Fetch comments if needed
    let comments: any[] = [];
    
    if (this.options.fetchComments && this.options.includeComments) {
      try {
        const redditComments = await this.timeOperation(
          'Fetch Reddit comments',
          () => redditAdapter.fetchComments(context.source.rawData.redditId, {
            sort: 'top',
            limit: 50,
          })
        );
        comments = redditComments;
        this.log(`Fetched ${comments.length} comments`);
      } catch (error) {
        this.log('Failed to fetch comments, continuing without them');
      }
    }

    // Generate story using OpenAI
    const generatedStory = await this.timeOperation(
      'Generate Reddit story',
      () => openAIAdapter.generateRedditStory(context, comments, {
        personaId: this.options.personaId,
        temperature: this.options.temperature,
        maxTokens: this.options.maxTokens,
        includeComments: this.options.includeComments,
      })
    );

    // Store generated content in context
    this.storeGeneratedContent(context, generatedStory);
  }

  private async generateAIStory(context: AIStoryContext): Promise<void> {
    // Generate story from AI prompt
    const generatedStory = await this.timeOperation(
      'Generate AI story',
      () => openAIAdapter.generateAIStory(context, {
        personaId: this.options.personaId,
        temperature: this.options.temperature || 0.8, // Higher creativity for AI stories
        maxTokens: this.options.maxTokens || 3000,
      })
    );

    // Store generated content
    this.storeGeneratedContent(context, generatedStory);
  }

  private async generateTwitterStory(context: PipelineContext): Promise<void> {
    // For Twitter, we already have thread content, so we need to enhance it
    const twitterData = context.source.rawData;
    
    // Create a mock Reddit post for the adapter
    const mockPost = {
      redditId: twitterData.id,
      title: twitterData.title,
      content: twitterData.thread ? twitterData.thread.join('\n\n') : twitterData.content,
      author: twitterData.author,
      score: twitterData.metrics?.likes || 0,
      commentCount: twitterData.metrics?.replies || 0,
      subreddit: 'TwitterDrama',
      url: twitterData.url,
      permalink: twitterData.url,
      upvoteRatio: 1,
      createdAt: new Date(),
      isVideo: false,
      isNsfw: false,
      rawData: twitterData,
    };

    // Create a temporary Reddit context
    const tempContext = new RedditStoryContext(mockPost);
    
    // Generate story
    const generatedStory = await this.timeOperation(
      'Generate Twitter story',
      () => openAIAdapter.generateRedditStory(tempContext, [], {
        personaId: this.options.personaId,
        temperature: this.options.temperature,
        maxTokens: this.options.maxTokens,
        includeComments: false, // Twitter quotes handled differently
      })
    );

    // Store generated content
    this.storeGeneratedContent(context, generatedStory);
  }

  private storeGeneratedContent(context: PipelineContext, generatedStory: any): void {
    // Store the generated content in the context
    context.source.rawData = {
      ...context.source.rawData,
      generatedTitle: generatedStory.title,
      generatedContent: generatedStory.content,
      generatedSections: generatedStory.sections,
    };

    // Add metadata
    context.source.metadata = {
      ...context.source.metadata,
      wordCount: generatedStory.metadata.wordCount,
      personaId: generatedStory.metadata.personaId,
      generationTime: generatedStory.metadata.processingTime,
    };

    // Store sections for transform stage
    if (!context.analysis) {
      context.analysis = {
        entities: [],
        links: [],
        sentiment: [],
        keywords: [],
      };
    }

    // Add generated content to analysis for further processing
    context.analysis.keywords = this.extractKeywords(generatedStory.content);

    this.log(`Generated story: ${generatedStory.metadata.wordCount} words with ${generatedStory.sections.length} sections`);
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'is', 'was', 'are', 'were']);
    
    const wordFreq = new Map<string, number>();
    
    for (const word of words) {
      const clean = word.replace(/[^a-z0-9]/g, '');
      if (clean.length > 3 && !commonWords.has(clean)) {
        wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1);
      }
    }

    // Get top keywords by frequency
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  async validate(context: PipelineContext): Promise<boolean> {
    if (!this.options.personaId) {
      this.log('No persona ID specified');
      return false;
    }

    // Check if we have source data
    if (!context.source.rawData) {
      this.log('No source data available');
      return false;
    }

    return true;
  }
}

/**
 * Factory functions for common generation configurations
 */
export const RedditGeneration = (personaId: string, options?: Partial<GenerationOptions>) =>
  new GenerationStage({
    personaId,
    includeComments: true,
    fetchComments: true,
    ...options,
  });

export const AIGeneration = (personaId: string, options?: Partial<GenerationOptions>) =>
  new GenerationStage({
    personaId,
    temperature: 0.8,
    maxTokens: 3000,
    includeComments: false,
    fetchComments: false,
    ...options,
  });

export const TwitterGeneration = (personaId: string, options?: Partial<GenerationOptions>) =>
  new GenerationStage({
    personaId,
    includeComments: false,
    fetchComments: false,
    ...options,
  });