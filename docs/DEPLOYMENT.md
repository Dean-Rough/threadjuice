# Deployment & Environment Setup

## Required Environment Variables

### Core Application
| Key                           | Description (scope)                     | Required |
| ----------------------------- | ---------------------------------------- | -------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend Clerk key                   | ✅ |
| `CLERK_SECRET_KEY`            | Server-side Clerk key                   | ✅ |
| `DATABASE_URL`                | PostgreSQL connection string            | ✅ |

### Reddit Integration
| Key                           | Description                             | Required |
| ----------------------------- | ---------------------------------------- | -------- |
| `REDDIT_CLIENT_ID`            | Reddit API client ID                    | ✅ |
| `REDDIT_CLIENT_SECRET`        | Reddit API client secret                | ✅ |
| `REDDIT_USER_AGENT`           | Reddit API user agent string            | ✅ |

### AI Services
| Key                           | Description                             | Required |
| ----------------------------- | ---------------------------------------- | -------- |
| `OPENAI_API_KEY`              | GPT-4 API key                           | ✅ |
| `ELEVENLABS_API_KEY`          | Voice synthesis (Phase 2)               | ❌ |

### Media & Storage
| Key                           | Description                             | Required |
| ----------------------------- | ---------------------------------------- | -------- |
| `SUPABASE_URL`                | Supabase project URL                    | ✅ |
| `SUPABASE_ANON_KEY`           | Supabase anonymous key                  | ✅ |
| `BANNERBEAR_API_KEY`          | Comment screenshots (Phase 2)           | ❌ |

### External Image APIs
| Key                           | Description                             | Required |
| ----------------------------- | ---------------------------------------- | -------- |
| `UNSPLASH_ACCESS_KEY`         | Unsplash API key                        | ❌ |
| `FLICKR_API_KEY`              | Flickr API key                          | ❌ |

## Environment Files

### .env.local (Development)
```bash
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/threadjuice

# Reddit
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=ThreadJuice/1.0

# AI
OPENAI_API_KEY=sk-...

# Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### .env.example
```bash
# Copy this to .env.local and fill in your values

# Auth (get from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database (Supabase or local PostgreSQL)
DATABASE_URL=

# Reddit API (get from reddit.com/prefs/apps)
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=ThreadJuice/1.0

# OpenAI
OPENAI_API_KEY=

# Storage
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- Reddit API credentials
- OpenAI API key

### Setup
```bash
git clone https://github.com/Dean-Rough/threadjuice.git
cd threadjuice
npm install
cp .env.example .env.local
# Fill in your environment variables
npm run dev
```

### Database Setup
```bash
# If using local PostgreSQL
createdb threadjuice
npm run db:migrate
npm run db:seed

# If using Supabase
# Run the SQL from docs/DB_SCHEMA.md in your Supabase SQL editor
```

## Deployment Environments

### Staging
- **Platform**: Vercel Preview Deployments
- **Database**: Supabase staging project
- **Auth**: Clerk development instance
- **Trigger**: Any PR to main branch

### Production
- **Platform**: Vercel Production
- **Database**: Supabase production project  
- **Auth**: Clerk production instance
- **Trigger**: Push to main branch
- **Domain**: threadjuice.com (TBD)

## Git Workflow

### Branch Strategy
```bash
main                    # Production-ready code
├── feature/reddit-api  # Feature branches
├── feature/quiz-system
└── hotfix/auth-bug     # Critical fixes
```

### Development Flow
1. Create feature branch from `main`
2. Develop and test locally
3. Create PR to `main`
4. PR triggers:
   - ESLint checks
   - TypeScript compilation
   - Jest unit tests
   - Playwright e2e tests
5. Auto-merge on green (trunk-based)
6. Deploy to production

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

## Monitoring & Logging

### Production Monitoring
- **Errors**: Vercel Analytics + Sentry
- **Performance**: Vercel Speed Insights
- **Database**: Supabase Dashboard
- **Auth**: Clerk Dashboard

### Key Metrics
- Page load times
- API response times
- Reddit API rate limits
- GPT-4 token usage
- User authentication success rate 