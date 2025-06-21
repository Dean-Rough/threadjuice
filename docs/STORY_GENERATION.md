# Story Generation System

## Overview
The ThreadJuice story generation system uses AI to create viral Reddit-style stories with consistent structure and formatting. The system has been unified into a single, maintainable codebase.

## Unified Architecture

### Main Script
The story generation system is now consolidated into:
```
scripts/content/generate-story-unified.js
```

This replaces all previous scattered scripts and provides a single source of truth for story generation.

### Key Features
- **AI-Powered Generation**: Uses OpenAI GPT-4o for authentic viral content
- **Smart Image Selection**: Analyzes story content to select the most relevant stock images
- **Consistent Structure**: Every story follows the proven 12-section format
- **Multiple Personas**: Three distinct writer voices for variety
- **Database Integration**: Direct import to Supabase with proper schema mapping
- **Lazy Loading**: Efficient resource usage - only loads what's needed

### Usage

#### Generate a Single Story
```bash
# Random category and persona
npm run story:generate

# Specific category
node scripts/content/generate-story-unified.js generate --category workplace

# Specific persona
node scripts/content/generate-story-unified.js generate --persona snarky-sage
```

#### Bulk Generation
```bash
# Generate 5 stories
npm run story:bulk 5

# Generate 10 stories with specific category
node scripts/content/generate-story-unified.js bulk --count 10 --category family
```

#### Import to Database
```bash
# Import specific file
node scripts/content/generate-story-unified.js import <story-file.json>

# Auto-import is enabled by default during generation
```

## Story Structure
Each story contains exactly 12 sections in this order:

1. **Hero Image** - Stock photo selected based on story content
2. **The Setup** (describe-1) - Initial situation (300-400 words)
3. **First Quote** - Most shocking line from the setup
4. **Things Get Worse** (describe-2) - Escalation (300-400 words)
5. **Second Quote** - Key moment from escalation
6. **Reddit Reactions** (comments-1) - Community responses
7. **What Really Happened** (discussion) - The reveal (400-500 words)
8. **Third Quote** - The turning point
9. **Controversial Comments** (comments-2) - Divisive takes
10. **The Aftermath** (outro) - Resolution (300-400 words)
11. **Final Quote** - Memorable conclusion
12. **The Terry's Take** (terry_corner) - Signature commentary

## Content Configuration

### Personas
```javascript
{
  'snarky-sage': {
    name: 'The Snarky Sage',
    tone: 'Sarcastic and deadpan with brutal honesty'
  },
  'down-to-earth-buddy': {
    name: 'The Down-to-Earth Buddy', 
    tone: 'Chill and friendly with relatable insights'
  },
  'dry-cynic': {
    name: 'The Dry Cynic',
    tone: 'Bitterly hilarious with chaos-loving perspective'
  }
}
```

### Categories
- **workplace** - Office politics, toxic bosses, corporate revenge
- **family** - Family drama, reunions, exposed lies
- **dating** - Relationship revenge, dating app disasters
- **neighbor** - Property disputes, noise complaints
- **customer** - Retail justice, entitled customer comeuppance
- **wedding** - Wedding disasters, bridezilla stories
- **roommate** - Living situation nightmares
- **school** - Academic drama, teacher/student conflicts
- **travel** - Vacation disasters, airline drama
- **social-media** - Influencer callouts, online feuds

### Image Library
The system includes a curated library of stock photos mapped to story themes:
- Office and workplace scenes
- Family gatherings and confrontations
- Social situations and reactions
- Technology and social media contexts
- Emotional moments and revelations

## Environment Configuration

### Required Variables
```bash
# AI Generation
OPENAI_API_KEY=sk-...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Optional Variables
```bash
# Separate API key for images (falls back to main key)
OPENAI_IMAGE_API_KEY=sk-...
```

## Technical Details

### File Structure
```
scripts/
└── content/
    ├── generate-story-unified.js  # Main unified generator
    ├── batch-import.js           # Bulk import utility
    └── story-config.js           # Shared configuration
```

### Generated Output
- Files saved as: `auto-generated-[slug].json`
- Images stored in: `public/assets/img/generated/`
- Automatic database import on generation

### Error Handling
- Graceful fallbacks for API failures
- Retry logic for transient errors
- Detailed error logging
- No partial imports - all or nothing

## Migration Notes

### From Old Scripts
If you were using the old scripts:
- `generate-full-automated-story.js` → Use `npm run story:generate`
- `scripts/storygen-1.js` → Deprecated, use unified script
- `import-story-to-supabase.js` → Now integrated into main script

### Backward Compatibility
The main `generate-story.js` at root is maintained as a wrapper for compatibility but internally uses the unified system.

## Best Practices

1. **Consistent Generation**: Always use the unified script for consistency
2. **Bulk Operations**: Use bulk generation for efficiency (batches of 5-10)
3. **Category Balance**: Rotate through categories to maintain variety
4. **Monitor Quality**: Review generated stories before publishing
5. **Database Hygiene**: Use cleanup utilities to remove duplicates