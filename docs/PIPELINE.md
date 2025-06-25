# ThreadJuice Story Pipeline Architecture

## Overview

The ThreadJuice Story Pipeline is a modular, extensible system for processing viral content from various sources. It follows a clean, stage-based architecture where each stage has a single responsibility.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Content Sources │ ──> │ Story Processor  │ ──> │ Content Output  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                         │
    ┌───┴───┐              ┌────┴────┐              ┌─────┴─────┐
    │Reddit │              │Analyzer │              │Database   │
    │Twitter│              │Enricher │              │Files      │
    │AI Gen │              │Formatter│              │API        │
    └───────┘              └─────────┘              └───────────┘
```

## Core Components

### Pipeline

The base `Pipeline` class manages the flow of data through stages:

```typescript
const pipeline = new Pipeline({ debug: true })
  .pipe(new SourceStage())
  .pipe(new AnalysisStage())
  .pipe(new EnrichmentStage())
  .pipe(new TransformStage())
  .pipe(new OutputStage());

const result = await pipeline.execute(context);
```

### PipelineContext

The `PipelineContext` carries data through all stages:

```typescript
interface PipelineContext {
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
  };

  enrichments: {
    primaryImage?: ImageResult;
    reactionGifs: GifResult[];
    linkMetadata: LinkMetadata[];
  };

  output: {
    story?: ProcessedStory;
    media?: MediaAssets;
  };
}
```

## Pipeline Stages

### 1. Source Stage

Acquires content from various sources and normalizes it.

**Responsibilities:**

- Fetch content from Reddit/Twitter APIs
- Generate AI content
- Normalize different formats
- Select best content based on engagement

**Usage:**

```typescript
// Reddit source
new SourceStage({
  type: 'reddit',
  reddit: {
    subreddit: 'pettyrevenge',
    sort: 'hot',
    limit: 10,
    minScore: 1000,
  },
});

// Or use factory function
RedditSource('pettyrevenge', { minScore: 1000 });
```

### 2. Analysis Stage

Analyzes content to extract metadata and insights.

**Responsibilities:**

- Extract entities (brands, products, companies)
- Extract URLs and categorize them
- Analyze sentiment and emotions
- Generate relevant keywords
- Extract metaphors for Terry's commentary

**Usage:**

```typescript
new AnalysisStage({
  extractEntities: true,
  extractLinks: true,
  analyzeSentiment: true,
  extractMetaphors: true,
  generateKeywords: true,
});
```

### 3. Enrichment Stage

Enriches content with media and additional context.

**Responsibilities:**

- Find contextually relevant images
- Search for reaction GIFs based on sentiment
- Fetch metadata for extracted links
- Download and cache media

**Usage:**

```typescript
new EnrichmentStage({
  fetchImages: true,
  fetchGifs: true,
  fetchLinkMetadata: true,
  maxGifs: 3,
  imageStrategy: 'smart',
});

// Or use presets
FullEnrichment();
MinimalEnrichment();
```

### 4. Transform Stage

Transforms analyzed content into the final story format.

**Responsibilities:**

- Build story sections
- Insert media at appropriate positions
- Add Terry's commentary
- Format for output

**Usage:**

```typescript
new TransformStage({
  includeGifs: true,
  includeTerryCommentary: true,
  includeComments: true,
});
```

### 5. Output Stage

Handles final output to various destinations.

**Responsibilities:**

- Save to database
- Write to files
- Return for API responses
- Clean up resources

**Usage:**

```typescript
// Save to database
DatabaseOutput();

// Save to file
FileOutput('data/stories');

// Both database and file
DualOutput();

// API response only
ApiOutput();
```

## Usage Examples

### Basic Reddit Story Pipeline

```typescript
import { createRedditPipeline } from '@/lib/pipeline';

const pipeline = createRedditPipeline('pettyrevenge', {
  minScore: 1000,
  limit: 10,
});

const context = new PipelineContext('reddit', {});
const result = await pipeline.execute(context);

console.log(result.output.story);
```

### Custom Pipeline

```typescript
import {
  Pipeline,
  RedditSource,
  AnalysisStage,
  EnrichmentStage,
  TransformStage,
  DatabaseOutput,
} from '@/lib/pipeline';

const customPipeline = new Pipeline({ debug: true })
  .pipe(RedditSource('AmItheAsshole'))
  .pipe(
    new AnalysisStage({
      extractEntities: true,
      analyzeSentiment: true,
    })
  )
  .pipe(
    new EnrichmentStage({
      fetchImages: true,
      fetchGifs: true,
      maxGifs: 5,
    })
  )
  .pipe(
    new TransformStage({
      includeTerryCommentary: true,
    })
  )
  .pipe(DatabaseOutput());
```

### Pipeline Orchestrator

For managing multiple pipelines:

```typescript
import { PipelineOrchestrator } from '@/lib/pipeline';

const orchestrator = new PipelineOrchestrator({
  maxConcurrent: 3,
  monitoring: true,
});

// Register pipelines
orchestrator.register({
  name: 'reddit-viral',
  description: 'Process viral Reddit content',
  stages: [
    RedditSource('all', { sort: 'hot' }),
    new AnalysisStage(),
    FullEnrichment(),
    new TransformStage(),
    DatabaseOutput(),
  ],
});

// Execute pipeline
const result = await orchestrator.execute('reddit-viral', context);
```

## Extending the Pipeline

### Creating Custom Stages

```typescript
import { BasePipelineStage, PipelineContext } from '@/lib/pipeline';

export class CustomStage extends BasePipelineStage {
  name = 'CustomStage';
  description = 'My custom processing stage';

  async process(context: PipelineContext): Promise<PipelineContext> {
    // Your custom logic here
    context.analysis.customData = await this.doSomething();
    return context;
  }

  async validate(context: PipelineContext): Promise<boolean> {
    // Validate required data exists
    return !!context.source.rawData;
  }
}
```

### Creating Custom Context

```typescript
export class CustomContext extends PipelineContext {
  customData: {
    specialField: string;
  };

  constructor() {
    super('custom', {});
    this.customData = {
      specialField: 'value',
    };
  }
}
```

## Best Practices

1. **Single Responsibility**: Each stage should do one thing well
2. **Error Handling**: Use try-catch and log errors appropriately
3. **Validation**: Implement validate() to check prerequisites
4. **Performance**: Use timeOperation() for monitoring
5. **Testing**: Write unit tests for each stage

## Configuration

### Environment Variables

```bash
# API Keys
REDDIT_CLIENT_ID=xxx
REDDIT_CLIENT_SECRET=xxx
OPENAI_API_KEY=xxx
PEXELS_API_KEY=xxx

# Pipeline Options
PIPELINE_DEBUG=true
PIPELINE_MAX_CONCURRENT=5
```

### Pipeline Options

```typescript
interface PipelineOptions {
  parallel?: boolean; // Enable parallel stage execution
  throwOnError?: boolean; // Stop on first error
  debug?: boolean; // Enable debug logging
}
```

## Monitoring & Metrics

The pipeline tracks various metrics:

- Stage execution times
- Success/failure rates
- Content quality scores
- Media acquisition success
- API usage

Access metrics via the orchestrator:

```typescript
const stats = orchestrator.getStats();
const pipelineInfo = orchestrator.getPipelineInfo('reddit-viral');
```

## Error Handling

The pipeline provides robust error handling:

1. **Stage-level errors**: Caught and logged, can continue or stop
2. **Validation errors**: Prevent stage execution
3. **Recovery mechanisms**: Fallbacks for media acquisition
4. **Error tracking**: All errors recorded in context

## Performance Optimization

1. **Lazy Loading**: Services loaded only when needed
2. **Parallel Execution**: Independent stages can run concurrently
3. **Caching**: Media and API responses cached
4. **Rate Limiting**: Built-in rate limiting for external APIs

## Migration Guide

### From Old System

```typescript
// Old way
import { generateStory } from './scripts/generate-story-unified';
const story = await generateStory({ category: 'workplace' });

// New way
import { createAIPipeline } from '@/lib/pipeline';
const pipeline = createAIPipeline('workplace', 'The Terry');
const context = new AIStoryContext('', 'workplace', 'The Terry');
const result = await pipeline.execute(context);
const story = result.output.story;
```

The new pipeline system provides better:

- Modularity and testability
- Error handling and recovery
- Performance monitoring
- Extensibility

## Future Enhancements

- **Dependency Resolution**: Automatic stage ordering
- **Streaming Support**: Process large datasets
- **Plugin System**: Third-party stage support
- **Visual Pipeline Builder**: UI for creating pipelines
- **Real-time Monitoring**: Live pipeline dashboard
