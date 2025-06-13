# Component Breakdown

## TypeScript Interfaces

```typescript
// Core data types
interface Post {
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

interface ContentBlock {
  type: 'paragraph' | 'comment_cluster' | 'image' | 'quiz';
  content: string;
  metadata?: Record<string, any>;
}

interface Comment {
  id: string;
  postId: string;
  author: string;
  body: string;
  score: number;
  sentiment: { compound: number; pos: number; neg: number; };
  redditCommentId?: string;
}

interface Persona {
  id: number;
  name: string;
  avatarUrl: string;
  tone: string;
}

interface Quiz {
  id: string;
  postId: string;
  title: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}
```

## Frontend Components

### Core UI Components
```typescript
// components/ui/PostCard.tsx
interface PostCardProps {
  post: Post & { persona: Persona };
  compact?: boolean;
  onShare?: (postId: string) => void;
}
export function PostCard({ post, compact = false, onShare }: PostCardProps)

// components/ui/PersonaBadge.tsx
interface PersonaBadgeProps {
  persona: Persona;
  size?: 'sm' | 'md' | 'lg';
}
export function PersonaBadge({ persona, size = 'md' }: PersonaBadgeProps)

// components/ui/ShareBar.tsx
interface ShareBarProps {
  url: string;
  title: string;
  image?: string;
  className?: string;
}
export function ShareBar({ url, title, image, className }: ShareBarProps)
```

### Feature Components
```typescript
// components/features/Quiz.tsx
interface QuizProps {
  quiz: Quiz;
  onComplete: (answers: number[], score: number) => void;
}
export function Quiz({ quiz, onComplete }: QuizProps)

// components/features/TrendingFeed.tsx
interface TrendingFeedProps {
  limit?: number;
  filter?: { status?: string; persona?: string; };
}
export function TrendingFeed({ limit = 20, filter }: TrendingFeedProps)

// components/features/CommentScreenshot.tsx
interface CommentScreenshotProps {
  comment: Comment;
  theme?: 'light' | 'dark';
  className?: string;
}
export function CommentScreenshot({ comment, theme = 'light' }: CommentScreenshotProps)
```

## Page Components

```typescript
// app/page.tsx - Landing page
export default function HomePage() {
  return (
    <div className="space-y-8">
      <Hero />
      <TrendingFeed limit={10} />
    </div>
  );
}

// app/posts/[slug]/page.tsx - Post detail
interface PostPageProps {
  params: { slug: string };
}
export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);
  return <PostDetail post={post} />;
}

// app/(auth)/dashboard/page.tsx - User dashboard
export default function DashboardPage() {
  const { userId } = auth();
  return <UserDashboard userId={userId} />;
}
```

## Backend Services

```typescript
// lib/database.ts - Supabase client
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function getPosts(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, persona:personas(*)')
    .eq('status', params.status || 'published')
    .range((params.page - 1) * params.limit, params.page * params.limit - 1);
  
  if (error) throw error;
  return data;
}

// lib/redditScraper.ts - Reddit API client
interface RedditConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

export class RedditScraper {
  private accessToken?: string;
  
  constructor(private config: RedditConfig) {}
  
  async authenticate(): Promise<void> {
    // OAuth2 flow implementation
  }
  
  async getHotPosts(subreddit: string, limit = 25): Promise<RedditPost[]> {
    // API call with rate limiting
  }
  
  async getComments(threadId: string): Promise<RedditComment[]> {
    // Fetch thread comments
  }
}

// lib/gptSummariser.ts - OpenAI integration
import OpenAI from 'openai';

export class GPTSummariser {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }
  
  async summarizeThread(
    thread: RedditPost,
    comments: RedditComment[],
    persona: Persona
  ): Promise<ContentBlock[]> {
    const prompt = this.buildPrompt(thread, comments, persona);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    
    return this.parseResponse(response.choices[0].message.content);
  }
}
```

## API Route Handlers

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GetPostsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = GetPostsSchema.parse(Object.fromEntries(searchParams));
    
    const posts = await getPosts(params);
    const total = await getPostsCount(params);
    
    return NextResponse.json({
      items: posts,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: error.message },
      { status: 400 }
    );
  }
}

// app/api/ingest/reddit/route.ts
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const jobId = await queueRedditIngestion(body, userId);
  
  return NextResponse.json({
    jobId,
    status: 'queued',
    estimatedTime: '2-3 minutes',
  });
}
```

## State Management

### Client State (React)
```typescript
// hooks/usePosts.ts
import { useQuery } from '@tanstack/react-query';

export function usePosts(params: GetPostsParams) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => fetchPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// hooks/useQuiz.ts
export function useQuiz(quizId: string) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const submitAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
      onComplete(newAnswers, calculateScore(newAnswers));
    }
  };
  
  return { answers, currentQuestion, isComplete, submitAnswer };
}
```

### Server State (Database)
```typescript
// lib/queries.ts - Reusable database queries
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      persona:personas(*),
      comments(*),
      images(*),
      quiz:quizzes(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
    
  return data;
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();
    
  if (error) throw error;
    return data;
} 