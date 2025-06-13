# ThreadJuice

ThreadJuice transforms viral Reddit content into engaging, persona-driven articles with interactive quizzes. Built with Next.js 15, enhanced with the professional Sarsa news/magazine template for a polished editorial experience.

## Features

### Core Functionality

- **Reddit Integration**: Automated scraping of trending threads with rate limiting
- **AI Content Generation**: GPT-4 powered summarization with persona-specific voices
- **Interactive Quizzes**: Auto-generated quizzes with shareable results
- **Multi-Persona System**: Different writing styles (Casual, Professional, Humorous)
- **Event Aggregation**: Groups related posts by trending topics

### Sarsa Template Integration

- **8 Unique Layouts**: Multiple homepage and content layouts for different content types
- **Professional UI**: News and magazine-style components and layouts
- **Advanced Animations**: WOW.js, Swiper carousels, scrolling marquees, typewriter effects
- **Responsive Design**: Bootstrap 5 + Tailwind CSS for optimal mobile/desktop experience
- **Dark Mode Support**: Built-in theme switching functionality
- **Grid Filtering**: Isotope-powered content filtering and sorting

### Technical Features

- **Next.js 15**: App Router with server components and streaming
- **TypeScript**: Full type safety across frontend and backend
- **Clerk Authentication**: Secure user management with social logins
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Comprehensive Testing**: Jest unit tests, Playwright E2E tests, MSW API mocking

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
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=ThreadJuice/1.0

# OpenAI API
OPENAI_API_KEY=sk-your_openai_api_key_here

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
npm run test:e2e:debug # Playwright debug mode
npm run test:all     # Run all tests (unit + E2E)
```

## Testing Guide

### Unit Testing (Jest)

- **Framework**: Jest with TypeScript support via ts-jest
- **Extensions**: jest-extended for additional matchers
- **Mocking**: MSW for API request mocking
- **React Testing**: @testing-library/react for component tests

```bash
# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Debug React re-renders (development mode)
# why-did-you-render automatically enabled
```

### E2E Testing (Playwright)

- **Browsers**: Chromium, Firefox, WebKit
- **Features**: Screenshots, videos, trace viewer
- **Debugging**: UI mode and debug mode available

```bash
# Install browser dependencies (first time)
npm run playwright:install

# Run E2E tests with UI
npm run test:e2e:ui

# Debug specific test
npm run test:e2e:debug

# Open trace viewer after test run
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Mock Service Worker (MSW)

- **Purpose**: Mock external APIs (Reddit, OpenAI) during testing
- **Configuration**: `src/__tests__/mocks/handlers.ts`
- **Usage**: Automatically enabled in Jest, browser setup available

### Sarsa Template Features

- **Animation Libraries**: WOW.js for scroll animations, Swiper for carousels
- **Grid System**: Isotope layout for filtering and masonry grids
- **Interactive Elements**: Modal videos, scrolling marquees, typewriter effects
- **Layout Variants**: 8 different homepage layouts, multiple header/footer styles
- **SCSS Support**: Sass compilation for advanced styling alongside Tailwind

## Project Structure

```
threadjuice/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Protected routes
│   │   ├── posts/[slug]/      # Dynamic post pages
│   │   ├── category/[cat]/    # Category archive pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── layout/           # Sarsa layout components
│   │   │   ├── Header/       # Multiple header variants
│   │   │   └── Footer/       # Footer variations
│   │   ├── ui/               # Core UI components (Sarsa-styled)
│   │   ├── features/         # Feature components
│   │   ├── slider/           # Carousel components
│   │   ├── sidebar/          # Sidebar widgets
│   │   └── elements/         # Animation wrappers
│   ├── lib/                  # Utility functions
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript definitions
│   └── __tests__/            # Test files
├── docs/                     # Documentation
├── database/                 # Database schema and migrations
├── tests/                    # E2E tests
└── public/                   # Static assets
    └── assets/               # Sarsa template assets
```

## Architecture

ThreadJuice uses a modern, scalable architecture:

- **Frontend**: Next.js 15 with Sarsa template integration for professional news/magazine UI
- **Backend**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Clerk with social login support
- **AI Integration**: OpenAI GPT-4 for content generation
- **External APIs**: Reddit API for content sourcing
- **Styling**: Tailwind CSS + Sarsa SCSS + Bootstrap 5
- **Animations**: WOW.js, Swiper, React Fast Marquee, Typewriter Effect
- **Testing**: Jest + Playwright with comprehensive coverage

## Development Workflow

1. **Content Ingestion**: Reddit threads → AI processing → Database storage
2. **Content Display**: Database → React components → Sarsa layouts → User interface
3. **User Interaction**: Quiz taking → Result generation → Social sharing
4. **Analytics**: User behavior tracking → Performance metrics → Content optimization

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm run test:all`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Sarsa Template**: Professional news/magazine Next.js template by AliThemes
- **Next.js Team**: For the excellent React framework
- **Vercel**: For hosting and deployment platform
- **Supabase**: For the backend-as-a-service platform
- **Clerk**: For authentication services
- **OpenAI**: For GPT-4 API access
