# TypeScript Type Definitions

## Core Database Types

```typescript
// types/database.ts
export interface Post {
  id: string;
  title: string;
  slug: string;
  hook: string;
  content: ContentBlock[];
  personaId: number;
  status: 'draft' | 'published' | 'archived';
  eventId?: string;
  redditThreadId?: string;
  subreddit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentBlock {
  type: 'paragraph' | 'comment_cluster' | 'image' | 'quiz';
  content: string;
  metadata?: Record<string, any>;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  body: string;
  score: number;
  sentiment: {
    compound: number;
    pos: number;
    neg: number;
  };
  redditCommentId?: string;
  createdAt: string;
}

export interface Persona {
  id: number;
  name: string;
  avatarUrl: string;
  tone: string;
  createdAt: string;
}

export interface Event {
  id: string;
  topic: string;
  summary: string;
  updatedAt: string;
}

export interface Image {
  id: number;
  postId: string;
  imageUrl: string;
  licenseType: string;
  creditText: string;
  sourceLink: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  postId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId?: string;
  answers: number[];
  resultKey: string;
  createdAt: string;
}
```

## API Types

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostsQuery {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'archived';
  persona?: string;
  tag?: string;
}

export interface RedditIngestionRequest {
  subreddit: string;
  threadId?: string;
  persona: 'snarky-sage' | 'buddy' | 'cynic';
  limit?: number;
}

export interface IngestionJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime: string;
  postsCreated?: string[];
  error?: string;
}

export interface QuizSubmission {
  answers: number[];
  completedAt: string;
}

export interface QuizScore {
  score: number;
  totalQuestions: number;
  percentage: number;
  resultKey: string;
}
```

## Reddit API Types

```typescript
// types/reddit.ts
export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  permalink: string;
  url: string;
  is_self: boolean;
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  parent_id: string;
  replies?: RedditComment[];
}

export interface RedditListing<T> {
  kind: string;
  data: {
    children: Array<{
      kind: string;
      data: T;
    }>;
    after?: string;
    before?: string;
  };
}

export interface RedditAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
```

## Component Props Types

```typescript
// types/components.ts
export interface PostCardProps {
  post: Post & { persona: Persona };
  compact?: boolean;
  onShare?: (postId: string) => void;
  className?: string;
}

export interface PersonaBadgeProps {
  persona: Persona;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export interface ShareBarProps {
  url: string;
  title: string;
  image?: string;
  className?: string;
  utmSource?: string;
}

export interface QuizProps {
  quiz: Quiz;
  onComplete: (answers: number[], score: QuizScore) => void;
  className?: string;
}

export interface TrendingFeedProps {
  limit?: number;
  filter?: {
    status?: string;
    persona?: string;
    tag?: string;
  };
  className?: string;
}

export interface CommentScreenshotProps {
  comment: Comment;
  theme?: 'light' | 'dark';
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface AttributedImageProps {
  src: string;
  alt: string;
  attribution: {
    author: string;
    license: string;
    sourceLink: string;
  };
  className?: string;
}
```

## Service Types

```typescript
// types/services.ts
export interface RedditScraperConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

export interface GPTSummarizerConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ImageFetcherConfig {
  wikimediaApiUrl: string;
  unsplashApiKey?: string;
  flickrApiKey?: string;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfter: number;
}

export interface JobQueueItem {
  id: string;
  type: 'reddit-ingestion' | 'image-processing' | 'video-generation';
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}
```

## Validation Schemas (Zod)

```typescript
// types/validation.ts
import { z } from 'zod';

export const PostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  hook: z.string().min(1).max(500),
  content: z.array(z.object({
    type: z.enum(['paragraph', 'comment_cluster', 'image', 'quiz']),
    content: z.string(),
    metadata: z.record(z.any()).optional(),
  })),
  personaId: z.number().int().positive(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  eventId: z.string().uuid().optional(),
  redditThreadId: z.string().optional(),
  subreddit: z.string().optional(),
});

export const CommentSchema = z.object({
  postId: z.string().uuid(),
  author: z.string().min(1),
  body: z.string().min(1),
  score: z.number().int(),
  sentiment: z.object({
    compound: z.number().min(-1).max(1),
    pos: z.number().min(0).max(1),
    neg: z.number().min(0).max(1),
  }),
  redditCommentId: z.string().optional(),
});

export const QuizSchema = z.object({
  postId: z.string().uuid(),
  title: z.string().min(1).max(200),
  questions: z.array(z.object({
    question: z.string().min(1),
    options: z.array(z.string()).min(2).max(6),
    correct: z.number().int().min(0),
    explanation: z.string().optional(),
  })).min(1).max(10),
});

export const RedditIngestionSchema = z.object({
  subreddit: z.string().min(1).max(50),
  threadId: z.string().optional(),
  persona: z.enum(['snarky-sage', 'buddy', 'cynic']),
  limit: z.number().int().min(1).max(25).default(5),
});

export const PostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  persona: z.string().optional(),
  tag: z.string().optional(),
});
```

## Environment Types

```typescript
// types/env.ts
export interface EnvironmentVariables {
  // Core
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  
  // Database
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // Reddit API
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  REDDIT_USER_AGENT: string;
  
  // AI Services
  OPENAI_API_KEY: string;
  ELEVENLABS_API_KEY?: string;
  
  // Image Services
  UNSPLASH_ACCESS_KEY?: string;
  FLICKR_API_KEY?: string;
  BANNERBEAR_API_KEY?: string;
  
  // Analytics & Monitoring
  VERCEL_ANALYTICS_ID?: string;
  SENTRY_DSN?: string;
}
```

## Utility Types

```typescript
// types/utils.ts
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : any;

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
```

## Error Types

```typescript
// types/errors.ts
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public details: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RedditAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public rateLimitReset?: number
  ) {
    super(message);
    this.name = 'RedditAPIError';
  }
}

export class OpenAIError extends Error {
  constructor(
    message: string,
    public type: string,
    public code?: string
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}
``` 