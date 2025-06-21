# ThreadJuice Production Architecture

## Overview

Clean, scalable production system for content generation, management, and deployment.

## 📁 Production File Structure

```
threadjuice/
├── scripts/
│   ├── content/
│   │   ├── generate-story.js        # Single story generation
│   │   ├── batch-import.js          # Import stories to database
│   │   ├── seed-database.js         # Initial database setup
│   │   └── validate-content.js      # Content quality validation
│   ├── maintenance/
│   │   ├── database-cleanup.js      # Remove old/test content
│   │   ├── image-optimization.js    # Optimize story images
│   │   └── backup-database.js       # Database backup utility
│   └── deployment/
│       ├── production-build.js      # Production build process
│       ├── environment-check.js     # Validate production env
│       └── deploy-vercel.js         # Automated deployment
├── src/lib/production/
│   ├── content-pipeline.ts          # Core content generation system
│   ├── database-manager.ts          # Database operations manager
│   ├── story-validator.ts           # Content validation & quality
│   ├── image-manager.ts             # Image processing & optimization
│   └── deployment-utils.ts          # Production deployment utilities
├── docs/production/
│   ├── CONTENT_MANAGEMENT.md        # Content management workflows
│   ├── DEPLOYMENT_GUIDE.md          # Production deployment guide
│   ├── AUTOMATION_WORKFLOWS.md      # Automated content workflows
│   └── MAINTENANCE.md               # System maintenance procedures
└── config/production/
    ├── database.config.js           # Production database configuration
    ├── content.config.js            # Content generation settings
    └── deployment.config.js         # Deployment configuration
```

## 🚀 Production Workflows

### Content Generation Workflow

1. **Single Story Generation**: `npm run content:generate`
2. **Batch Content Import**: `npm run content:import`
3. **Database Validation**: `npm run content:validate`
4. **Content Publishing**: `npm run content:publish`

### Deployment Workflow

1. **Environment Check**: `npm run deploy:check`
2. **Production Build**: `npm run deploy:build`
3. **Database Migration**: `npm run deploy:migrate`
4. **Live Deployment**: `npm run deploy:production`

### Maintenance Workflow

1. **Database Cleanup**: `npm run maintenance:cleanup`
2. **Image Optimization**: `npm run maintenance:optimize`
3. **System Backup**: `npm run maintenance:backup`
4. **Performance Monitoring**: `npm run maintenance:monitor`

## 🔧 Production Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
DATABASE_POOL_SIZE=20

# Content Generation
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
CONTENT_GENERATION_RATE_LIMIT=10

# Reddit Integration (Optional)
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=ThreadJuice/1.0

# Image Management
UNSPLASH_ACCESS_KEY=...
IMAGE_OPTIMIZATION_QUALITY=85
IMAGE_CDN_URL=...

# Deployment
VERCEL_TOKEN=...
PRODUCTION_URL=https://threadjuice.com
MONITORING_WEBHOOK=...
```

## 📊 Content Management System

### Story Generation Pipeline

```typescript
// Automated story generation with quality validation
const generateStory = async (category: string, persona: string) => {
  const story = await contentPipeline.generate({
    category,
    persona,
    imageSelection: 'intelligent',
    qualityThreshold: 8.0,
  });

  await storyValidator.validate(story);
  await databaseManager.import(story);
  await imageManager.optimize(story.imageUrl);

  return story;
};
```

### Database Operations

```typescript
// Clean database management with proper error handling
const databaseManager = {
  import: async story => {
    /* Import with validation */
  },
  cleanup: async () => {
    /* Remove test/old content */
  },
  backup: async () => {
    /* Create database backup */
  },
  migrate: async () => {
    /* Run database migrations */
  },
};
```

## 🛡️ Production Security

### Content Validation

- AI-generated content quality scoring
- Inappropriate content filtering
- Image licensing validation
- Database injection prevention

### Environment Security

- Environment variable validation
- API key rotation procedures
- Database connection pooling
- Rate limiting implementation

## 📈 Monitoring & Analytics

### Performance Monitoring

- Database query performance
- Content generation success rates
- Image loading optimization
- User engagement metrics

### Error Handling

- Centralized error logging
- Automatic retry mechanisms
- Failed content generation alerts
- Database connection monitoring

## 🔄 Automated Workflows

### Daily Content Generation

```bash
# Cron job: Generate 2-3 stories daily
0 9 * * * npm run content:generate:batch --count=3
```

### Weekly Maintenance

```bash
# Cron job: System maintenance every Sunday
0 2 * * 0 npm run maintenance:full
```

### Database Backups

```bash
# Cron job: Daily database backup
0 3 * * * npm run maintenance:backup
```

## 🚢 Deployment Pipeline

### Staging Environment

1. Feature branches → Staging deployment
2. Automated testing and validation
3. Content generation testing
4. Performance benchmarking

### Production Deployment

1. Merge to main branch
2. Automated production build
3. Database migration (if needed)
4. Zero-downtime deployment
5. Post-deployment validation

## 📋 Production Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Content generation pipeline tested
- [ ] Image optimization working
- [ ] API rate limits configured
- [ ] Monitoring systems active

### Post-Deployment

- [ ] Database connections stable
- [ ] Content generation working
- [ ] Image loading optimized
- [ ] Performance metrics green
- [ ] Error rates within threshold
- [ ] Backup systems operational

## 🆘 Emergency Procedures

### Content Generation Failure

1. Check OpenAI API status and limits
2. Verify database connectivity
3. Review error logs for patterns
4. Implement manual content fallback

### Database Issues

1. Check connection pool status
2. Review slow query logs
3. Implement read replica if needed
4. Restore from backup if necessary

### Image Loading Problems

1. Check CDN status and performance
2. Verify image optimization pipeline
3. Implement image lazy loading
4. Use fallback placeholder images

This architecture provides a clean, scalable, and maintainable foundation for ThreadJuice production operations.
