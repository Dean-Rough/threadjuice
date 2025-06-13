# System Architecture

## High-Level Flow
```
User → Vercel Edge → Clerk Auth → Next.js App → API Routes → Services → Database/Storage
```

## Components

### Frontend (Next.js 15 App Router)
```
app/
├── layout.tsx          # Root layout + Clerk provider
├── page.tsx            # Landing page
├── posts/[slug]/       # Dynamic post pages
├── (auth)/dashboard/   # Protected user dashboard
└── api/                # API routes
    ├── posts/          # CRUD operations
    ├── ingest/reddit/  # Reddit scraping trigger
    └── quizzes/        # Quiz management
```

### Authentication (Clerk)
- **Middleware**: `middleware.ts` - Route protection
- **Components**: `<SignInButton>`, `<UserButton>`, `<SignedIn>`
- **Server**: `auth()` from `@clerk/nextjs/server`

### Data Layer (PostgreSQL + Supabase)
```sql
posts → comments → personas
  ↓       ↓         ↓
events  images   quizzes
```

### External APIs
1. **Reddit API** → Thread scraping, rate-limited
2. **OpenAI GPT-4** → Content summarization
3. **Supabase Storage** → Image/video assets
4. **Wikimedia/Unsplash** → Legal image sourcing

### Services Architecture
```
lib/
├── redditScraper.ts    # Reddit API client
├── gptSummariser.ts    # OpenAI integration
├── database.ts         # Supabase client
├── imageFetcher.ts     # CC image sourcing
└── auth.ts             # Clerk utilities
```

## Data Flow

### Content Ingestion
1. Cron/manual trigger → `POST /api/ingest/reddit`
2. Reddit API → fetch thread + comments
3. GPT-4 → summarize + extract themes
4. Database → store post + relations
5. Image APIs → fetch CC images
6. Storage → save assets

### User Experience
1. User visits `/` → trending posts feed
2. Click post → `/posts/[slug]` → full article
3. Share buttons → UTM-tracked social links
4. Quiz interaction → results stored

## Deployment
- **Hosting**: Vercel (edge functions, CDN)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (S3-compatible)
- **Monitoring**: Vercel Analytics + Supabase Dashboard 