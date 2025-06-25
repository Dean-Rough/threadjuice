# ThreadJuice API Reference

## Pipeline API

### Core Classes

#### Pipeline

The main pipeline class that manages stage execution.

```typescript
class Pipeline<TContext extends PipelineContext> {
  constructor(options?: PipelineOptions);

  // Add a stage to the pipeline
  pipe(stage: PipelineStage<TContext>): this;

  // Execute the pipeline
  execute(context: TContext): Promise<TContext>;

  // Execute stages in parallel where possible
  executeParallel(context: TContext): Promise<TContext>;

  // Create extended pipeline
  extend(...stages: PipelineStage<TContext>[]): Pipeline<TContext>;

  // Get pipeline metadata
  getMetadata(): PipelineMetadata;
}
```

**Options:**

```typescript
interface PipelineOptions {
  parallel?: boolean; // Enable parallel execution
  throwOnError?: boolean; // Stop on first error (default: true)
  debug?: boolean; // Enable debug logging
}
```

#### PipelineStage

Interface for all pipeline stages.

```typescript
interface PipelineStage<TContext> {
  name: string;
  description?: string;

  // Main processing method
  process(context: TContext): Promise<TContext>;

  // Optional validation before processing
  validate?(context: TContext): Promise<boolean>;

  // Optional post-processing
  postProcess?(context: TContext): Promise<void>;

  // Dependencies for parallel execution
  dependsOn?: string[];
}
```

#### PipelineContext

The context object that flows through stages.

```typescript
class PipelineContext {
  source: {
    type: 'reddit' | 'twitter' | 'ai-generated';
    rawData: any;
    metadata: SourceMetadata;
  };

  analysis: {
    entities: string[];
    links: ExtractedLink[];
    sentiment: EmotionalAnalysis[];
    keywords: string[];
    metaphor?: MetaphorInsight;
  };

  enrichments: {
    primaryImage?: ImageResult;
    reactionGifs: GifResult[];
    linkMetadata: LinkMetadata[];
    mediaUrls: string[];
  };

  output: {
    story?: ProcessedStory;
    media?: MediaAssets;
  };

  // Helper methods
  addError(stage: string, error: string): void;
  recordMetric(name: string, value: number): void;
  getDuration(): number;
  hasRequiredData(requirements: string[]): boolean;
}
```

### Pipeline Stages

#### SourceStage

Acquires content from various sources.

```typescript
new SourceStage(options: SourceOptions)

interface SourceOptions {
  type: 'reddit' | 'twitter' | 'ai-generated';
  reddit?: {
    subreddit: string;
    sort?: 'hot' | 'top' | 'new';
    limit?: number;
    minScore?: number;
  };
  twitter?: {
    query?: string;
    maxResults?: number;
  };
  ai?: {
    category: string;
    persona: string;
    prompt?: string;
  };
}
```

**Factory Functions:**

```typescript
RedditSource(subreddit: string, options?: RedditOptions)
TwitterSource(query: string, options?: TwitterOptions)
AISource(category: string, persona: string, prompt?: string)
```

#### AnalysisStage

Analyzes content for insights.

```typescript
new AnalysisStage(options?: AnalysisOptions)

interface AnalysisOptions {
  extractEntities?: boolean;    // Default: true
  extractLinks?: boolean;       // Default: true
  analyzeSentiment?: boolean;   // Default: true
  extractMetaphors?: boolean;   // Default: true
  generateKeywords?: boolean;   // Default: true
}
```

#### EnrichmentStage

Enriches content with media.

```typescript
new EnrichmentStage(options?: EnrichmentOptions)

interface EnrichmentOptions {
  fetchImages?: boolean;        // Default: true
  fetchGifs?: boolean;          // Default: true
  fetchLinkMetadata?: boolean;  // Default: true
  maxGifs?: number;            // Default: 3
  imageStrategy?: 'smart' | 'basic' | 'fallback';
}
```

**Factory Functions:**

```typescript
FullEnrichment(); // All enrichments enabled
MinimalEnrichment(); // Only images, basic strategy
GifOnlyEnrichment(); // Only GIFs, no images
```

#### TransformStage

Transforms content into story format.

```typescript
new TransformStage(options?: TransformOptions)

interface TransformOptions {
  includeGifs?: boolean;              // Default: true
  includeTerryCommentary?: boolean;   // Default: true
  includeComments?: boolean;          // Default: true
  sectionOrder?: string[];            // Custom section ordering
}
```

#### OutputStage

Outputs the processed story.

```typescript
new OutputStage(options?: OutputOptions)

interface OutputOptions {
  saveToDatabase?: boolean;   // Default: true
  saveToFile?: boolean;       // Default: false
  fileDirectory?: string;     // Default: 'data/generated-stories'
  returnOnly?: boolean;       // Default: false
}
```

**Factory Functions:**

```typescript
DatabaseOutput()              // Save to database only
FileOutput(directory?)        // Save to file only
DualOutput()                 // Save to both
ApiOutput()                  // Return only, no saving
```

### Pre-configured Pipelines

#### Reddit Pipeline

```typescript
createRedditPipeline(
  subreddit: string,
  options?: RedditOptions
): Pipeline
```

**Example:**

```typescript
const pipeline = createRedditPipeline('pettyrevenge', {
  minScore: 1000,
  sort: 'hot',
});
```

#### AI Pipeline

```typescript
createAIPipeline(
  category: string,
  persona: string
): Pipeline
```

**Example:**

```typescript
const pipeline = createAIPipeline('workplace', 'The Terry');
```

### Pipeline Orchestrator

Manages multiple pipelines.

```typescript
class PipelineOrchestrator {
  constructor(config?: OrchestratorConfig);

  // Register a pipeline
  register(definition: PipelineDefinition): this;

  // Execute a pipeline
  execute<T>(name: string, context: T): Promise<T>;

  // Execute multiple in sequence
  executeSequence<T>(names: string[], context: T): Promise<T>;

  // Execute multiple in parallel
  executeParallel<T>(
    configs: Array<{
      pipeline: string;
      context: T;
    }>
  ): Promise<T[]>;

  // Get pipeline info
  getPipelineInfo(name: string): PipelineInfo;
  listPipelines(): PipelineInfo[];
  getStats(): OrchestratorStats;
}
```

## Service APIs

### Reddit Scraper

```typescript
class RedditScraper {
  // Get posts from subreddit
  getHotPosts(options: RedditFetchOptions): Promise<ProcessedRedditPost[]>;

  // Get post comments
  getComments(
    options: RedditCommentsOptions
  ): Promise<ProcessedRedditComment[]>;

  // Search posts
  searchPosts(
    query: string,
    options?: RedditFetchOptions
  ): Promise<ProcessedRedditPost[]>;

  // Get rate limit status
  getRateLimitStatus(): RateLimitStatus;
}
```

### Image Service

```typescript
class ImageService {
  // Intelligent image finding
  findBestImageIntelligent(
    title: string,
    content: string,
    category: string
  ): Promise<ImageResult>;

  // Search specific sources
  searchPexelsImages(keywords: string[]): Promise<ImageResult[]>;
  searchWikimediaImages(keywords: string[]): Promise<ImageResult[]>;
  searchWikipediaEntityImages(entity: string): Promise<ImageResult[]>;

  // Get fallback image
  getFallbackImage(category: string): ImageResult;
}
```

### Sentiment Analyzer

```typescript
class SentimentAnalyzer {
  // Analyze story section
  analyzeSection(content: string, context: StoryContext): EmotionalAnalysis;
}

interface EmotionalAnalysis {
  emotion: EmotionType;
  intensity: number;
  giffSearchTerms: string[];
  context: string;
  confidence: number;
}
```

### Klipy Service (GIFs)

```typescript
class KlipyService {
  // Search for reaction GIF
  searchReactionGif(options: GifSearchOptions): Promise<GifResult | null>;

  // Get trending GIFs
  getTrendingReactions(limit?: number): Promise<GifResult[]>;

  // Cache management
  clearCache(): void;
  getCacheStats(): CacheStats;
}
```

## Type Definitions

### Story Types

```typescript
interface ProcessedStory {
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

interface StorySection {
  type: string;
  title?: string;
  content: string;
  metadata?: Record<string, any>;
}
```

### Media Types

```typescript
interface ImageResult {
  url: string;
  alt_text: string;
  author: string;
  source_name: string;
  source_url: string;
  license_type: string;
  width?: number;
  height?: number;
}

interface GifResult {
  id: string;
  url: string;
  title: string;
  caption?: string;
  width?: number;
  height?: number;
  preview?: string;
}

interface MediaAssets {
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
```

### Analysis Types

```typescript
interface ExtractedLink {
  url: string;
  domain: string;
  type: 'image' | 'video' | 'article' | 'social' | 'other';
  text?: string;
  position?: number;
}

type EmotionType =
  | 'opening_tension'
  | 'escalating_drama'
  | 'peak_chaos'
  | 'shocked_realization'
  | 'satisfied_resolution'
  | 'awkward_silence'
  | 'collective_cringe'
  | 'here_for_it'
  | 'mild_concern'
  | 'pure_entertainment';
```

## Error Handling

All pipeline methods throw errors that can be caught:

```typescript
try {
  const result = await pipeline.execute(context);
} catch (error) {
  if (error instanceof PipelineError) {
    console.error(`Pipeline failed at ${error.stage}: ${error.message}`);
  }
}
```

## Rate Limiting

External API calls are rate-limited:

```typescript
// Reddit: 60 requests per minute
// Twitter: Based on API tier
// Pexels: 200 requests per hour
// Klipy: Custom limits

// Check rate limit status
const status = redditScraper.getRateLimitStatus();
console.log(`Remaining: ${status.remaining}/${status.limit}`);
```

## Best Practices

1. **Error Handling**: Always wrap pipeline execution in try-catch
2. **Resource Management**: Use `postProcess` for cleanup
3. **Performance**: Enable parallel execution where possible
4. **Monitoring**: Use debug mode during development
5. **Testing**: Test each stage independently

## Examples

### Complete Story Processing

```typescript
import {
  Pipeline,
  RedditSource,
  AnalysisStage,
  FullEnrichment,
  TransformStage,
  DatabaseOutput,
  PipelineContext,
} from '@/lib/pipeline';

async function processRedditStory(subreddit: string) {
  const pipeline = new Pipeline({ debug: true })
    .pipe(RedditSource(subreddit, { minScore: 1000 }))
    .pipe(new AnalysisStage())
    .pipe(FullEnrichment())
    .pipe(new TransformStage())
    .pipe(DatabaseOutput());

  const context = new PipelineContext('reddit', {});

  try {
    const result = await pipeline.execute(context);
    console.log('Story processed:', result.output.story?.slug);
    return result.output.story;
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}
```

### Custom Analysis Pipeline

```typescript
async function analyzeContent(content: string) {
  const pipeline = new Pipeline()
    .pipe(
      new AnalysisStage({
        extractEntities: true,
        analyzeSentiment: true,
        generateKeywords: true,
      })
    )
    .pipe(ApiOutput());

  const context = new PipelineContext('ai-generated', { content });
  const result = await pipeline.execute(context);

  return {
    entities: result.analysis.entities,
    sentiment: result.analysis.sentiment,
    keywords: result.analysis.keywords,
  };
}
```
