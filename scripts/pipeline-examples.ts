/**
 * Pipeline Integration Examples
 * 
 * Shows how to use the modular pipeline system in various scenarios
 */

import { 
  createRedditPipeline, 
  createAIPipeline,
  createContext,
  Pipeline,
  PipelineContext,
  RedditSource,
  TwitterSource,
  AISource,
  AnalysisStage,
  FullEnrichment,
  MinimalEnrichment,
  TransformStage,
  DatabaseOutput,
  FileOutput,
  DualOutput,
  PipelineOrchestrator,
  createDefaultOrchestrator
} from '@/lib/pipeline';

// Example 1: Simple Reddit story ingestion
async function ingestRedditStory() {
  const pipeline = createRedditPipeline('tifu');
  const result = await pipeline.execute(createContext());
  
  console.log('Story saved:', result.output.story?.title);
}

// Example 2: AI story generation with custom persona
async function generateAIStory() {
  const pipeline = createAIPipeline('workplace', 'the-dry-cynic');
  const result = await pipeline.execute(createContext());
  
  return result.output.story;
}

// Example 3: Custom pipeline for specific needs
async function customPipeline() {
  const pipeline = new Pipeline({ debug: true })
    // Get content from Reddit
    .pipe(RedditSource('AmItheAsshole', { 
      limit: 10, 
      minScore: 500,
      sort: 'top' 
    }))
    // Analyze the content
    .pipe(new AnalysisStage({
      analyzeSentiment: true,
      generateKeywords: true,
      extractMetaphors: true
    }))
    // Add rich media
    .pipe(FullEnrichment())
    // Transform to story format
    .pipe(new TransformStage({
      includeGifs: true,
      includeTerryCommentary: true
    }))
    // Save to both database and file
    .pipe(DualOutput());
    
  return await pipeline.execute(createContext());
}

// Example 4: Minimal pipeline for testing
async function testPipeline() {
  const pipeline = new Pipeline()
    .pipe(AISource('technology', 'the-snarky-sage'))
    .pipe(new AnalysisStage())
    .pipe(MinimalEnrichment())
    .pipe(new TransformStage())
    .pipe(FileOutput('./test-stories'));
    
  return await pipeline.execute(createContext());
}

// Example 5: Using the orchestrator for multiple pipelines
async function orchestratorExample() {
  const orchestrator = createDefaultOrchestrator();
  
  // Execute Reddit pipeline
  const redditResult = await orchestrator.execute(
    'reddit-viral',
    createContext()
  );
  
  // Execute AI pipeline
  const aiResult = await orchestrator.execute(
    'ai-generated',
    createContext()
  );
  
  // Get pipeline stats
  const stats = orchestrator.getStats();
  console.log('Pipeline statistics:', stats);
}

// Example 6: Batch processing multiple subreddits
async function batchProcess() {
  const subreddits = ['tifu', 'AmItheAsshole', 'relationships'];
  const results = [];
  
  for (const subreddit of subreddits) {
    const pipeline = new Pipeline()
      .pipe(RedditSource(subreddit, { limit: 5 }))
      .pipe(new AnalysisStage())
      .pipe(FullEnrichment())
      .pipe(new TransformStage())
      .pipe(DatabaseOutput());
      
    const result = await pipeline.execute(createContext());
    results.push(result);
  }
  
  return results;
}

// Example 7: Error handling and retry logic
async function robustPipeline() {
  const pipeline = new Pipeline({ 
    debug: true,
    throwOnError: false  // Continue on errors
  })
    .pipe(RedditSource('technology'))
    .pipe(new AnalysisStage())
    .pipe(FullEnrichment())
    .pipe(new TransformStage())
    .pipe(DatabaseOutput());
  
  let retries = 3;
  while (retries > 0) {
    try {
      const result = await pipeline.execute(createContext());
      if (result.output.story) {
        return result;
      }
    } catch (error) {
      console.error(`Pipeline failed, ${retries} retries left`);
      retries--;
    }
  }
  
  throw new Error('Pipeline failed after all retries');
}

// Example 8: Conditional pipeline stages
async function conditionalPipeline(options: { 
  enrichImages: boolean;
  saveToFile: boolean;
}) {
  const pipeline = new Pipeline();
  
  // Always add source and analysis
  pipeline
    .pipe(RedditSource('todayilearned'))
    .pipe(new AnalysisStage());
  
  // Conditionally add enrichment
  if (options.enrichImages) {
    pipeline.pipe(FullEnrichment());
  } else {
    pipeline.pipe(MinimalEnrichment());
  }
  
  // Always transform
  pipeline.pipe(new TransformStage());
  
  // Choose output
  if (options.saveToFile) {
    pipeline.pipe(FileOutput('./stories'));
  } else {
    pipeline.pipe(DatabaseOutput());
  }
  
  return await pipeline.execute(createContext());
}

// Export all examples
export {
  ingestRedditStory,
  generateAIStory,
  customPipeline,
  testPipeline,
  orchestratorExample,
  batchProcess,
  robustPipeline,
  conditionalPipeline
};