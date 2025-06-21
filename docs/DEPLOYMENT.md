# Deployment & Environment Setup

## Table of Contents

- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Performance & Monitoring](#performance--monitoring)
- [Security Configuration](#security-configuration)
- [Troubleshooting](#troubleshooting)

## Environment Variables

### Core Application Variables

| Variable              | Description             | Required | Default                 |
| --------------------- | ----------------------- | -------- | ----------------------- |
| `NODE_ENV`            | Application environment | ✅       | `development`           |
| `NEXT_PUBLIC_APP_URL` | Base application URL    | ✅       | `http://localhost:3000` |
| `PORT`                | Server port             | ❌       | `3000`                  |

### Database Configuration

| Variable       | Description                                 | Required |
| -------------- | ------------------------------------------- | -------- |
| `DATABASE_URL` | PostgreSQL connection string                | ✅       |
| `DIRECT_URL`   | Direct database connection (for migrations) | ✅       |

### Future API Integrations

| Variable               | Description              | Required |
| ---------------------- | ------------------------ | -------- |
| `REDDIT_CLIENT_ID`     | Reddit API client ID     | ❌       |
| `REDDIT_CLIENT_SECRET` | Reddit API client secret | ❌       |
| `REDDIT_USER_AGENT`    | Reddit API user agent    | ❌       |
| `OPENAI_API_KEY`       | OpenAI GPT API key       | ❌       |
| `UNSPLASH_ACCESS_KEY`  | Unsplash image API key   | ❌       |

### Analytics & Monitoring

| Variable              | Description                  | Required |
| --------------------- | ---------------------------- | -------- |
| `VERCEL_ANALYTICS_ID` | Vercel Analytics tracking ID | ❌       |
| `SENTRY_DSN`          | Sentry error tracking DSN    | ❌       |
| `GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | ❌       |

### Environment Files

#### `.env.local` (Development)

```bash
# ThreadJuice Local Development Environment

# Core Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000

# Database (Required)
DATABASE_URL=postgresql://username:password@localhost:5432/threadjuice
DIRECT_URL=postgresql://username:password@localhost:5432/threadjuice

# Future API Integrations (Optional - for development testing)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=ThreadJuice/1.0

OPENAI_API_KEY=sk-your_openai_api_key_here

UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Analytics & Monitoring (Optional)
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
SENTRY_DSN=your_sentry_dsn_here
GOOGLE_ANALYTICS_ID=GA4-your_analytics_id
```

#### `.env.example`

```bash
# ThreadJuice Environment Variables Template

# Core Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/threadjuice
DIRECT_URL=postgresql://username:password@localhost:5432/threadjuice

# External APIs (Optional - for future features)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=ThreadJuice/1.0

OPENAI_API_KEY=sk-your_openai_api_key_here

UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Analytics & Monitoring (Optional)
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
SENTRY_DSN=your_sentry_dsn_here
GOOGLE_ANALYTICS_ID=GA4-your_analytics_id
```

## Local Development

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or remote)
- Git

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/Dean-Rough/threadjuice.git
cd threadjuice

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Setup database
npm run db:setup

# Start development server
npm run dev
```

### Database Setup

#### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb threadjuice

# Update .env.local with local database URL
DATABASE_URL=postgresql://username@localhost:5432/threadjuice
DIRECT_URL=postgresql://username@localhost:5432/threadjuice

# Run database setup
npm run db:setup
```

#### Option 2: Cloud Database (Recommended)

Use a cloud PostgreSQL provider like:

- **Neon** (recommended for development)
- **Supabase**
- **PlanetScale**
- **Railway**

1. Create a database instance
2. Copy the connection string to `.env.local`
3. Run `npm run db:setup`

### Development Scripts

```bash
# Development server
npm run dev              # Start Next.js dev server

# Database management
npm run db:setup         # Initialize database schema
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed with sample data
npm run db:reset         # Reset and reseed database

# Code quality
npm run lint             # ESLint check
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript validation

# Testing
npm run test             # Jest unit tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest with coverage
npm run test:e2e         # Playwright E2E tests

# Building
npm run build            # Production build
npm run start            # Start production server
```

## Production Deployment

### Vercel (Recommended)

ThreadJuice is optimized for Vercel deployment:

#### Automatic Deployment

1. **Connect Repository**:

   - Push code to GitHub
   - Connect repository to Vercel
   - Vercel auto-detects Next.js configuration

2. **Configure Environment Variables**:

   - Go to Vercel project settings
   - Add environment variables from `.env.example`
   - Set appropriate values for production

3. **Deploy**:
   - Automatic deployment on push to main branch
   - Preview deployments for pull requests

#### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration

The project includes `vercel.json` with optimizations:

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Alternative Platforms

#### Netlify

```bash
# Build command
npm run build

# Publish directory
.next

# Environment variables
# Configure in Netlify dashboard
```

#### Railway

```bash
# Deploy with Railway CLI
railway login
railway init
railway up
```

#### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Performance & Monitoring

### Performance Optimization

#### Built-in Optimizations

- **Next.js Image Optimization**: Automatic WebP conversion and lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Use `npm run analyze` to check bundle size
- **Static Generation**: Pre-built pages for better performance

#### Performance Monitoring

```typescript
// Built-in Web Vitals tracking
// Automatic Core Web Vitals reporting to analytics

// Custom performance tracking
import { trackEvent } from '@/lib/analytics';

trackEvent('page_load_time', {
  duration: performance.now(),
  page: window.location.pathname,
});
```

### Error Monitoring

#### Sentry Integration

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
  // Next.js config
}, {
  // Sentry config
});
```

#### Health Checks

```bash
# Health check endpoint
curl https://your-domain.com/api/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "memory": "healthy"
  }
}
```

### Analytics Integration

#### Vercel Analytics

```typescript
// Automatic integration with Vercel
// No additional configuration needed
```

#### Google Analytics

```typescript
// Google Analytics 4 integration
// Configure GOOGLE_ANALYTICS_ID in environment variables
```

## Security Configuration

### Security Headers

Configured in `next.config.js` and `vercel.json`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];
```

### Content Security Policy

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
`;
```

### Environment Security

- **No secrets in client code**: All sensitive data in environment variables
- **API route protection**: Rate limiting and validation
- **Database security**: Parameterized queries prevent SQL injection
- **HTTPS enforcement**: Automatic HTTPS redirects in production

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Working

```bash
# Check if variables are loaded
npm run type-check

# Verify environment file exists
ls -la .env.local

# Check variable names (must start with NEXT_PUBLIC_ for client-side)
```

#### 2. Database Connection Issues

```bash
# Test database connection
npm run db:migrate

# Check database URL format
DATABASE_URL=postgresql://username:password@host:port/database

# Verify database exists and is accessible
```

#### 3. Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### 4. Performance Issues

```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
npm run build && npm start
# Monitor memory usage in production
```

### Debug Commands

```bash
# Environment validation
npm run type-check

# Database status
npm run db:status

# Full system check
npm run test:all

# Production build test
npm run build && npm start
```

### Support

For deployment issues:

1. Check the [GitHub repository](https://github.com/Dean-Rough/threadjuice) for known issues
2. Review the [Next.js deployment documentation](https://nextjs.org/docs/deployment)
3. Check your hosting platform's documentation
4. Open an issue with detailed error logs and environment details

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database schema applied
- [ ] Security headers configured
- [ ] Analytics and monitoring setup
- [ ] Error tracking configured
- [ ] Performance optimization verified
- [ ] SEO configuration complete
- [ ] Domain and SSL certificate configured
- [ ] Backup strategy implemented
- [ ] Health checks working
