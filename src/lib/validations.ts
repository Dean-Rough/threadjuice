import { z } from 'zod';

// Base schemas for database types
export const ContentBlockSchema = z.object({
  type: z.enum([
    'paragraph',
    'comment_cluster',
    'image',
    'quiz',
    'heading',
    'list',
  ]),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const QuizQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z
    .array(z.string())
    .min(2, 'At least 2 options required')
    .max(6, 'Maximum 6 options allowed'),
  correct: z.number().min(0).max(5),
  explanation: z.string().optional(),
});

// Post validation schemas
export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  hook: z
    .string()
    .min(1, 'Hook is required')
    .max(500, 'Hook must be less than 500 characters'),
  content: z.array(ContentBlockSchema).min(1, 'Content is required'),
  persona_id: z.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  category: z.string().optional(),
  layout_style: z.number().int().min(1).max(7).default(1),
  featured: z.boolean().default(false),
  reddit_thread_id: z.string().optional(),
  subreddit: z.string().optional(),
  seo_title: z
    .string()
    .max(60, 'SEO title must be less than 60 characters')
    .optional(),
  seo_description: z
    .string()
    .max(160, 'SEO description must be less than 160 characters')
    .optional(),
  featured_image: z
    .string()
    .url('Featured image must be a valid URL')
    .optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial().extend({
  id: z.string().uuid('Invalid post ID'),
});

export const PostQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z
    .enum([
      'created_at',
      'updated_at',
      'view_count',
      'share_count',
      'trending_score',
    ])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// Quiz validation schemas
export const CreateQuizSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  questions: z
    .array(QuizQuestionSchema)
    .min(1, 'At least 1 question required')
    .max(20, 'Maximum 20 questions allowed'),
});

export const SubmitQuizSchema = z.object({
  quiz_id: z.string().uuid('Invalid quiz ID'),
  answers: z
    .array(z.number().min(0).max(5))
    .min(1, 'At least 1 answer required'),
  user_id: z.string().optional(),
  completion_time: z.number().int().min(0).optional(),
});

// Comment validation schemas
export const CreateCommentSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
  parent_id: z.string().uuid().optional(),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(50, 'Author name must be less than 50 characters'),
  body: z
    .string()
    .min(1, 'Comment body is required')
    .max(2000, 'Comment must be less than 2000 characters'),
  reddit_comment_id: z.string().optional(),
});

// Category validation schemas
export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional(),
  icon: z
    .string()
    .max(50, 'Icon name must be less than 50 characters')
    .optional(),
});

// Persona validation schemas
export const CreatePersonaSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  avatar_url: z.string().url('Avatar URL must be a valid URL').optional(),
  tone: z
    .string()
    .min(1, 'Tone is required')
    .max(50, 'Tone must be less than 50 characters'),
  style_preferences: z.record(z.any()).optional(),
  target_audience: z
    .string()
    .max(200, 'Target audience must be less than 200 characters')
    .optional(),
  content_focus: z.array(z.string()).optional(),
});

// User interaction validation schemas
export const CreateInteractionSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  post_id: z.string().uuid().optional(),
  interaction_type: z.enum([
    'view',
    'share',
    'quiz_complete',
    'comment',
    'like',
    'bookmark',
  ]),
  metadata: z.record(z.any()).optional(),
});

// Image validation schemas
export const CreateImageSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
  url: z.string().url('URL must be a valid URL'),
  alt_text: z
    .string()
    .max(200, 'Alt text must be less than 200 characters')
    .optional(),
  caption: z
    .string()
    .max(500, 'Caption must be less than 500 characters')
    .optional(),
  license_type: z.string().min(1, 'License type is required'),
  author: z
    .string()
    .max(100, 'Author name must be less than 100 characters')
    .optional(),
  credit_text: z
    .string()
    .max(200, 'Credit text must be less than 200 characters')
    .optional(),
  source_link: z.string().url('Source link must be a valid URL').optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  file_size: z.number().int().positive().optional(),
});

// Event validation schemas
export const CreateEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  category: z
    .string()
    .max(50, 'Category must be less than 50 characters')
    .optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

// Reddit ingestion validation schemas
export const RedditIngestionSchema = z.object({
  subreddit: z
    .string()
    .min(1, 'Subreddit is required')
    .max(50, 'Subreddit must be less than 50 characters'),
  thread_id: z.string().optional(),
  persona: z.enum(['snarky-sage', 'buddy', 'cynic']),
  limit: z.number().int().min(1).max(25).default(5),
});

// Search validation schemas
export const SearchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Query must be less than 100 characters'),
  type: z.enum(['posts', 'comments', 'all']).default('posts'),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  page: z.coerce.number().min(1).default(1),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.string()).optional(),
  statusCode: z.number().optional(),
});

// Success response schemas
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const PaginatedResponseSchema = z.object({
  items: z.array(z.any()),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Utility function to validate request body
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.reduce(
        (acc, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );

      throw new ValidationError('Validation failed', details);
    }
    throw error;
  }
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(
    message: string,
    public details: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Type exports for TypeScript
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type PostQueryInput = z.infer<typeof PostQuerySchema>;
export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;
export type SubmitQuizInput = z.infer<typeof SubmitQuizSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type CreatePersonaInput = z.infer<typeof CreatePersonaSchema>;
export type CreateInteractionInput = z.infer<typeof CreateInteractionSchema>;
export type CreateImageInput = z.infer<typeof CreateImageSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type RedditIngestionInput = z.infer<typeof RedditIngestionSchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;

// User validation schemas
export const userSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  avatar: z.string().url().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  isVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
});

export const updateUserSchema = userSchema
  .omit({
    id: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

// Thread validation schemas
export const threadSchema = z.object({
  id: z.string().min(1, 'Thread ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10,000 characters'),
  authorId: z.string().min(1, 'Author ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([]),
  isPublished: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  viewCount: z.number().int().min(0).default(0),
  likeCount: z.number().int().min(0).default(0),
  replyCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createThreadSchema = threadSchema.omit({
  id: true,
  viewCount: true,
  likeCount: true,
  replyCount: true,
  createdAt: true,
  updatedAt: true,
});

export const updateThreadSchema = threadSchema
  .omit({
    id: true,
    authorId: true,
    viewCount: true,
    likeCount: true,
    replyCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

// Reply validation schemas
export const replySchema = z.object({
  id: z.string().min(1, 'Reply ID is required'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5,000 characters'),
  authorId: z.string().min(1, 'Author ID is required'),
  threadId: z.string().min(1, 'Thread ID is required'),
  parentReplyId: z.string().optional(), // For nested replies
  likeCount: z.number().int().min(0).default(0),
  isEdited: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createReplySchema = replySchema.omit({
  id: true,
  likeCount: true,
  isEdited: true,
  createdAt: true,
  updatedAt: true,
});

export const updateReplySchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5,000 characters'),
});

// Category validation schemas
export const categorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional(),
  threadCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCategorySchema = categorySchema.omit({
  id: true,
  threadCount: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCategorySchema = categorySchema
  .omit({
    id: true,
    threadCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

// Like validation schemas
export const likeSchema = z.object({
  id: z.string().min(1, 'Like ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  threadId: z.string().optional(),
  replyId: z.string().optional(),
  createdAt: z.date(),
});

export const createLikeSchema = likeSchema.omit({
  id: true,
  createdAt: true,
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'popular', 'trending']).default('newest'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const filterSchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  isPublished: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(['newest', 'oldest', 'popular', 'trending']).default('newest'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  pagination: z
    .object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    })
    .optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// Form validation schemas for client-side
export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerFormSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      ),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Thread = z.infer<typeof threadSchema>;
export type CreateThread = z.infer<typeof createThreadSchema>;
export type UpdateThread = z.infer<typeof updateThreadSchema>;

export type Reply = z.infer<typeof replySchema>;
export type CreateReply = z.infer<typeof createReplySchema>;
export type UpdateReply = z.infer<typeof updateReplySchema>;

export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type Like = z.infer<typeof likeSchema>;
export type CreateLike = z.infer<typeof createLikeSchema>;

export type SearchParams = z.infer<typeof searchSchema>;
export type FilterParams = z.infer<typeof filterSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
