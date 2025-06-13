# API Routes Specification

## Authentication
All protected routes use Clerk's `auth()` middleware:
```typescript
import { auth } from '@clerk/nextjs/server';
const { userId } = auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

## Endpoints

### Posts
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/posts` | ❌ | List paginated posts |
| GET | `/api/posts/[id]` | ❌ | Single post + relations |
| POST | `/api/posts` | 🔒 | Create post (admin) |
| PUT | `/api/posts/[id]` | 🔒 | Update post |
| DELETE | `/api/posts/[id]` | 🔒 | Delete post |

#### GET /api/posts
**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  status?: 'published' | 'draft' | 'archived';
  persona?: string;     // Filter by persona name
  tag?: string;         // Filter by tag
}
```

**Response:**
```typescript
{
  items: Post[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

#### GET /api/posts/[id]
**Response:**
```typescript
{
  post: Post & {
    persona: Persona;
    comments: Comment[];
    images: Image[];
    quiz?: Quiz;
  }
}
```

### Content Ingestion
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/ingest/reddit` | 🔒 | Trigger Reddit scrape |
| GET | `/api/ingest/status/[jobId]` | 🔒 | Check ingestion status |

#### POST /api/ingest/reddit
**Request Body:**
```typescript
{
  subreddit: string;      // e.g., "TIFU"
  threadId?: string;      // Specific thread, or fetch hot posts
  persona: 'snarky-sage' | 'buddy' | 'cynic';
  limit?: number;         // Max posts to process (default: 5)
}
```

**Response:**
```typescript
{
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime: string;  // e.g., "2-3 minutes"
  postsCreated?: string[]; // Post IDs when completed
}
```

### Quizzes
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/quizzes` | 🔒 | Create quiz |
| GET | `/api/quizzes/[id]` | ❌ | Get quiz |
| POST | `/api/quizzes/[id]/submit` | ❌ | Submit answers |

#### POST /api/quizzes
**Request Body:**
```typescript
{
  postId: string;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;      // Index of correct answer
    explanation?: string;
  }>;
}
```

### Events
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/events/aggregate` | 🔒 | Group related posts |
| GET | `/api/events/[id]` | ❌ | Get event + posts |

## Error Responses
```typescript
// 400 Bad Request
{
  error: 'VALIDATION_ERROR';
  message: string;
  details?: Record<string, string>;
}

// 401 Unauthorized
{
  error: 'UNAUTHORIZED';
  message: 'Authentication required';
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
  retryAfter: number; // Seconds
}

// 500 Internal Server Error
{
  error: 'INTERNAL_SERVER_ERROR';
  message: 'Something went wrong';
  requestId: string;
}
```

## Rate Limiting
- **Public endpoints**: 100 requests/minute per IP
- **Authenticated endpoints**: 1000 requests/minute per user
- **Ingestion endpoints**: 10 requests/minute per user

## Validation
Use Zod schemas for request validation:
```typescript
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.object({}).passthrough(),
  personaId: z.number().int().positive(),
});
``` 