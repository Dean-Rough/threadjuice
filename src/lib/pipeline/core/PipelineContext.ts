/**
 * Pipeline Context
 * 
 * The shared context object that flows through all pipeline stages.
 * Each stage can read from and write to this context.
 */

import { ProcessedRedditPost } from '@/types/reddit';
import { EmotionalAnalysis } from '@/lib/sentimentAnalyzer';
import { MetaphorInsight } from '@/lib/metaphorExtractor';

export interface SourceMetadata {
  platform: 'reddit' | 'twitter' | 'ai-generated';
  fetchedAt: Date;
  url?: string;
  author?: string;
  subreddit?: string;
  engagement?: {
    upvotes?: number;
    comments?: number;
    shares?: number;
  };
}

export interface ExtractedLink {
  url: string;
  domain: string;
  type: 'image' | 'video' | 'article' | 'social' | 'other';
  text?: string;
  position?: number;
}

export interface ImageResult {
  url: string;
  alt_text: string;
  author: string;
  source_name: string;
  source_url: string;
  license_type: string;
  width?: number;
  height?: number;
}

export interface GifResult {
  id: string;
  url: string;
  title: string;
  caption?: string;
  width?: number;
  height?: number;
  preview?: string;
}

export interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface StorySection {
  type: string;
  title?: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface ProcessedStory {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  content: {
    sections: StorySection[];
  };
  tags: string[];
  metadata: Record<string, any>;
}

export interface MediaAssets {
  primaryImage: ImageResult;
  reactionGifs: Array<{
    position: number;
    emotion: string;
    gif: GifResult;
  }>;
  extractedMedia: Array<{
    url: string;
    type: 'image' | 'video';
    source: 'reddit' | 'twitter' | 'link';
  }>;
}

/**
 * Base Pipeline Context
 * Extended by specific pipeline implementations
 */
export class PipelineContext {
  // Source data
  source: {
    type: 'reddit' | 'twitter' | 'ai-generated';
    rawData: any;
    metadata: SourceMetadata;
  };

  // Analysis results
  analysis: {
    entities: string[];
    links: ExtractedLink[];
    sentiment: EmotionalAnalysis[];
    keywords: string[];
    metaphor?: MetaphorInsight;
  };

  // Enrichment data
  enrichments: {
    primaryImage?: ImageResult;
    reactionGifs: GifResult[];
    linkMetadata: LinkMetadata[];
    mediaUrls: string[];
  };

  // Transformed output
  output: {
    story?: ProcessedStory;
    media?: MediaAssets;
  };

  // Pipeline metadata
  pipeline: {
    startTime: Date;
    stage: string;
    errors: Array<{ stage: string; error: string }>;
    metrics: Record<string, number>;
  };

  constructor(sourceType: 'reddit' | 'twitter' | 'ai-generated', rawData: any) {
    this.source = {
      type: sourceType,
      rawData,
      metadata: {
        platform: sourceType,
        fetchedAt: new Date(),
      },
    };

    this.analysis = {
      entities: [],
      links: [],
      sentiment: [],
      keywords: [],
    };

    this.enrichments = {
      reactionGifs: [],
      linkMetadata: [],
      mediaUrls: [],
    };

    this.output = {};

    this.pipeline = {
      startTime: new Date(),
      stage: 'initialized',
      errors: [],
      metrics: {},
    };
  }

  /**
   * Add an error to the context
   */
  addError(stage: string, error: string) {
    this.pipeline.errors.push({ stage, error });
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number) {
    this.pipeline.metrics[name] = value;
  }

  /**
   * Get pipeline duration
   */
  getDuration(): number {
    return Date.now() - this.pipeline.startTime.getTime();
  }

  /**
   * Check if context has required data for a stage
   */
  hasRequiredData(requirements: string[]): boolean {
    for (const requirement of requirements) {
      const value = this.getNestedValue(this, requirement);
      if (value === undefined || value === null) {
        return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

/**
 * Context for Reddit stories
 */
export class RedditStoryContext extends PipelineContext {
  declare source: {
    type: 'reddit';
    rawData: ProcessedRedditPost;
    metadata: SourceMetadata & {
      subreddit: string;
      redditId: string;
    };
  };

  constructor(post: ProcessedRedditPost) {
    super('reddit', post);
    this.source.metadata.subreddit = post.subreddit;
    this.source.metadata.redditId = post.redditId;
    this.source.metadata.url = post.permalink;
    this.source.metadata.author = post.author;
    this.source.metadata.engagement = {
      upvotes: post.score,
      comments: post.commentCount,
    };
  }
}

/**
 * Context for AI-generated stories
 */
export class AIStoryContext extends PipelineContext {
  declare source: {
    type: 'ai-generated';
    rawData: {
      prompt: string;
      category: string;
      persona: string;
    };
    metadata: SourceMetadata;
  };

  constructor(prompt: string, category: string, persona: string) {
    super('ai-generated', { prompt, category, persona });
  }
}