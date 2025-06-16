import { z } from 'zod';

/**
 * Validation schemas for API endpoints
 */

// Post validation schemas
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  category: z.enum(['viral', 'trending', 'chaos', 'wholesome', 'drama']),
  persona_id: z.string().uuid('Invalid persona ID'),
  reddit_thread_id: z.string().optional(),
  reddit_url: z.string().url().optional(),
  featured_image_url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  seo_title: z.string().max(60).optional(),
  seo_description: z.string().max(160).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const postQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => parseInt(val, 10)),
  limit: z.string().optional().default('10').transform(val => Math.min(parseInt(val, 10), 100)),
  category: z.enum(['viral', 'trending', 'chaos', 'wholesome', 'drama']).optional(),
  persona_id: z.string().uuid().optional(),
  published: z.string().optional().transform(val => val === 'true'),
  search: z.string().optional(),
});

// Persona validation schemas
export const createPersonaSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  bio: z.string().min(1, 'Bio is required').max(500),
  tone: z.string().min(1, 'Tone is required').max(100),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  avatar_url: z.string().url().optional(),
  writing_style: z.string().max(1000).optional(),
  sample_content: z.string().optional(),
});

export const updatePersonaSchema = createPersonaSchema.partial();

// Reddit ingestion validation schemas
export const redditIngestionSchema = z.object({
  subreddit: z.string().min(1, 'Subreddit is required'),
  limit: z.number().min(1).max(100).default(25),
  time_filter: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']).default('day'),
  min_score: z.number().min(0).default(100),
  force_refresh: z.boolean().default(false),
});

// Quiz validation schemas
export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
  post_id: z.string().uuid('Invalid post ID'),
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    options: z.array(z.string()).min(2, 'At least 2 options required').max(6, 'Maximum 6 options'),
    correct_answer: z.number().min(0),
    explanation: z.string().optional(),
  })).min(1, 'At least one question is required').max(20, 'Maximum 20 questions'),
});

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000),
  post_id: z.string().uuid('Invalid post ID'),
  parent_id: z.string().uuid().optional(), // For threaded comments
});

// User profile validation schemas
export const updateUserProfileSchema = z.object({
  display_name: z.string().max(50).optional(),
  bio: z.string().max(200).optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.object({
    email_notifications: z.boolean().default(true),
    push_notifications: z.boolean().default(false),
    dark_mode: z.boolean().default(false),
  }).optional(),
});

// API Response schemas
export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
  timestamp: z.string().datetime(),
});

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  total_pages: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean(),
});

export const apiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) => z.object({
  success: z.boolean(),
  data: dataSchema,
  pagination: paginationSchema.optional(),
  timestamp: z.string().datetime(),
});

// Type exports
export type CreatePost = z.infer<typeof createPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
export type PostQuery = z.infer<typeof postQuerySchema>;
export type CreatePersona = z.infer<typeof createPersonaSchema>;
export type UpdatePersona = z.infer<typeof updatePersonaSchema>;
export type RedditIngestion = z.infer<typeof redditIngestionSchema>;
export type CreateQuiz = z.infer<typeof createQuizSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

// Validation helper functions
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid request body' };
  }
}

export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid query parameters' };
  }
}