# Story Generation Migration Guide

## Overview
All story generation functionality has been consolidated into a single unified script.

## New Unified Script
`scripts/content/generate-story-unified.js`

## Usage

### Generate a single story:
```bash
node scripts/content/generate-story-unified.js
```

### Generate with options:
```bash
node scripts/content/generate-story-unified.js generate --category workplace --source reddit
```

### Generate multiple stories:
```bash
node scripts/content/generate-story-unified.js bulk 10
```

### Save to file instead of database:
```bash
node scripts/content/generate-story-unified.js generate --save-file --no-db
```

## Deprecated Scripts
The following scripts have been archived:
- generate-full-automated-story.js
- scripts/storygen-1.js
- scripts/content/generate-story.js (old version)
- All scripts in scripts/deprecated/

## API Integration
The API routes now use the unified story generation service:
- `/api/admin/generate` - Generate stories via API
- `src/lib/storyIngestion.ts` - TypeScript service layer

## Benefits
1. Single source of truth for story generation
2. Consistent configuration across all generation methods
3. Easier maintenance and updates
4. Better error handling and logging
5. Support for both CLI and API usage

## Migration Steps
1. Update any scripts or cron jobs to use the new unified script
2. Update environment variables if needed
3. Test generation with the new script
4. Remove references to old scripts
