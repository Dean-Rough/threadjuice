# AI Agent Build Roadmap

## Prerequisites
- Next.js 15 project initialized ✅
- Clerk authentication configured ✅
- Jest and Playwright testing setup ✅

## Phase 1: Foundation & Database (MVP Core)

### Task 1.1: Database Setup
**Prompt**: Create Supabase database schema and connection utilities
```bash
# Install dependencies
npm install @supabase/supabase-js zod

# Create lib/database.ts with Supabase client
# Create types/database.ts with TypeScript interfaces
# Create database/schema.sql with all tables from docs/DB_SCHEMA.md
```
**Files to create**:
- `lib/database.ts` - Supabase client configuration
- `types/database.ts` - TypeScript interfaces for all entities
- `database/schema.sql` - Complete SQL schema
- `database/seed.sql` - Persona seed data

**Acceptance criteria**:
- Supabase client connects successfully
- All TypeScript interfaces match database schema
- Seed data creates 3 default personas

### Task 1.2: Environment Configuration
**Prompt**: Create complete environment setup with validation
```bash
# Create .env.example with all required variables
# Create lib/env.ts with Zod validation
# Update docs/DEPLOYMENT.md with setup instructions
```
**Files to create**:
- `.env.example` - All environment variables with examples
- `lib/env.ts` - Environment validation using Zod
- Update existing `.env.local` with missing variables

**Acceptance criteria**:
- Environment validation throws clear errors for missing vars
- All API keys properly typed and validated

### Task 1.3: Core API Routes
**Prompt**: Implement basic CRUD API routes for posts with authentication
```typescript
// Create app/api/posts/route.ts
// Implement GET (list) and POST (create) with Clerk auth
// Add Zod validation schemas
// Include proper error handling and pagination
```
**Files to create**:
- `app/api/posts/route.ts` - List and create posts
- `app/api/posts/[id]/route.ts` - Get, update, delete single post
- `lib/validations.ts` - Zod schemas for all API endpoints

**Acceptance criteria**:
- GET /api/posts returns paginated results
- POST /api/posts requires authentication
- All endpoints return consistent error format

## Phase 2: Reddit Integration & AI Processing

### Task 2.1: Reddit API Client
**Prompt**: Build Reddit scraper with OAuth2 authentication and rate limiting
```typescript
// Create lib/redditScraper.ts
// Implement OAuth2 flow for Reddit API
// Add exponential backoff for rate limiting
// Create methods: getHotPosts(), getComments(), authenticate()
```
**Files to create**:
- `lib/redditScraper.ts` - Reddit API client class
- `lib/rateLimiter.ts` - Rate limiting utility
- `types/reddit.ts` - Reddit API response types

**Acceptance criteria**:
- Successfully authenticates with Reddit API
- Fetches hot posts from specified subreddit
- Handles rate limits gracefully with backoff

### Task 2.2: OpenAI Integration
**Prompt**: Create GPT-4 content summarizer with persona-based prompts
```typescript
// Create lib/gptSummariser.ts
// Implement OpenAI client with streaming support
// Create persona-specific system prompts
// Add content validation and safety checks
```
**Files to create**:
- `lib/gptSummariser.ts` - OpenAI integration class
- `lib/prompts.ts` - System prompts for each persona
- `lib/contentValidator.ts` - Content safety validation

**Acceptance criteria**:
- Generates structured content from Reddit threads
- Applies correct persona voice and tone
- Validates content for safety and quality

### Task 2.3: Content Ingestion Pipeline
**Prompt**: Build complete Reddit-to-database pipeline with job queue
```typescript
// Create app/api/ingest/reddit/route.ts
// Implement background job processing
// Connect Reddit scraper → GPT summarizer → database
// Add job status tracking and error handling
```
**Files to create**:
- `app/api/ingest/reddit/route.ts` - Ingestion trigger endpoint
- `app/api/ingest/status/[jobId]/route.ts` - Job status endpoint
- `lib/jobQueue.ts` - Background job processing
- `lib/ingestionService.ts` - Complete ingestion pipeline

**Acceptance criteria**:
- Processes Reddit threads into structured posts
- Tracks job progress and status
- Handles errors gracefully with retry logic

## Phase 3: Frontend Components & UI

### Task 3.1: Core UI Components
**Prompt**: Create reusable UI components with TypeScript and Tailwind
```typescript
// Create components/ui/PostCard.tsx
// Create components/ui/PersonaBadge.tsx
// Create components/ui/ShareBar.tsx
// Add proper TypeScript interfaces and Tailwind styling
```
**Files to create**:
- `components/ui/PostCard.tsx` - Post preview card
- `components/ui/PersonaBadge.tsx` - Persona avatar and name
- `components/ui/ShareBar.tsx` - Social sharing buttons
- `components/ui/LoadingSpinner.tsx` - Loading states

**Acceptance criteria**:
- Components are fully typed with proper interfaces
- Responsive design works on mobile and desktop
- Consistent styling with design system

### Task 3.2: Feature Components
**Prompt**: Build complex feature components with state management
```typescript
// Create components/features/TrendingFeed.tsx
// Create components/features/Quiz.tsx
// Add React Query for data fetching
// Implement proper loading and error states
```
**Files to create**:
- `components/features/TrendingFeed.tsx` - Post feed with pagination
- `components/features/Quiz.tsx` - Interactive quiz component
- `components/features/PostDetail.tsx` - Full post view
- `hooks/usePosts.ts` - React Query hooks for posts

**Acceptance criteria**:
- TrendingFeed loads posts with infinite scroll
- Quiz component tracks answers and calculates scores
- All components handle loading and error states

### Task 3.3: Page Implementation
**Prompt**: Create all main pages with proper routing and SEO
```typescript
// Update app/page.tsx with trending feed
// Create app/posts/[slug]/page.tsx for post details
// Add proper metadata and OpenGraph tags
// Implement protected routes for dashboard
```
**Files to create**:
- Update `app/page.tsx` - Landing page with trending feed
- `app/posts/[slug]/page.tsx` - Dynamic post pages
- `app/(auth)/dashboard/page.tsx` - User dashboard
- `lib/metadata.ts` - SEO and OpenGraph utilities

**Acceptance criteria**:
- All pages render correctly with proper SEO
- Dynamic routing works for post slugs
- Protected routes require authentication

## Phase 4: Advanced Features

### Task 4.1: Quiz System
**Prompt**: Implement complete quiz creation and submission system
```typescript
// Create app/api/quizzes/route.ts
// Create app/api/quizzes/[id]/submit/route.ts
// Add quiz result tracking and analytics
// Implement shareable quiz results
```
**Files to create**:
- `app/api/quizzes/route.ts` - Quiz CRUD operations
- `app/api/quizzes/[id]/submit/route.ts` - Quiz submission
- `lib/quizService.ts` - Quiz business logic
- `components/features/QuizResults.tsx` - Results display

**Acceptance criteria**:
- Users can take quizzes and see results
- Quiz results are stored and trackable
- Results are shareable with custom images

### Task 4.2: Image Management
**Prompt**: Build Creative Commons image sourcing and storage system
```typescript
// Create lib/imageFetcher.ts
// Integrate Wikimedia Commons and Unsplash APIs
// Add Supabase Storage for image uploads
// Implement automatic attribution display
```
**Files to create**:
- `lib/imageFetcher.ts` - CC image sourcing
- `lib/imageStorage.ts` - Supabase Storage integration
- `components/ui/AttributedImage.tsx` - Image with attribution
- `app/api/images/route.ts` - Image management API

**Acceptance criteria**:
- Fetches legal images with proper licensing
- Stores images in Supabase Storage
- Displays proper attribution on all images

### Task 4.3: Event Aggregation
**Prompt**: Create system to group related posts by topic
```typescript
// Create lib/eventAggregator.ts
// Implement keyword extraction and topic matching
// Add app/api/events/aggregate/route.ts
// Create event-based post grouping UI
```
**Files to create**:
- `lib/eventAggregator.ts` - Topic clustering logic
- `app/api/events/aggregate/route.ts` - Event aggregation API
- `components/features/EventCluster.tsx` - Related posts display
- `lib/topicExtractor.ts` - Keyword and topic extraction

**Acceptance criteria**:
- Groups related posts under common events
- Extracts meaningful topics from content
- Displays event clusters in UI

## Phase 5: Testing & Quality

### Task 5.1: Unit Testing
**Prompt**: Write comprehensive unit tests for all utilities and services
```typescript
// Create tests for lib/redditScraper.ts
// Create tests for lib/gptSummariser.ts
// Add tests for all API routes
// Achieve 80%+ code coverage
```
**Files to create**:
- `src/__tests__/lib/redditScraper.test.ts`
- `src/__tests__/lib/gptSummariser.test.ts`
- `src/__tests__/api/posts.test.ts`
- `src/__tests__/components/PostCard.test.tsx`

**Acceptance criteria**:
- All critical functions have unit tests
- Tests use proper mocking for external APIs
- Code coverage above 80%

### Task 5.2: Integration Testing
**Prompt**: Create end-to-end tests for critical user flows
```typescript
// Create Playwright tests for authentication flow
// Test complete post creation and viewing
// Test quiz taking and result sharing
// Add CI/CD pipeline integration
```
**Files to create**:
- `tests/auth-flow.spec.ts` - Authentication testing
- `tests/post-creation.spec.ts` - Content creation flow
- `tests/quiz-interaction.spec.ts` - Quiz functionality
- `.github/workflows/ci.yml` - CI/CD pipeline

**Acceptance criteria**:
- All critical user flows tested end-to-end
- Tests run in CI/CD pipeline
- Tests cover mobile and desktop viewports

## Phase 6: Production Deployment

### Task 6.1: Production Configuration
**Prompt**: Configure production environment with monitoring and analytics
```typescript
// Set up Vercel deployment configuration
// Configure Supabase production database
// Add error tracking with Sentry
// Implement analytics and monitoring
```
**Files to create**:
- `vercel.json` - Deployment configuration
- `next.config.js` - Production optimizations
- `lib/analytics.ts` - Analytics integration
- `lib/monitoring.ts` - Error tracking setup

**Acceptance criteria**:
- Application deploys successfully to production
- Database migrations run automatically
- Error tracking and analytics are functional

### Task 6.2: Performance Optimization
**Prompt**: Optimize application for production performance
```typescript
// Implement image optimization and lazy loading
// Add caching strategies for API responses
// Optimize bundle size and loading times
// Add performance monitoring
```
**Files to create**:
- `lib/imageOptimization.ts` - Image optimization utilities
- `lib/cache.ts` - Response caching strategies
- `components/ui/LazyImage.tsx` - Lazy loading component
- Performance monitoring configuration

**Acceptance criteria**:
- Page load times under 3 seconds
- Images are optimized and lazy loaded
- API responses are properly cached

---

## Task Execution Guidelines

### For AI Agents:
1. **Read the task prompt carefully** - Each task has specific implementation requirements
2. **Create all specified files** - Don't skip any files mentioned in the task
3. **Follow TypeScript best practices** - Use proper typing and interfaces
4. **Include error handling** - All functions should handle errors gracefully
5. **Add proper documentation** - Include JSDoc comments for all functions
6. **Test your implementation** - Verify functionality before marking complete

### Dependencies:
- Tasks within each phase can be executed in parallel
- Complete Phase 1 before starting Phase 2
- Phase 3 requires Phase 1 completion
- Phase 4 requires Phases 1-3 completion
- Phases 5-6 require all previous phases

### Success Criteria:
Each task includes specific acceptance criteria that must be met before proceeding to the next task. An AI agent should verify all criteria are satisfied before marking a task as complete. 