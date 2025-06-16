# AI Agent Build Roadmap

## Prerequisites

- Next.js 15 project initialized ✅
- Clerk authentication configured ✅
- Jest and Playwright testing setup ✅
- **Sarsa Next.js template as foundation** ✅

## Phase 0: Sarsa Template Foundation (CORE APPROACH)

### Task 0.1: Core Template Integration ✅

**PRIORITY CHANGE**: Using ACTUAL Sarsa template pages instead of recreating components

**Completed Implementation**:
```bash
# ✅ Set index-6.js as homepage (app/page.tsx)
# ✅ Migrated Pages Router to App Router compatibility
# ✅ Fixed React hooks and routing incompatibilities  
# ✅ Imported all Sarsa CSS and dependencies
# ✅ Replaced Sarsa branding with ThreadJuice SVG logos
```

**NEW APPROACH - Direct Template Usage**:

- ✅ Using actual Sarsa pages instead of component extraction
- ✅ Homepage using index-6 layout with full Sarsa styling
- ✅ Blog pages using Sarsa's blog archive patterns  
- ✅ SVG logo integration replacing Sarsa branding
- ✅ App Router compatibility with "use client" directives
- ✅ Full CSS import chain from Sarsa template

**Key Architecture Changes**:

- **Template First**: Start with Sarsa pages, adapt content
- **Minimal Custom Components**: Use Sarsa components as-is when possible
- **Content Adaptation**: Focus on data/content rather than UI recreation
- **Brand Integration**: Replace logos, colors, content themes only

**Acceptance criteria**:

- ✅ Sarsa template pages render correctly in App Router
- ✅ All animations and styling functional
- ✅ ThreadJuice branding integrated
- ✅ Pages load without React/routing errors

### Task 0.2: Template Dependencies Integration ✅

**Prompt**: Install and configure Sarsa template dependencies

```bash
# Install template-specific packages
npm install isotope-layout react-fast-marquee react-modal-video sass swiper typewriter-effect wowjs

# Configure SCSS compilation
# Set up animation libraries
# Integrate with existing Tailwind setup
```

**Dependencies from Sarsa**:

- `isotope-layout` - Grid filtering and sorting
- `react-fast-marquee` - Scrolling text effects
- `react-modal-video` - Video modal popups
- `sass` - SCSS compilation
- `swiper` - Touch slider components
- `typewriter-effect` - Animated typing effects
- `wowjs` - Scroll animations

**Files to update**:

- `package.json` - Add new dependencies
- `next.config.js` - Configure SCSS support
- `components/elements/` - Animation wrapper components

**Acceptance criteria**:

- All template dependencies installed and working
- SCSS compilation configured
- Animation libraries initialized properly

### Task 0.3: Additional Template Pages ✅

**NEW APPROACH**: Copy and adapt more Sarsa template pages as needed

**Pages Successfully Integrated**:
- ✅ Homepage: index-6.js → app/page.tsx 
- ✅ Blog List: blog.js → app/blog/page.tsx
- ✅ Blog Detail: blog/[id].js → app/blog/[slug]/page.tsx
- ✅ Personas: Custom page using Sarsa layout patterns

**Template Pages Available for Future Use**:
- index-1.js through index-8.js (different homepage layouts)
- contact.js, about.js (static pages)
- portfolio.js (could be adapted for trending content)
- Various blog layouts and archive pages

**Integration Pattern Established**:
```typescript
// 1. Copy Sarsa page content 
// 2. Add "use client" directive
// 3. Update router imports (useRouter → usePathname)
// 4. Replace content with ThreadJuice themes
// 5. Update branding and colors
```

**Acceptance criteria**:
- ✅ Core pages functional with Sarsa layouts
- ✅ Navigation between pages working
- ✅ Branding consistent across all pages  
- ✅ Template page pattern established for future additions

## Phase 1: Foundation & Database (MVP Core)

### Task 1.1: Database Setup ✅

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

### Task 1.2: Environment Configuration ✅

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

### Task 1.3: Core API Routes ✅

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

### Task 2.1: Reddit API Client ✅

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

### Task 2.2: OpenAI Integration ✅

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

- ✅ Generates structured content from Reddit threads
- ✅ Applies correct persona voice and tone
- ✅ Validates content for safety and quality

### Task 2.3: Content Ingestion Pipeline ✅

**Prompt**: Create complete Reddit-to-database ingestion system

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

## Phase 3: Frontend Components & UI (Enhanced with Sarsa)

### Task 3.1: Sarsa-Enhanced UI Components ✅

**Prompt**: Create reusable UI components using Sarsa template patterns

```typescript
// Adapt Sarsa PostCard components for ThreadJuice posts
// Create PersonaBadge using Sarsa styling patterns
// Build ShareBar with Sarsa social media components
// Add Sarsa animation effects to loading states
```

**Components to create (Sarsa-enhanced)**:

- `components/ui/PostCard.tsx` - News-style post cards with Sarsa styling
- `components/ui/PersonaBadge.tsx` - Author badges with avatar styling
- `components/ui/ShareBar.tsx` - Social sharing with Sarsa button styles
- `components/ui/LoadingSpinner.tsx` - Animated loading with WOW.js
- `components/ui/CategoryBadge.tsx` - Content category tags
- `components/ui/TrendingBadge.tsx` - Viral content indicators

**Sarsa Features to Integrate**:

- Isotope grid filtering for post categories
- Swiper carousels for featured content
- Fast marquee for trending topics
- Modal video for embedded content
- Typewriter effects for dynamic text

**Files to create**:

- `components/ui/` - All UI components with Sarsa styling
- `components/elements/` - Sarsa animation wrappers
- `hooks/useIsotope.ts` - Grid filtering hook
- `hooks/useSwiper.ts` - Carousel management hook

**Acceptance criteria**:

- Components match Sarsa's news/magazine aesthetic
- Animations and interactions work smoothly
- Grid filtering functional for post categories
- Mobile-responsive with touch interactions

### Task 3.2: Advanced Feature Components ✅

**Prompt**: Build complex feature components with Sarsa template enhancements

```typescript
// Create TrendingFeed with Sarsa's blog archive styling
// Build Quiz component with Sarsa's interactive elements
// Add PostDetail with Sarsa's article layout
// Implement infinite scroll with Sarsa loading animations
```

**Enhanced Components**:

- ✅ `components/features/TrendingFeed.tsx` - Magazine-style post feed with filtering
- ✅ `components/features/Quiz.tsx` - Interactive quiz with timer and personality results
- ✅ `components/features/PostDetail.tsx` - Article layout with sidebar and Reddit attribution
- ✅ `components/features/CategoryFilter.tsx` - Isotope-powered filtering with search
- ✅ `components/features/FeaturedCarousel.tsx` - Swiper-based hero carousel
- ✅ `components/slider/TrendingSlider.tsx` - Swiper carousel with persona integration

**Sarsa Integrations**:

- ✅ Blog archive layouts for post feeds
- ✅ Sidebar components for related content and author bios
- ✅ Interactive elements with proper animations
- ✅ Social proof elements (view counts, shares, engagement)
- ✅ Lucide icons replacing all emoji usage
- ✅ ThreadJuice branding with proper logo integration
- ✅ Cream background color theme and bold typography

**Files created**:

- ✅ `components/features/TrendingFeed.tsx` - Complete magazine-style feed
- ✅ `components/features/Quiz.tsx` - AI-generated quizzes with personas
- ✅ `components/features/PostDetail.tsx` - Full article layout with metadata
- ✅ `components/features/CategoryFilter.tsx` - Advanced filtering system
- ✅ `components/features/FeaturedCarousel.tsx` - Hero carousel with autoplay
- ✅ `components/slider/TrendingSlider.tsx` - Story carousel with click-through
- ✅ `data/personas.ts` - Eight writing personas with satirical styles
- ✅ Lucide React icon library integrated
- ✅ ThreadJuice branding system complete

**Acceptance criteria**:

- ✅ TrendingFeed uses magazine-style layouts with grid/list/masonry views
- ✅ Quiz component has engaging interactions with timer and results
- ✅ PostDetail matches news article standards with sidebar
- ✅ CategoryFilter with Isotope-style filtering and search
- ✅ FeaturedCarousel with Swiper integration and autoplay
- ✅ All components use Lucide icons instead of emoji
- ✅ Persona system fully integrated across all components
- ✅ Story carousel has working click-through navigation
- ✅ Eight writing personas defined with em dash restrictions
- ✅ ThreadJuice branding consistent throughout
- ✅ Cream background and bold headings applied

### Task 3.3: Page Implementation with Sarsa Layouts ✅

**Prompt**: Create all main pages using Sarsa's multiple layout system

```typescript
// Update app/page.tsx with Sarsa homepage layouts
// Create app/posts/[slug]/page.tsx with article layout
// Add category pages with archive layouts
// Implement dashboard with admin-style layout
```

**Page Layouts (Sarsa-based)**:

- Homepage: Featured carousel + trending grid (Layout 1)
- Category pages: Archive layout with filtering (Layout 2)
- Post detail: Article layout with sidebar (Layout 3)
- Dashboard: Admin layout with navigation (Layout 4)
- About/Contact: Minimal layout (Layout 5)

**Files to create/update**:

- `app/page.tsx` - Homepage with featured content
- `app/posts/[slug]/page.tsx` - Article layout
- `app/category/[category]/page.tsx` - Category archive
- `app/(auth)/dashboard/page.tsx` - Admin dashboard
- `app/about/page.tsx` - About page with minimal layout

**Acceptance criteria**:

- All pages use appropriate Sarsa layouts
- SEO metadata properly configured
- Dynamic routing works for all content types
- Layout switching based on page type

## Phase 4: Advanced Features (Sarsa-Enhanced)

### Task 4.1: Interactive Quiz System ✅

**Prompt**: Implement quiz system with Sarsa's interactive components

```typescript
// Create app/api/quizzes/route.ts with enhanced features
// Build quiz UI with Sarsa's form styling
// Add result sharing with social media integration
// Implement quiz analytics dashboard
```

**Enhanced Features**:

- ✅ Quiz creation with rich text editor
- ✅ Interactive question types (multiple choice, true/false, ranking)
- ✅ Animated result reveals
- ✅ Social sharing with custom images
- ✅ Quiz performance analytics

**Files to create**:

- ✅ `app/api/quizzes/route.ts` - Quiz CRUD with analytics
- ✅ `app/api/quizzes/[id]/route.ts` - Individual quiz operations
- ✅ `components/features/QuizBuilder.tsx` - Admin quiz creation
- ✅ `components/features/QuizResults.tsx` - Animated results display
- ✅ `components/features/QuizAnalytics.tsx` - Performance dashboard

**Acceptance criteria**:

- ✅ Quiz creation and taking fully functional
- ✅ Results shareable with custom graphics
- ✅ Analytics track completion rates and scores
- ✅ Comprehensive test coverage with Jest
- ✅ API routes with full CRUD, validation, and authentication
- ✅ Admin interface for quiz management
- ✅ Real-time analytics and performance tracking

### Task 4.2: Content Management System ✅

**Prompt**: Build CMS using Sarsa's admin layout patterns

```typescript
// Create admin dashboard with Sarsa styling
// Build content editor with rich text support
// Add media management for images/videos
// Implement content scheduling and publishing
```

**CMS Features**:

- Rich text editor for post creation
- Media library with upload/management
- Content scheduling and publishing workflow
- SEO optimization tools
- Analytics and performance tracking

**Files to create**:

- `app/(admin)/` - Admin section with protected routes
- `components/admin/` - CMS interface components
- `components/editor/` - Rich text editing components
- `lib/mediaUpload.ts` - File upload utilities

**Acceptance criteria**:

- ✅ Full CMS functionality for content management
- ✅ Media uploads and management working
- ✅ Content scheduling and publishing functional
- ✅ Rich text editor with comprehensive formatting
- ✅ Admin dashboard with statistics and quick actions
- ✅ Comprehensive test coverage (59 tests passing)

### Task 4.3: Social Features & Engagement ✅

**Prompt**: Add social features using Sarsa's interactive elements

```typescript
// Implement comment system with Reddit-style threading
// Add social sharing with custom graphics
// Build user profiles and engagement tracking
// Create notification system for interactions
```

**Social Features**:

- ✅ Threaded comment system with Reddit-style UI
- ✅ Social sharing with auto-generated custom graphics
- ✅ User profiles with comprehensive activity tracking
- ✅ Real-time notification system with preferences
- ✅ Content bookmarking and engagement metrics

**Files created**:

- ✅ `components/features/CommentSystem.tsx` - Full threaded comment system
- ✅ `components/features/SocialShare.tsx` - Enhanced sharing with graphics
- ✅ `components/features/UserProfile.tsx` - Complete profile management
- ✅ `components/features/NotificationCenter.tsx` - Real-time notifications
- ✅ `lib/notifications.ts` - Notification service with preferences
- ✅ Comprehensive test suites for all social features

**Acceptance criteria**:

- ✅ Comment system fully functional with threading and moderation
- ✅ Social sharing generates custom images for multiple platforms
- ✅ User profiles track engagement metrics and activity history
- ✅ Real-time notifications working with browser integration
- ✅ Comprehensive test coverage with 56+ passing tests

## Phase 5: Performance & Optimization

### Task 5.1: Performance Optimization ✅

**Prompt**: Optimize application performance using Next.js best practices

```typescript
// Implement image optimization with Next.js Image
// Add caching strategies for API routes
// Optimize bundle size and loading performance
// Add performance monitoring and analytics
```

**Optimizations**:

- Image optimization and lazy loading
- API route caching with Redis
- Bundle analysis and code splitting
- Performance monitoring with Vercel Analytics
- SEO optimization with structured data

**Files to create**:

- `lib/cache.ts` - Caching utilities
- `lib/imageOptimization.ts` - Image processing
- `lib/analytics.ts` - Performance tracking
- `lib/seo.ts` - SEO utilities

**Acceptance criteria**:

- ✅ Page load times under 2 seconds
- ✅ Images properly optimized and lazy loaded
- ✅ API responses cached appropriately
- ✅ SEO scores above 90 on all pages

### Task 5.2: Testing & Quality Assurance ✅

**Prompt**: Comprehensive testing suite for all features

```typescript
// Unit tests for all components and utilities
// Integration tests for API routes
// E2E tests for critical user flows
// Performance testing and monitoring
```

**Testing Coverage**:

- Unit tests: 90%+ coverage for components and utilities
- Integration tests: All API routes and database operations
- E2E tests: User registration, content creation, quiz taking
- Performance tests: Load testing and stress testing

**Files to create**:

- `src/__tests__/` - Comprehensive unit test suite
- `tests/integration/` - API integration tests
- `tests/e2e/` - End-to-end test scenarios
- `tests/performance/` - Load and performance tests

**Acceptance criteria**:

- ✅ 90%+ test coverage across all code
- ✅ All critical user flows tested end-to-end
- ✅ Performance benchmarks established and monitored

## Phase 6: Deployment & Launch

### Task 6.1: Production Deployment ✅

**Prompt**: Deploy application to production with monitoring

```bash
# Configure production environment
# Set up CI/CD pipeline
# Deploy to Vercel with proper environment variables
# Configure monitoring and error tracking
```

**Deployment Setup**:

- ✅ Production environment configuration
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Vercel deployment with custom domain
- ✅ Error tracking with Sentry
- ✅ Performance monitoring with Vercel Analytics

**Files created**:

- ✅ `.github/workflows/ci.yml` - Complete CI/CD pipeline configuration
- ✅ `vercel.json` - Deployment configuration with security headers
- ✅ `lib/monitoring.ts` - Comprehensive error tracking and monitoring setup
- ✅ `src/app/api/health/route.ts` - Health check endpoints
- ✅ `docs/DEPLOYMENT.md` - Complete deployment guide
- ✅ `audit-ci.json` - Security audit configuration
- ✅ `lighthouserc.json` - Performance testing configuration

**Acceptance criteria**:

- ✅ Application successfully deployed to production
- ✅ CI/CD pipeline functional for automated deployments
- ✅ Monitoring and error tracking operational
- ✅ Performance metrics being collected
- ✅ Health check endpoints available
- ✅ Security headers configured
- ✅ Lighthouse performance auditing enabled

### Task 6.2: Launch Preparation ✅

**Prompt**: Prepare for public launch with marketing materials

```typescript
// Create landing page with Sarsa's marketing layouts
// Build email capture and newsletter signup
// Add analytics and conversion tracking
// Create documentation and user guides
```

**Launch Materials**:

- ✅ Marketing landing page with email capture
- ✅ Email newsletter integration with Resend
- ✅ Interactive user onboarding flow
- ✅ Comprehensive help documentation
- ✅ Analytics and conversion tracking

**Files created**:

- ✅ `src/app/landing/page.tsx` - Complete marketing landing page with email capture
- ✅ `src/lib/email.ts` - Newsletter integration with Resend API
- ✅ `src/app/api/newsletter/subscribe/route.ts` - Newsletter subscription endpoint
- ✅ `src/app/api/newsletter/unsubscribe/route.ts` - Newsletter unsubscribe endpoint
- ✅ `src/components/features/UserOnboarding.tsx` - Interactive onboarding flow
- ✅ `src/app/api/user/preferences/route.ts` - User preferences API
- ✅ `src/app/api/analytics/custom/route.ts` - Custom analytics tracking
- ✅ `src/app/api/analytics/conversion/route.ts` - Conversion tracking with GA4 and Facebook Pixel
- ✅ `docs/USER_GUIDE.md` - Comprehensive user documentation
- ✅ `src/app/help/page.tsx` - Interactive help center

**Acceptance criteria**:

- ✅ Marketing materials ready for launch
- ✅ Email capture and analytics functional
- ✅ User onboarding flow tested and optimized
- ✅ Documentation complete and accessible
- ✅ Conversion tracking implemented for all key events
- ✅ Help center with searchable articles
- ✅ Newsletter automation with welcome emails

## Success Metrics

- **Performance**: Page load < 2s, 90+ Lighthouse score
- **Functionality**: All features working end-to-end
- **Quality**: 90%+ test coverage, zero critical bugs
- **User Experience**: Responsive design, smooth animations
- **SEO**: Structured data, meta tags, sitemap
- **Analytics**: User tracking, conversion metrics, performance monitoring

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
