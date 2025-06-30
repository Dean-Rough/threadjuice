/**
 * Example Pipeline Configurations
 *
 * Pre-configured pipelines that demonstrate how to use the integrated services.
 */

import { Pipeline, PipelineBuilder } from '../core/Pipeline';
import { PipelineContext } from '../core/PipelineContext';
import { RedditSource, TwitterSource, AISource } from '../stages/SourceStage';
import { AnalysisStage } from '../stages/AnalysisStage';
import {
  GenerationStage,
  RedditGeneration,
  AIGeneration,
  TwitterGeneration,
} from '../stages/GenerationStage';
import { FullEnrichment, MinimalEnrichment } from '../stages/EnrichmentStage';
import { TransformStage } from '../stages/TransformStage';
import { OutputStage } from '../stages/OutputStage';
import { initializeServices } from './index';
import { twitterAdapter } from './TwitterAdapter';

/**
 * Complete Reddit Story Pipeline
 *
 * Fetches Reddit content, generates story with GPT, enriches with images/GIFs
 */
export function createRedditPipeline(
  options: {
    subreddit: string;
    personaId: string;
    minScore?: number;
    includeComments?: boolean;
  } = {
    subreddit: 'AmItheAsshole',
    personaId: 'the-terry',
  }
) {
  return new PipelineBuilder()
    .add(
      RedditSource(options.subreddit, {
        sort: 'hot',
        limit: 10,
        minScore: options.minScore || 100,
      })
    )
    .add(
      new AnalysisStage({
        extractEntities: true,
        extractLinks: true,
        analyzeSentiment: true,
        extractMetaphors: true,
        generateKeywords: true,
      })
    )
    .add(
      RedditGeneration(options.personaId, {
        includeComments: options.includeComments !== false,
        fetchComments: true,
        temperature: 0.7,
        maxTokens: 2000,
      })
    )
    .add(FullEnrichment())
    .add(
      new TransformStage({
        includeGifs: true,
        includeTerryCommentary: true,
        includeComments: true,
      })
    )
    .add(
      new OutputStage({
        returnOnly: true,
      })
    )
    .build();
}

/**
 * AI Story Generation Pipeline
 *
 * Generates completely new stories based on prompts
 */
export function createAIPipeline(
  options: {
    category: string;
    persona: string;
    prompt?: string;
  } = {
    category: 'workplace',
    persona: 'the-snarky-sage',
  }
) {
  return new PipelineBuilder()
    .add(
      AISource(
        options.category,
        options.persona,
        options.prompt || `Generate a viral ${options.category} story`
      )
    )
    .add(
      new AnalysisStage({
        extractEntities: true,
        analyzeSentiment: true,
        generateKeywords: true,
      })
    )
    .add(
      AIGeneration(options.persona, {
        temperature: 0.8,
        maxTokens: 3000,
      })
    )
    .add(MinimalEnrichment()) // AI stories need fewer enrichments
    .add(
      new TransformStage({
        includeGifs: true,
        includeTerryCommentary: false, // AI stories already have personality
      })
    )
    .add(
      new OutputStage({
        returnOnly: true,
      })
    )
    .build();
}

/**
 * Twitter Drama Pipeline
 *
 * Fetches and processes Twitter drama (if configured)
 */
export function createTwitterPipeline(
  options: {
    personaId: string;
    minDramaScore?: number;
  } = {
    personaId: 'the-dry-cynic',
  }
) {
  return new PipelineBuilder()
    .add(
      TwitterSource('', {
        maxResults: 10,
      })
    )
    .add(
      new AnalysisStage({
        extractLinks: true,
        analyzeSentiment: true,
        generateKeywords: true,
      })
    )
    .add(TwitterGeneration(options.personaId))
    .add(FullEnrichment())
    .add(
      new TransformStage({
        includeGifs: true,
        includeTerryCommentary: true,
      })
    )
    .add(
      new OutputStage({
        returnOnly: true,
      })
    )
    .build();
}

/**
 * Quick Reddit Pipeline
 *
 * Minimal pipeline for fast processing - fixed TypeScript errors
 */
export function createQuickRedditPipeline(subreddit: string) {
  return new PipelineBuilder()
    .add(
      RedditSource(subreddit, {
        sort: 'top',
        limit: 5,
        minScore: 1000,
      })
    )
    .add(
      new AnalysisStage({
        analyzeSentiment: true,
        generateKeywords: true,
      })
    )
    .add(
      RedditGeneration('the-terry', {
        includeComments: false,
        fetchComments: false,
        maxTokens: 1500,
      })
    )
    .add(MinimalEnrichment())
    .add(new TransformStage())
    .add(new OutputStage())
    .build();
}

/**
 * Multi-source Pipeline
 *
 * Attempts to fetch from multiple sources
 */
export async function createMultiSourcePipeline(
  personaId: string = 'the-terry'
) {
  const services = await initializeServices();

  const pipelines: Pipeline[] = [];

  // Add Reddit pipeline if available
  if (services.reddit.available) {
    pipelines.push(
      createRedditPipeline({
        subreddit: 'tifu',
        personaId,
      })
    );
  }

  // Add Twitter pipeline if available
  if (services.twitter.available) {
    pipelines.push(createTwitterPipeline({ personaId }));
  }

  // Always add AI pipeline as fallback
  pipelines.push(
    createAIPipeline({
      category: 'general',
      persona: personaId,
    })
  );

  return pipelines;
}

/**
 * Debug Pipeline
 *
 * Includes extensive logging for troubleshooting
 */
export function createDebugPipeline() {
  return new Pipeline({ debug: true, throwOnError: false })
    .pipe(RedditSource('test', { limit: 1 }))
    .pipe(new AnalysisStage())
    .pipe(RedditGeneration('the-terry', { maxTokens: 500 }))
    .pipe(MinimalEnrichment())
    .pipe(new TransformStage())
    .pipe(new OutputStage({}));
}

/**
 * Example usage function
 */
export async function runExamplePipeline() {
  try {
    // Initialize services first
    await initializeServices();

    // Create and run a Reddit pipeline
    const pipeline = createRedditPipeline({
      subreddit: 'AmItheAsshole',
      personaId: 'the-terry',
      minScore: 500,
    });

    // Create initial context
    const context = new PipelineContext('reddit', {});

    // Execute pipeline
    const result = await pipeline.execute(context);

    console.log('Pipeline completed successfully!');
    console.log('Story title:', result.output.story?.title);
    console.log('Sections:', result.output.story?.content.sections.length);
    console.log('Images:', result.enrichments.primaryImage ? 'Yes' : 'No');
    console.log('GIFs:', result.enrichments.reactionGifs.length);

    return result;
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}
