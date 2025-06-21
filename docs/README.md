# ThreadJuice

ThreadJuice is a modern viral content aggregator that transforms Reddit threads into engaging, persona-driven stories with interactive elements. Built with Next.js 15 and enhanced with shadcn/ui for a polished, professional user experience.

## Features

### Core Functionality

- **Viral Content Aggregation**: Curated viral stories with engaging headlines and imagery
- **Advanced Filtering**: Dynamic category and author filtering with clean URL routing
- **Interactive Elements**: Voting systems, comments, bookmarks, and social sharing
- **Multi-Persona System**: Three distinct writer voices (The Snarky Sage, Down-to-Earth Buddy, Dry Cynic)
- **Content Management**: Professional article layouts with Reddit-style comment integration
- **Automated Story Generation**: AI-powered story creation with dual image systems (stock + AI-generated)
- **Related Stories**: Intelligent tag-based story recommendations
- **Template Architecture**: Single master template for easy global changes

### Modern UI/UX

- **Dark Mode Theme**: Complete shadcn/ui theming with CSS variables
- **Professional Typography**: Geist fonts with extrabold headings (800 weight)
- **ThreadJuice Branding**: Custom SVG logos and orange accent colors
- **Hero Carousel**: Auto-cycling background images with navigation dots
- **Category Ticker**: Continuous scrolling navigation with clickable categories
- **Responsive Design**: Mobile-optimized layouts with touch interactions
- **Lucide Icons**: Professional icon system with themed colors

### Interactive Features

- **Dual Voting Toolbars**: Engagement elements at article start and end
- **Filter Pages**: Dynamic `/filter/category/[name]` and `/filter/author/[name]` routing
- **Clickable Elements**: Author names, category badges, and tag systems
- **Sidebar Widgets**: "Today's Top 5" and "Top Shared" content sections
- **Related Stories**: Intelligent content recommendations based on shared tags
- **Master Template System**: Single component controls all story pages for easy updates

### Technical Stack

- **Next.js 15**: App Router with React Server Components
- **TypeScript**: Full type safety across frontend and backend
- **shadcn/ui**: Modern component library with dark mode support
- **Tailwind CSS**: Utility-first CSS framework with custom variables
- **React Query**: Data fetching and state management
- **Lucide React**: Professional icon library

## Quick Start

```bash
# Clone and install
git clone https://github.com/Dean-Rough/threadjuice.git
cd threadjuice
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys (see Environment Setup below)

# Run development server
npm run dev
```

## Environment Setup

Create `.env.local` with the following variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/threadjuice
DIRECT_URL=postgresql://username:password@localhost:5432/threadjuice

# Reddit API (for future content ingestion)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=ThreadJuice/1.0

# OpenAI API (for content generation)
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_IMAGE_API_KEY=sk-your_image_generation_api_key_here  # Optional: Separate key for image generation

# Optional: Image APIs
UNSPLASH_ACCESS_KEY=your_unsplash_key
WIKIMEDIA_USER_AGENT=ThreadJuice/1.0
```

## Available Scripts

```bash
# Development
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Production server
npm run lint        # ESLint check

# Testing
npm run test         # Jest unit tests
npm run test:watch   # Jest watch mode
npm run test:coverage # Jest with coverage report
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright with UI mode

# Story Generation
node scripts/content/generate-story-unified.js  # Generate new viral story with stock images
# Edit script to use generateFullStory(true) for AI-generated images
```

## Project Structure

```
threadjuice/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── blog/[slug]/       # Dynamic article pages
│   │   ├── filter/[type]/[value]/ # Category/author filter pages
│   │   ├── personas/          # Writer personas page
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── features/         # Feature components
│   │   ├── HeroCarousel.tsx  # Main hero carousel
│   │   └── TrendingFeed.tsx  # Content feed component
│   ├── hooks/                # Custom React hooks
│   │   └── usePosts.ts       # Data fetching hook
│   ├── lib/                  # Utility functions
│   │   └── utils.ts          # shadcn/ui utilities
│   ├── providers/            # React providers
│   │   └── QueryProvider.tsx # React Query provider
│   ├── services/             # Data services
│   │   └── postService.ts    # Post data service
│   ├── constants/            # App constants
│   │   └── categories.ts     # Category definitions
│   ├── contexts/             # React contexts
│   │   └── UIContext.tsx     # UI state management
│   └── __tests__/            # Test files
├── docs/                     # Comprehensive documentation
├── tests/                    # E2E tests
└── public/                   # Static assets
    └── assets/               # Logos and branding
```

## Core Components

### HeroCarousel

Auto-cycling hero section with background images and navigation dots.

### TrendingFeed

Main content feed with filtering capabilities and engagement metrics.

### Filter Pages

Dynamic routing for category and author filtering (`/filter/[type]/[value]`).

### Blog Detail Pages

Professional article layout with inline images, voting toolbars, and Reddit-style comments.

### Category Ticker

Continuous scrolling navigation bar with clickable category pills.

## UI Architecture

### Design System

- **shadcn/ui**: Modern component library
- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Theme-aware color system
- **Geist Fonts**: Professional typography stack

### Theme Configuration

```css
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --accent: 240 3.7% 15.9%;
  /* Complete dark mode color system */
}
```

### Component Pattern

```typescript
// Consistent component structure
export function ComponentName() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Component content */}
      </CardContent>
    </Card>
  );
}
```

## Data Architecture

### Mock Data System

- Viral content stories with realistic engagement metrics
- Three writer personas with distinct voices
- 20+ content categories for filtering
- Dual image system (curated stock photos + AI generation)

### Automated Story Generation

- **AI Content Creation**: GPT-4o generates complete viral stories with persona voice
- **Intelligent Image Selection**: Content analysis matches stock photos to story themes
- **Alternative AI Images**: DALL-E 3 generation with fallback system
- **Template Structure**: Modular sections with dramatic quotes and Reddit comments
- **Related Stories**: Automatic tag-based content recommendations

### API Routes

- `GET /api/posts` - Fetch posts with filtering options
- `GET /api/posts/[id]` - Individual story with related content
- Dynamic filtering via URL parameters
- File-based story serving for generated content

### State Management

- React Query for server state
- React Context for UI state
- Local component state for interactions

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all required environment variables are configured for production deployment.

### Performance Considerations

- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- CSS optimization with Tailwind purging
- Bundle analysis available via `npm run analyze`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **shadcn/ui**: Modern React component library
- **Lucide**: Beautiful icon system
- **Next.js Team**: Excellent React framework
- **Tailwind CSS**: Utility-first CSS framework
- **Geist**: Professional font family by Vercel
