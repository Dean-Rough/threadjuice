# Deployment & Environment Setup

## Table of Contents

- [Environment Variables](#required-environment-variables)
- [Local Development](#local-development)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Deployment](#production-deployment)
- [Monitoring & Error Tracking](#monitoring--error-tracking)
- [Security Configuration](#security-configuration)
- [Troubleshooting](#troubleshooting)

## Required Environment Variables

### Core Application

| Key                                 | Description (scope)       | Required |
| ----------------------------------- | ------------------------- | -------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Frontend Clerk key        | ✅       |
| `CLERK_SECRET_KEY`                  | Server-side Clerk key     | ✅       |
| `NEXT_PUBLIC_SUPABASE_URL`          | Supabase project URL      | ✅       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase anonymous key    | ✅       |
| `SUPABASE_SERVICE_ROLE_KEY`         | Supabase service role key | ✅       |

### Reddit Integration

| Key                    | Description                  | Required |
| ---------------------- | ---------------------------- | -------- |
| `REDDIT_CLIENT_ID`     | Reddit API client ID         | ✅       |
| `REDDIT_CLIENT_SECRET` | Reddit API client secret     | ✅       |
| `REDDIT_USER_AGENT`    | Reddit API user agent string | ✅       |

### AI Services

| Key              | Description   | Required |
| ---------------- | ------------- | -------- |
| `OPENAI_API_KEY` | GPT-4 API key | ✅       |

### Optional Services

| Key                    | Description                  | Required |
| ---------------------- | ---------------------------- | -------- |
| `UNSPLASH_ACCESS_KEY`  | Unsplash API key             | ❌       |
| `WIKIMEDIA_USER_AGENT` | Wikimedia API user agent     | ❌       |
| `SENTRY_DSN`           | Sentry error tracking DSN    | ❌       |
| `VERCEL_ANALYTICS_ID`  | Vercel analytics ID          | ❌       |
| `RESEND_API_KEY`       | Resend email service API key | ❌       |
| `REDIS_URL`            | Redis connection URL         | ❌       |

### Application Configuration

| Key                          | Description               | Default               |
| ---------------------------- | ------------------------- | --------------------- |
| `NODE_ENV`                   | Application environment   | development           |
| `NEXT_PUBLIC_APP_URL`        | Application base URL      | http://localhost:3000 |
| `RATE_LIMIT_ENABLED`         | Enable rate limiting      | true                  |
| `CONTENT_MODERATION_ENABLED` | Enable content moderation | true                  |
| `PROFANITY_FILTER_LEVEL`     | Profanity filter level    | medium                |

## Environment Files

### .env.local (Development)

```bash
# ThreadJuice Environment Variables
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Reddit API (Required for content ingestion)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=ThreadJuice/1.0

# OpenAI API (Required for content generation)
OPENAI_API_KEY=sk-your_openai_api_key_here

# External Image APIs (Optional)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
WIKIMEDIA_USER_AGENT=ThreadJuice/1.0

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics and Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn_here
VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# Email Service (Optional)
RESEND_API_KEY=your_resend_api_key_here

# Rate Limiting (Optional)
REDIS_URL=redis://localhost:6379
RATE_LIMIT_ENABLED=true

# Content Moderation (Optional)
CONTENT_MODERATION_ENABLED=true
PROFANITY_FILTER_LEVEL=medium
```

### .env.example

The `.env.example` file contains all the above variables with placeholder values. Copy it to `.env.local` and fill in your actual values:

```bash
cp .env.example .env.local
# Edit .env.local with your actual API keys and configuration
```

## Environment Validation

The application uses **Zod** for comprehensive environment variable validation with clear error messages:

- **Type Safety**: All environment variables are properly typed
- **Runtime Validation**: Variables are validated at startup
- **Clear Error Messages**: Missing or invalid variables show helpful error messages
- **Development Helpers**: Environment info logging in development mode

### Validation Features

- URL format validation for Supabase and app URLs
- API key format validation for OpenAI and Clerk
- Boolean parsing for feature flags
- Enum validation for environment and filter levels
- Optional variable handling with defaults

## Local Development

### Prerequisites

- Node.js 18+
- Supabase account (or local PostgreSQL)
- Reddit API credentials
- OpenAI API key
- Clerk account for authentication

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
# Using Supabase (Recommended)
# 1. Create a new Supabase project
# 2. Run the SQL from database/schema.sql in your Supabase SQL editor
# 3. Run the SQL from database/seed.sql to populate initial data
# 4. Copy your Supabase URL and keys to .env.local

# Using local PostgreSQL (Alternative)
createdb threadjuice
npm run db:migrate
npm run db:seed
```

### API Keys Setup

1. **Clerk Authentication**:

   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy the publishable key and secret key

2. **Supabase Database**:

   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the project URL, anon key, and service role key

3. **Reddit API**:

   - Go to [reddit.com/prefs/apps](https://reddit.com/prefs/apps)
   - Create a new "script" application
   - Copy the client ID and secret

4. **OpenAI API**:
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Create an API key
   - Copy the API key (starts with `sk-`)

## Testing Environment

The application includes comprehensive environment testing:

- **Unit Tests**: Environment variable validation logic
- **Integration Tests**: Real environment configuration validation
- **Type Safety Tests**: TypeScript interface compliance
- **Error Handling Tests**: Missing variable error messages

Run environment tests:

```bash
npm test -- --testPathPatterns="env"
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

### Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all required variables from your `.env.local`
4. Set appropriate values for each environment (development/preview/production)

## Security Best Practices

- **Never commit** `.env.local` or `.env.production` files
- **Use different API keys** for development, staging, and production
- **Rotate API keys** regularly
- **Monitor API usage** to detect unauthorized access
- **Use Vercel's encrypted environment variables** for production

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment.

### Pipeline Stages

1. **Test & Quality Checks**
   - Type checking with TypeScript
   - Code linting with ESLint
   - Unit tests with Jest
   - Code coverage reporting

2. **Security Audit**
   - npm audit for dependency vulnerabilities
   - Security scanning with audit-ci

3. **E2E Testing**
   - End-to-end tests with Playwright
   - Browser compatibility testing

4. **Preview Deployment**
   - Automatic preview deployments for PRs
   - Preview URL posted as PR comment

5. **Production Deployment**
   - Deploy to production on main branch push
   - Health check verification
   - Sentry release tracking

6. **Performance Audit**
   - Lighthouse performance testing
   - Core Web Vitals monitoring

### Required GitHub Secrets

Configure these secrets in your GitHub repository:

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
CODECOV_TOKEN (optional)
```

## Production Deployment

### Automatic Deployment

The project is configured for automatic deployment via GitHub integration:

1. **Fork/Clone** the repository
2. **Connect** to Vercel via GitHub
3. **Configure** environment variables in Vercel dashboard
4. **Deploy** automatically on push to main branch

### Manual Deployment

For manual deployments:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Vercel Configuration

The `vercel.json` file includes:

- **Framework**: Next.js optimization
- **Regions**: Multi-region deployment (IAD1, SFO1)
- **Functions**: API route timeout configuration
- **Headers**: Security headers (CSP, XSS protection)
- **Caching**: Static asset caching rules
- **Redirects**: URL redirects and rewrites
- **Cron Jobs**: Scheduled tasks for content ingestion

## Monitoring & Error Tracking

### Sentry Setup

1. Create a Sentry project
2. Get your DSN from project settings
3. Configure environment variables
4. Monitoring initializes automatically

### Health Checks

The application provides health check endpoints:

- **GET /api/health** - Detailed health status
- **HEAD /api/health** - Simple health probe

Health checks monitor:
- Database connectivity
- External API availability
- Memory usage
- Response times

### Performance Monitoring

Built-in performance tracking:

- **Core Web Vitals** (FCP, LCP, FID, CLS)
- **API response times**
- **Database query performance**
- **Custom metrics** via `performanceTracker`

### Logging

Structured logging with:
- **Environment context**
- **Request tracing**
- **Error correlation**
- **Performance metrics**

## Security Configuration

### Headers

Security headers configured in `vercel.json`:

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: enabled
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: restricted permissions

### Authentication

- **Clerk** for user authentication
- **JWT validation** on API routes
- **Role-based access control**
- **Session management**

### API Security

- **Rate limiting** on API endpoints
- **CORS configuration** for cross-origin requests
- **Input validation** with Zod schemas
- **SQL injection prevention** via parameterized queries

### Environment Security

- **Secret management** via environment variables
- **No sensitive data** in client bundles
- **Secure cookie configuration**
- **HTTPS enforcement**

## Troubleshooting

### Common Issues

1. **Environment validation errors**:

   - Check that all required variables are set in `.env.local`
   - Verify API key formats (especially OpenAI and Clerk keys)
   - Ensure URLs are properly formatted

2. **Database connection issues**:

   - Verify Supabase URL and keys are correct
   - Check that your Supabase project is active
   - Ensure database schema has been applied

3. **Authentication issues**:

   - Verify Clerk keys match your Clerk application
   - Check that Clerk webhook URLs are configured correctly

4. **API rate limits**:
   - Monitor Reddit API usage (60 requests per minute)
   - Check OpenAI API usage and billing
   - Consider implementing Redis for rate limiting

### Debug Commands

```bash
# Check environment validation
npm run type-check

# Test environment configuration
npm test -- --testPathPatterns="env"

# View environment info (development only)
npm run dev
# Check console for environment configuration log
```
