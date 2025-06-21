# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThreadJuice is a modern viral content aggregator that curates and presents engaging Reddit-style stories with professional design and interactive features. Built with Next.js 15 and shadcn/ui for a polished user experience.

## Current Implementation Status

**✅ COMPLETED: Full UI Transformation**

- Complete shadcn/ui integration with dark mode theming
- Professional Geist fonts with extrabold headings (800 weight)
- ThreadJuice branding with white SVG logos and orange accents
- Hero carousel with auto-cycling background images
- Category ticker with clickable navigation
- Dual voting toolbars with engagement metrics
- Dynamic filter pages for categories and authors
- Responsive design optimized for all devices

## Architecture & Tech Stack

**Current Implementation**:

- **Frontend**: Next.js 15 with App Router + TypeScript
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React (replacing all emoji usage)
- **Fonts**: Geist Sans + Geist Mono with CSS variables
- **State Management**: React Query (@tanstack/react-query) + React Context
- **Styling**: CSS variables for theming + Tailwind utilities
- **Components**: Card-based design with consistent patterns
- **Database**: PostgreSQL (schema defined, ready for implementation)
- **Future APIs**: Reddit API, OpenAI GPT, Unsplash (structured for integration)

## Core System Components

### UI Components (Implemented)

1. **HeroCarousel** - Auto-cycling hero section with background images and navigation dots
2. **TrendingFeed** - Main content feed with grid layout and engagement metrics
3. **CategoryTicker** - Continuous scrolling navigation with clickable category pills
4. **VotingToolbar** - Dual engagement toolbars (ArrowUp, MessageCircle, Bookmark, Share2)
5. **FilterPages** - Dynamic routing for category and author filtering
6. **BlogDetail** - Professional article layout with inline images and sidebar

### Data Architecture (Ready for Backend)

1. **Post Service** - Data fetching with React Query integration
2. **Filter System** - Dynamic URL routing with proper slug handling
3. **Mock Data** - Viral content stories with realistic engagement metrics
4. **Persona System** - Three distinct writer voices with avatars
5. **Category System** - 20+ content categories for filtering
6. **Image Integration** - Unsplash images with proper attribution

### Writer Personas

- **The Snarky Sage** - Sarcastic and deadpan with brutal honesty
- **The Down-to-Earth Buddy** - Chill and friendly with relatable insights
- **The Dry Cynic** - Bitterly hilarious with chaos-loving perspective

Each persona has distinct voice characteristics and avatar styling.

## Content Structure

All posts follow this professional format:

- **Hero Section**: Auto-cycling carousel with large typography
- **Article Layout**: 3/4 content + 1/4 image description and tags
- **Engagement Elements**: Dual voting toolbars with real-time counters
- **Comments**: Reddit-style comment sections with upvote counts
- **Related Content**: Curated story recommendations
- **Attribution**: Proper image licensing and source credits

## Current File Structure

```
threadjuice/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── blog/[slug]/       # Dynamic article pages
│   │   ├── filter/[type]/[value]/ # Category/author filter pages
│   │   ├── personas/          # Writer personas page
│   │   └── api/               # API routes (ready for backend)
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── features/         # Feature-specific components
│   │   ├── HeroCarousel.tsx  # Main hero carousel
│   │   └── TrendingFeed.tsx  # Content feed component
│   ├── hooks/                # Custom React hooks
│   │   └── usePosts.ts       # Data fetching with React Query
│   ├── lib/                  # Utility functions
│   │   └── utils.ts          # shadcn/ui utilities
│   ├── providers/            # React providers
│   │   └── QueryProvider.tsx # React Query setup
│   ├── services/             # Data services
│   │   └── postService.ts    # API communication layer
│   ├── constants/            # App constants
│   │   └── categories.ts     # Category definitions
│   └── contexts/             # React contexts
│       └── UIContext.tsx     # UI state management
├── docs/                     # Comprehensive documentation
│   ├── README.md            # Project overview
│   ├── DB_SCHEMA.md         # Database schema
│   ├── API_ROUTES.md        # API specifications
│   ├── COMPONENTS.md        # Component architecture
│   └── DEPLOYMENT.md        # Deployment guide
└── public/assets/           # Static assets and branding
```

## UI Architecture

### Design System

- **Component Library**: shadcn/ui with dark mode support
- **Styling**: Tailwind CSS with CSS variables for theming
- **Typography**: Geist fonts with extrabold headings (800 weight)
- **Colors**: Dark theme with orange accents (#f97316)
- **Icons**: Lucide React with consistent sizing and theming

### Key Features Implemented

- **Dark Mode**: Complete theming system with CSS variables
- **Responsive Design**: Mobile-optimized layouts with touch interactions
- **Interactive Elements**: Hover animations and engagement feedback
- **Navigation**: Category ticker and dynamic filter routing
- **Content Management**: Professional article layouts with sidebar widgets

## Development Approach

### Current State (Production Ready UI)

- All UI components implemented and tested
- Mock data system providing realistic content
- Responsive design working across all device sizes
- Filter system with proper URL routing
- Professional branding and visual design

### Next Phase (Backend Integration)

- Database schema implementation (PostgreSQL)
- API routes for content management
- User authentication system
- Real content ingestion pipeline
- Analytics and engagement tracking

## Integration Points (Ready for Implementation)

1. **Database**: PostgreSQL schema defined in `docs/DB_SCHEMA.md`
2. **API Routes**: Specifications in `docs/API_ROUTES.md`
3. **Content Pipeline**: Reddit API + OpenAI integration points defined
4. **User System**: Authentication and interaction tracking ready
5. **Analytics**: Event tracking and engagement metrics prepared

## SEO & Performance

- **Next.js 15**: App Router with React Server Components
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Code splitting and optimization
- **SEO Ready**: Meta tags, structured data, and social sharing
- **Performance**: Core Web Vitals optimized

## Development Commands
```bash
# Development
npm run dev         # Start development server
npm run build       # Production build
npm run lint        # Code quality check

# Testing
npm run test        # Jest unit tests
npm run test:e2e    # Playwright E2E tests
tsc --noEmit &&
next build &&
next start 

# Story Generation (Unified System)
npm run story:generate      # Generate single story
npm run story:bulk 5        # Generate multiple stories
npm run story:help          # Show all options

# Database (when implemented)
npm run db:setup    # Initialize database
npm run db:migrate  # Run migrations
npm run db:seed     # Seed with data
```

This project is now ready for backend implementation while maintaining a polished, production-ready frontend experience.

## Story Generation System

**Unified Script**: All story generation is handled by `scripts/content/generate-story-unified.js`
- Single source of truth for all story generation
- Consistent 12-section structure with The Terry's commentary
- Smart stock image selection based on content analysis
- Direct Supabase integration
- See `docs/STORY_GENERATION.md` for detailed documentation

**Key Features**:
- AI-powered content generation with GPT-4o
- Intelligent image matching from curated library
- Three distinct writer personas
- 10+ story categories
- Automatic database import

## NO MOCK OR SIMULATED DATA ANYWHERE
**HARD RULE**: Never use mock, simulated, dummy, or placeholder data. All content must be real, production-ready material. No "simulate", "mock", or "fake" prefixes in data generation. Generate actual viral content stories with authentic scenarios based on real internet phenomena.
