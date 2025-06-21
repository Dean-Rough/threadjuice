/**
 * ThreadJuice Pipeline System
 * 
 * A modular, extensible pipeline for processing viral content.
 */

// Core pipeline infrastructure
export { Pipeline, PipelineBuilder } from './core/pipeline';
export { BasePipelineStage, PipelineStage } from './core/PipelineStage';
export { 
  PipelineContext, 
  RedditStoryContext, 
  AIStoryContext,
  ProcessedStory,
  StorySection,
  ImageResult,
  GifResult,
  MediaAssets
} from './core/PipelineContext';

// Pipeline stages
export * from './stages';

// Service integrations
export * from './integrations';

// Example configurations
export * from './integrations/ExamplePipelines';

// Output classes
export { OutputStage, DatabaseOutput, FileOutput, DualOutput } from './stages/OutputStage';

// Orchestrator
export { PipelineOrchestrator } from './core/PipelineOrchestrator';

// Context creation helper
export { createContext } from './core/PipelineContext';

// Default orchestrator factory
export function createDefaultOrchestrator() {
  const { PipelineOrchestrator } = require('./core/PipelineOrchestrator');
  return new PipelineOrchestrator({
    defaultOptions: { debug: false },
    maxConcurrent: 3,
    cacheEnabled: true,
    monitoring: true
  });
}

// Helper function to create a standard pipeline
export function createStandardPipeline(options: {
  source: 'reddit' | 'twitter' | 'ai';
  sourceConfig: any;
  personaId: string;
  enrichment?: 'full' | 'minimal' | 'none';
  debug?: boolean;
}) {
  const { Pipeline, PipelineBuilder } = require('./core/pipeline');
  const stages = require('./stages');
  const { GenerationStage } = require('./stages/GenerationStage');

  const builder = new PipelineBuilder();

  // Add source stage
  switch (options.source) {
    case 'reddit':
      builder.add(stages.RedditSource(
        options.sourceConfig.subreddit,
        options.sourceConfig
      ));
      break;
    case 'twitter':
      builder.add(stages.TwitterSource(
        options.sourceConfig.query || '',
        options.sourceConfig
      ));
      break;
    case 'ai':
      builder.add(stages.AISource(
        options.sourceConfig.category,
        options.sourceConfig.persona,
        options.sourceConfig.prompt
      ));
      break;
  }

  // Add analysis
  builder.add(new stages.AnalysisStage());

  // Add generation
  builder.add(new GenerationStage({
    personaId: options.personaId,
    includeComments: options.source === 'reddit',
    fetchComments: options.source === 'reddit',
  }));

  // Add enrichment
  switch (options.enrichment || 'full') {
    case 'full':
      builder.add(stages.FullEnrichment());
      break;
    case 'minimal':
      builder.add(stages.MinimalEnrichment());
      break;
    // 'none' adds no enrichment stage
  }

  // Add transformation
  builder.add(new stages.TransformStage());

  // Add output
  builder.add(new stages.OutputStage({
    includeMetadata: options.debug || false,
  }));

  const pipeline = builder.build();
  
  if (options.debug) {
    pipeline.options.debug = true;
  }

  return pipeline;
}

/**
 * Quick start function
 */
export async function quickStart() {
  const { initializeServices } = require('./integrations');
  const { createRedditPipeline } = require('./integrations/ExamplePipelines');
  
  console.log('🚀 ThreadJuice Pipeline Quick Start');
  
  // Initialize services
  const services = await initializeServices();
  
  if (!services.reddit.available || !services.openai.available) {
    console.error('❌ Required services not configured. Please set environment variables.');
    return;
  }

  // Create a simple pipeline
  const pipeline = createRedditPipeline({
    subreddit: 'AmItheAsshole',
    personaId: 'the-terry',
  });

  console.log('✅ Pipeline created successfully!');
  console.log('📝 Run pipeline.execute(context) to process content');
  
  return pipeline;
}