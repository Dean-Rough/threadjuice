# Pipeline Service Integration Layer

This directory contains the adapters that bridge external services with the ThreadJuice pipeline architecture.

## Overview

The integration layer provides clean, consistent interfaces to external services while handling:

- Authentication and rate limiting
- Error handling and retries
- Data transformation
- Caching and optimization
- Service availability checks

## Available Adapters

### 1. RedditAdapter

**Service**: Reddit API  
**Purpose**: Fetches viral content from Reddit  
**Features**:

- OAuth2 authentication
- Smart post selection based on engagement
- Comment fetching with threading
- Rate limit management
- Batch subreddit fetching

```typescript
import { redditAdapter } from './RedditAdapter';

// Fetch posts
const posts = await redditAdapter.fetchPosts({
  subreddit: 'AmItheAsshole',
  sort: 'hot',
  limit: 10,
  minScore: 100,
});

// Fetch comments
const comments = await redditAdapter.fetchComments(postId);
```

### 2. OpenAIAdapter

**Service**: OpenAI GPT API  
**Purpose**: Generates engaging story content  
**Features**:

- Story generation from Reddit posts
- AI story creation from prompts
- Quiz generation
- Persona-based writing styles
- Content validation

```typescript
import { openAIAdapter } from './OpenAIAdapter';

// Generate Reddit story
const story = await openAIAdapter.generateRedditStory(redditContext, comments, {
  personaId: 'the-terry',
  temperature: 0.7,
});

// Generate AI story
const aiStory = await openAIAdapter.generateAIStory(aiContext, {
  personaId: 'the-snarky-sage',
});
```

### 3. PexelsAdapter

**Service**: Pexels API + Wikipedia/Wikimedia  
**Purpose**: Intelligent image selection  
**Features**:

- Smart routing (Wikipedia for entities, Pexels for concepts)
- Fallback strategies
- Image relevance scoring
- Caching for performance
- Multiple search strategies

```typescript
import { pexelsAdapter } from './PexelsAdapter';

// Find best image
const image = await pexelsAdapter.findImage(title, content, category, {
  strategy: 'smart',
});
```

### 4. KlipyAdapter

**Service**: Klipy API (formerly using Giphy)  
**Purpose**: Emotion-based GIF reactions  
**Features**:

- Sentiment-based GIF selection
- Fallback search terms
- Relevance scoring
- Batch processing
- Cache management

```typescript
import { klipyAdapter } from './KlipyAdapter';

// Find reaction GIFs
const gifs = await klipyAdapter.findReactionGifs(emotions, {
  maxGifs: 3,
  safeSearch: true,
});
```

### 5. TwitterAdapter

**Service**: Twitter API v2  
**Purpose**: Twitter drama detection  
**Features**:

- Drama scoring algorithm
- Thread reconstruction
- Quote tweet extraction
- Trending topic detection
- Rate limit management

```typescript
import { twitterAdapter } from './TwitterAdapter';

// Fetch dramatic content
const threads = await twitterAdapter.fetchDramaticContent({
  timeWindow: '24h',
  minDramaScore: 60,
});
```

## Service Configuration

### Environment Variables

```bash
# Reddit API
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=ThreadJuice/1.0

# OpenAI API
OPENAI_API_KEY=your_api_key

# Pexels API (optional - will use fallbacks)
PEXELS_API_KEY=your_api_key

# Twitter API (optional)
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_DRAMA_ENABLED=true
```

### Service Initialization

```typescript
import { initializeServices } from './index';

// Check and initialize all services
const availability = await initializeServices();

// Check individual service status
if (availability.reddit.available) {
  // Reddit API is configured
}
```

## Integration Patterns

### 1. Error Handling

All adapters implement consistent error handling:

```typescript
try {
  const result = await adapter.operation();
} catch (error) {
  // Adapters throw descriptive errors
  // Non-critical operations may return defaults
}
```

### 2. Rate Limiting

Built-in rate limiters prevent API abuse:

```typescript
// Automatic rate limiting
const results = await adapter.batchOperation(items);
// Internally handles delays between requests
```

### 3. Caching

Adapters implement intelligent caching:

```typescript
// First call fetches from API
const image1 = await pexelsAdapter.findImage(title, content, category);

// Subsequent calls may use cache
const image2 = await pexelsAdapter.findImage(title, content, category);
```

### 4. Fallback Strategies

All adapters have fallback mechanisms:

```typescript
// Pexels: Wikipedia → Pexels → Fallback images
// Klipy: Primary terms → Simplified terms → Generic reactions
// Reddit: Multiple subreddits → Lower score threshold
```

## Example Pipelines

See `ExamplePipelines.ts` for complete pipeline configurations:

```typescript
import { createRedditPipeline } from './ExamplePipelines';

const pipeline = createRedditPipeline({
  subreddit: 'tifu',
  personaId: 'the-terry',
  minScore: 500,
});

const result = await pipeline.execute(context);
```

## Best Practices

1. **Always check service availability** before creating pipelines
2. **Use appropriate personas** for different content types
3. **Configure rate limits** based on your API tier
4. **Monitor cache performance** and clear when needed
5. **Handle partial failures** gracefully

## Troubleshooting

### Service Not Available

- Check environment variables
- Verify API credentials
- Check rate limit status

### Poor Content Quality

- Adjust temperature settings
- Try different personas
- Increase minScore thresholds

### Slow Performance

- Enable caching
- Reduce batch sizes
- Check rate limit delays

### Missing Media

- Verify Pexels API key
- Check fallback images
- Review content analysis
