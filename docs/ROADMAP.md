# Agent-Ready Build Plan

## Group: Project Foundation
✅ Initialize Next.js project with TypeScript, Tailwind, and ESLint  
✅ Configure Clerk authentication with `middleware.ts` and `app/layout.tsx`  
✅ Set up PostgreSQL database schema (see DB_SCHEMA.md)  
✅ Create environment configuration files (`.env.example`, `.env.local`)  
✅ Configure Jest and Playwright testing frameworks  

## Group: Database & Models
✅ Create database migration scripts for all tables (`posts`, `comments`, `personas`, etc.)  
✅ Implement database connection utility in `lib/database.ts`  
✅ Create TypeScript interfaces for all data models  
✅ Write seed script to populate default personas  
✅ Add database indexes for performance optimization  

## Group: Reddit Integration
✅ Build `lib/redditScraper.ts` with Reddit API authentication  
✅ Implement rate limiting and exponential backoff for Reddit API calls  
✅ Create function to fetch hot posts from specified subreddits  
✅ Add function to extract thread comments with metadata  
✅ Build API route `POST /api/ingest/reddit` to trigger scraping  

## Group: AI Content Generation
✅ Implement `lib/gptSummariser.ts` with OpenAI GPT-4 integration  
✅ Create system prompts for each persona (Snarky Sage, Buddy, Cynic)  
✅ Build content transformation pipeline (Reddit JSON → structured article)  
✅ Add sentiment analysis for comment classification  
✅ Implement content validation and safety checks  

## Group: Core Frontend Pages
✅ Create landing page `app/page.tsx` with trending posts feed  
✅ Build dynamic post page `app/posts/[slug]/page.tsx`  
✅ Implement `<PostCard />` component for feed display  
✅ Create `<PostPage />` component for full article rendering  
✅ Add `<PersonaBadge />` component showing avatar and name  

## Group: Image Management
✅ Build `lib/imageFetcher.ts` for Creative Commons image sourcing  
✅ Integrate Wikimedia Commons API with proper attribution  
✅ Add Unsplash API integration for stock imagery  
✅ Create image storage system with Supabase Storage  
✅ Implement automatic image attribution and licensing display  

## Group: Sharing & SEO
✅ Create `<ShareBar />` component with UTM tracking  
✅ Implement Open Graph meta tags for social sharing  
✅ Add JSON-LD structured data for SEO  
✅ Build automatic share image generation  
✅ Configure social media preview optimization  

## Group: Quiz System (Phase 2)
✅ Design quiz data structure and database schema  
✅ Create `<Quiz />` React component with interactive UI  
✅ Build API route `POST /api/quizzes` for quiz creation  
✅ Implement quiz result tracking and analytics  
✅ Add shareable quiz results with custom images  

## Group: Comment Screenshots (Phase 2)
✅ Integrate Bannerbear API for comment image generation  
✅ Create Reddit-style comment card templates  
✅ Build `<CommentScreenshot />` component  
✅ Implement batch screenshot generation for posts  
✅ Add screenshot caching and optimization  

## Group: Event Aggregation (Phase 2)
✅ Build `lib/eventAggregator.ts` for topic clustering  
✅ Implement keyword extraction and topic matching  
✅ Create event-based post grouping system  
✅ Add API route `POST /api/events/aggregate`  
✅ Build `<EventCluster />` component for related posts  

## Group: Video Generation (Phase 3)
✅ Integrate ElevenLabs API for AI voice generation  
✅ Build video script generation from post content  
✅ Create video template system for vertical format  
✅ Implement background video/image overlay system  
✅ Add video generation queue with status tracking  

## Group: User Dashboard (Phase 3)
✅ Create protected route `app/(auth)/dashboard/page.tsx`  
✅ Build user preferences and persona selection  
✅ Implement saved posts and reading history  
✅ Add user-generated content submission form  
✅ Create analytics dashboard for content performance  

## Group: Testing & Quality
✅ Write unit tests for all utility functions  
✅ Create integration tests for API routes  
✅ Build end-to-end tests for core user flows  
✅ Implement error boundary components  
✅ Add comprehensive error logging and monitoring  

## Group: Performance & Optimization
✅ Implement image lazy loading and optimization  
✅ Add database query optimization and caching  
✅ Configure CDN for static assets  
✅ Implement API response caching strategies  
✅ Add performance monitoring and alerting  

## Group: Production Deployment
✅ Configure Vercel deployment with environment variables  
✅ Set up production database with Supabase  
✅ Configure domain and SSL certificates  
✅ Implement CI/CD pipeline with GitHub Actions  
✅ Add production monitoring and error tracking  

---

Each task above is designed to be:
- **Autonomous**: Can be completed by an AI agent without human intervention
- **Specific**: Clear deliverable with defined scope
- **Testable**: Success criteria can be verified
- **Modular**: Doesn't break existing functionality

Dependencies are implicit in the grouping—complete groups in order for optimal workflow. 