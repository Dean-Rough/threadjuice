# ThreadJuice System Architecture

## Overview

ThreadJuice is a modern content aggregation platform that transforms viral stories from Reddit and Twitter into engaging, multimedia-rich articles. The system uses a modular pipeline architecture for maximum flexibility and maintainability.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Pages     │  │  Components  │  │  Hooks & Contexts      │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                      API Layer (Next.js API)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Routes    │  │  Middleware  │  │  Services              │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                    Story Processing Pipeline                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Source    │→ │   Analysis   │→ │   Enrichment           │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐                             │
│  │  Transform  │→ │    Output    │                             │
│  └─────────────┘  └──────────────┘                             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                     External Services                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │Reddit API   │  │Twitter API   │  │OpenAI/Pexels/Klipy     │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Story Processing Pipeline

The heart of ThreadJuice is a modular pipeline system that processes content through distinct stages:

- **Source Stage**: Acquires content from Reddit, Twitter, or AI generation
- **Analysis Stage**: Extracts entities, links, sentiment, and keywords
- **Enrichment Stage**: Adds images, GIFs, and metadata
- **Transform Stage**: Builds the final story structure
- **Output Stage**: Saves to database or returns for API

See [PIPELINE.md](./PIPELINE.md) for detailed documentation.

### 2. Content Sources

#### Reddit Integration

- OAuth2 authentication
- Rate-limited API calls
- Subreddit monitoring
- Comment extraction

#### Twitter Integration

- API v2 integration
- Drama detection algorithms
- Thread reconstruction
- Media extraction

#### AI Generation

- OpenAI GPT-4 integration
- Persona-based writing
- Category-specific prompts
- Quality validation

### 3. Content Analysis

#### Entity Extraction

- Product and brand detection
- Company name recognition
- Technology identification
- Context-aware extraction

#### Sentiment Analysis

- Emotion detection for story sections
- GIF reaction mapping
- Reader emotion prediction
- Intensity scoring

#### Link Analysis

- URL extraction and categorization
- Media link identification
- Metadata fetching
- Domain classification

### 4. Media Services

#### Image Selection

- Intelligent routing (Wikipedia/Pexels)
- Context-based search terms
- Source media prioritization
- Fallback strategies

#### GIF Reactions

- Emotion-based selection
- Klipy API integration
- Strategic placement
- Caption generation

### 5. Frontend Architecture

#### Component Structure

```
components/
├── ui/              # Base UI components (shadcn/ui)
├── features/        # Feature-specific components
├── layout/          # Layout components
└── sections/        # Page sections
```

#### State Management

- React Query for server state
- React Context for UI state
- Local storage for preferences
- Optimistic updates

#### Performance

- React Server Components
- Image optimization
- Code splitting
- Progressive enhancement

## Data Flow

### Story Processing Flow

```
1. Content Discovery
   └─> Reddit API / Twitter API / User Request

2. Source Acquisition
   └─> Fetch content, normalize format

3. Content Analysis
   ├─> Extract entities and keywords
   ├─> Analyze sentiment
   └─> Extract links and media

4. Media Enrichment
   ├─> Find relevant images
   ├─> Select reaction GIFs
   └─> Fetch link metadata

5. Story Transformation
   ├─> Build story sections
   ├─> Insert media
   └─> Add commentary

6. Output
   ├─> Save to database
   └─> Return for display
```

### API Request Flow

```
Client Request
    │
    ├─> Next.js API Route
    │      │
    │      ├─> Authentication
    │      ├─> Validation
    │      └─> Rate Limiting
    │
    ├─> Service Layer
    │      │
    │      ├─> Business Logic
    │      └─> Data Access
    │
    └─> Response
```

## Database Schema

### Core Tables

#### posts

- Story content and metadata
- Engagement metrics
- Publishing status
- Category and tags

#### personas

- Writer personalities
- Voice characteristics
- Story count
- Performance metrics

#### media_assets

- Image metadata
- GIF information
- Source attribution
- Usage tracking

See [DB_SCHEMA.md](./DB_SCHEMA.md) for complete schema.

## Security Architecture

### API Security

- JWT authentication
- Rate limiting per endpoint
- Input validation
- CORS configuration

### Content Security

- XSS prevention
- Content sanitization
- Safe HTML rendering
- CSP headers

### Data Protection

- Environment variable management
- Secure API key storage
- Database connection pooling
- Audit logging

## Performance Architecture

### Caching Strategy

- Redis for API responses
- Browser caching for assets
- CDN for static content
- Database query caching

### Optimization Techniques

- Lazy loading for images
- Code splitting by route
- API response compression
- Database indexing

### Monitoring

- Performance metrics
- Error tracking
- API usage monitoring
- User analytics

## Deployment Architecture

### Infrastructure

```
┌─────────────────┐
│    Vercel       │  ← Frontend + API
└────────┬────────┘
         │
┌────────┴────────┐
│    Supabase     │  ← Database + Auth
└────────┬────────┘
         │
┌────────┴────────┐
│  External APIs  │  ← Reddit, Twitter, etc.
└─────────────────┘
```

### Environment Management

- Development: Local setup
- Staging: Preview deployments
- Production: Vercel deployment

### CI/CD Pipeline

1. Code push to GitHub
2. Automated tests run
3. Preview deployment created
4. Manual promotion to production

## Scalability Considerations

### Horizontal Scaling

- Stateless API design
- Database connection pooling
- Caching layer
- CDN usage

### Performance Bottlenecks

- API rate limits
- Database queries
- Image processing
- External API calls

### Mitigation Strategies

- Queue system for processing
- Batch operations
- Caching aggressive
- Fallback mechanisms

## Technology Stack

### Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query

### Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)
- Redis caching

### External Services

- Reddit API
- Twitter API v2
- OpenAI GPT-4
- Pexels API
- Klipy API

### Development Tools

- ESLint + Prettier
- Jest + React Testing Library
- Playwright (E2E)
- GitHub Actions

## Future Architecture Considerations

### Microservices Migration

- Content processing service
- Media handling service
- Analytics service
- Notification service

### Real-time Features

- WebSocket integration
- Live story updates
- Comment streams
- Engagement tracking

### AI Enhancements

- Better content understanding
- Automated categorization
- Quality scoring
- Trend prediction

### Scale Improvements

- Message queue system
- Worker processes
- Database sharding
- Multi-region deployment
