# API Routes Specification

## Overview

ThreadJuice API provides endpoints for content management, user interactions, and viral content aggregation. Built with Next.js 15 App Router and TypeScript.

## Authentication

Currently using mock authentication. Future implementation will integrate user authentication system:

```typescript
// Future authentication pattern
import { auth } from '@/lib/auth';
const { userId } = await auth();
if (!userId && requiresAuth) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Core Endpoints

### Posts API

#### GET /api/posts

Fetch posts with filtering and pagination.

**Query Parameters:**

```typescript
{
  page?: number;              // Default: 1
  limit?: number;             // Default: 12, Max: 50
  category?: string;          // Filter by category slug
  author?: string;            // Filter by author name
  trending?: boolean;         // Show trending posts only
  featured?: boolean;         // Show featured posts only
  search?: string;            // Search in title and excerpt
}
```

**Response:**

```typescript
{
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    image_url?: string;
    category: string;
    author: string;
    view_count: number;
    upvote_count: number;
    comment_count: number;
    share_count: number;
    bookmark_count: number;
    trending: boolean;
    featured: boolean;
    created_at: string;
    updated_at: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
}
```

#### GET /api/posts/[slug]

Get single post with full content.

**Response:**

```typescript
{
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: {
      sections: Array<{
        type: 'paragraph' | 'heading' | 'quote' | 'image';
        content: string;
        metadata?: any;
      }>;
    };
    image_url?: string;
    category: string;
    author: string;
    persona: {
      name: string;
      slug: string;
      bio: string;
      avatar_url: string;
      story_count: number;
      rating: number;
    };
    tags: string[];
    stats: {
      view_count: number;
      upvote_count: number;
      comment_count: number;
      share_count: number;
      bookmark_count: number;
    };
    trending: boolean;
    featured: boolean;
    reddit_source?: {
      thread_id: string;
      subreddit: string;
      original_url: string;
    };
    created_at: string;
    updated_at: string;
  };
}
```

#### POST /api/posts

Create new post (Admin only - future feature).

**Request Body:**

```typescript
{
  title: string;
  slug?: string;              // Auto-generated if not provided
  excerpt?: string;
  content: {
    sections: Array<{
      type: 'paragraph' | 'heading' | 'quote' | 'image';
      content: string;
      metadata?: any;
    }>;
  };
  image_url?: string;
  category: string;
  author: string;
  persona_id: number;
  tags?: string[];
  trending?: boolean;
  featured?: boolean;
  reddit_source?: {
    thread_id: string;
    subreddit: string;
  };
}
```

### User Interactions API

#### POST /api/interactions

Record user interactions (upvotes, shares, bookmarks, views).

**Request Body:**

```typescript
{
  post_id: string;
  interaction_type: 'upvote' | 'downvote' | 'bookmark' | 'share' | 'view';
  metadata?: {
    share_platform?: 'twitter' | 'facebook' | 'reddit' | 'copy';
    user_agent?: string;
    referrer?: string;
  };
}
```

**Response:**

```typescript
{
  success: boolean;
  interaction_id: string;
  new_count: number; // Updated count for this interaction type
}
```

#### GET /api/interactions/[postId]

Get interaction stats for a specific post.

**Response:**

```typescript
{
  post_id: string;
  stats: {
    upvote_count: number;
    downvote_count: number;
    bookmark_count: number;
    share_count: number;
    view_count: number;
  };
  user_interactions?: {       // If user is authenticated
    has_upvoted: boolean;
    has_bookmarked: boolean;
    has_shared: boolean;
  };
}
```

### Categories API

#### GET /api/categories

Get all categories with post counts.

**Response:**

```typescript
{
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    post_count: number;
    color: string; // Hex color code
  }>;
}
```

#### GET /api/categories/[slug]

Get category details with recent posts.

**Query Parameters:**

```typescript
{
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
{
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    post_count: number;
    color: string;
  };
  posts: Post[];              // Same format as GET /api/posts
  meta: PaginationMeta;
}
```

### Authors API

#### GET /api/authors

Get all author personas.

**Response:**

```typescript
{
  authors: Array<{
    id: number;
    name: string;
    slug: string;
    bio: string;
    avatar_url: string;
    tone: string;
    story_count: number;
    rating: number;
    created_at: string;
  }>;
}
```

#### GET /api/authors/[slug]

Get author details with their posts.

**Query Parameters:**

```typescript
{
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
{
  author: {
    id: number;
    name: string;
    slug: string;
    bio: string;
    avatar_url: string;
    tone: string;
    story_count: number;
    rating: number;
    created_at: string;
  };
  posts: Post[];
  meta: PaginationMeta;
  stats: {
    total_views: number;
    total_upvotes: number;
    average_engagement: number;
  };
}
```

### Comments API

#### GET /api/comments/[postId]

Get comments for a specific post.

**Query Parameters:**

```typescript
{
  sort?: 'newest' | 'oldest' | 'top';  // Default: 'top'
  limit?: number;                       // Default: 50
}
```

**Response:**

```typescript
{
  comments: Array<{
    id: string;
    post_id: string;
    parent_id?: string; // For threading
    author_name: string;
    content: string;
    upvote_count: number;
    downvote_count: number;
    is_reddit_excerpt: boolean;
    reddit_score?: number;
    created_at: string;
    replies?: Comment[]; // Nested replies
  }>;
  total_count: number;
}
```

#### POST /api/comments

Create new comment (requires authentication).

**Request Body:**

```typescript
{
  post_id: string;
  parent_id?: string;         // For replies
  content: string;
}
```

### Analytics API

#### POST /api/analytics/track

Track user events for analytics.

**Request Body:**

```typescript
{
  event_type: 'page_view' | 'click' | 'scroll' | 'time_on_page';
  entity_type?: 'post' | 'category' | 'author';
  entity_id?: string;
  metadata?: {
    page_url: string;
    referrer?: string;
    user_agent?: string;
    session_id?: string;
    scroll_depth?: number;
    time_spent?: number;      // milliseconds
  };
}
```

#### GET /api/analytics/dashboard

Get analytics dashboard data (Admin only).

**Response:**

```typescript
{
  overview: {
    total_posts: number;
    total_views: number;
    total_interactions: number;
    active_users_30d: number;
  }
  top_posts: Array<{
    id: string;
    title: string;
    views: number;
    engagement_score: number;
  }>;
  top_categories: Array<{
    name: string;
    post_count: number;
    total_views: number;
  }>;
  traffic_sources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  engagement_trends: Array<{
    date: string;
    views: number;
    interactions: number;
  }>;
}
```

## Future Endpoints

### Content Ingestion (Planned)

#### POST /api/ingest/reddit

Trigger Reddit content ingestion.

**Request Body:**

```typescript
{
  subreddit: string;
  thread_id?: string;
  persona: string;
  limit?: number;
}
```

#### GET /api/ingest/status/[jobId]

Check ingestion job status.

### User Management (Planned)

#### POST /api/auth/register

#### POST /api/auth/login

#### GET /api/users/profile

#### PUT /api/users/preferences

## Error Responses

All endpoints return consistent error formats:

```typescript
// 400 Bad Request
{
  error: 'VALIDATION_ERROR';
  message: 'Invalid request data';
  details?: {
    field: 'error message';
  };
}

// 401 Unauthorized
{
  error: 'UNAUTHORIZED';
  message: 'Authentication required';
}

// 403 Forbidden
{
  error: 'FORBIDDEN';
  message: 'Insufficient permissions';
}

// 404 Not Found
{
  error: 'NOT_FOUND';
  message: 'Resource not found';
}

// 429 Too Many Requests
{
  error: 'RATE_LIMIT_EXCEEDED';
  message: 'Too many requests';
  retry_after: number;        // Seconds
}

// 500 Internal Server Error
{
  error: 'INTERNAL_SERVER_ERROR';
  message: 'Something went wrong';
  request_id: string;
}
```

## Rate Limiting

- **Public endpoints**: 100 requests/minute per IP
- **Interaction endpoints**: 500 requests/minute per IP
- **Analytics endpoints**: 1000 requests/minute per IP
- **Admin endpoints**: 50 requests/minute per authenticated user

## Validation

Request validation using Zod schemas:

```typescript
import { z } from 'zod';

const PostQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(50))
    .optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  trending: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  featured: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  search: z.string().min(1).optional(),
});

const InteractionSchema = z.object({
  post_id: z.string().uuid(),
  interaction_type: z.enum(['upvote', 'downvote', 'bookmark', 'share', 'view']),
  metadata: z
    .object({
      share_platform: z
        .enum(['twitter', 'facebook', 'reddit', 'copy'])
        .optional(),
      user_agent: z.string().optional(),
      referrer: z.string().url().optional(),
    })
    .optional(),
});
```

## Response Headers

All API responses include:

```typescript
{
  'Content-Type': 'application/json',
  'X-RateLimit-Limit': string,
  'X-RateLimit-Remaining': string,
  'X-RateLimit-Reset': string,
  'X-Request-ID': string,
}
```

## Testing

API endpoints can be tested using the provided test utilities:

```bash
# Run API integration tests
npm run test:api

# Test specific endpoint
npm run test -- --testNamePattern="Posts API"
```
