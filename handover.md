# ThreadJuice Handover Notes

## Current Status: Twitter Scraping Issues

### What's Working
1. **Reddit Scraping via Apify** ✅
   - Using `trudax/reddit-scraper-lite` (FREE actor)
   - Successfully fetching real Reddit posts from viral subreddits
   - Generating stories with real content, not mock data
   - Command: `npm run story:generate -- --source reddit --real-data`

2. **Image Selection** ✅
   - Improved keyword extraction to avoid generic terms
   - Enhanced priority word system for better relevance
   - Pexels API integration working well

3. **Story Generation** ✅
   - Unified script at `scripts/content/generate-story-unified.js`
   - Real Reddit data being transformed into ThreadJuice stories
   - Terry's commentary being added automatically

### What's NOT Working
1. **Twitter/X Scraping via Apify** ❌
   - Multiple actors tried:
     - `quacker/twitter-scraper` - Returns 0 results
     - `apidojo/tweet-scraper` - Returns demo data only
     - `apidojo/twitter-scraper-v2` - Actor doesn't exist
   - Native Twitter API hits rate limits (429 errors)
   - No working Twitter scraper found on Apify

### Critical Rule Enforcement
- **NO MOCK DATA** - User was very clear about this
- **NO FAKE DATA** - Must use real scraped content only
- If no real data available, system must throw error

### Recent Changes Made
1. Fixed HoverLink component null reference error
2. Added YouTube image domains to Next.js config
3. Improved image selection logic with expanded stop words
4. Removed mock Twitter data that was temporarily added

### Files Modified Today
- `/src/components/ui/HoverLink.tsx` - Fixed getBoundingClientRect error
- `/next.config.js` - Added img.youtube.com domains
- `/scripts/content/generate-story-unified.js` - Multiple updates for real data
- `/scripts/apify/apify-twitter-scraper.js` - Attempted fixes for Twitter

### Current Blockers
1. **Twitter Integration**
   - No working Apify actor for Twitter/X content
   - Need to either:
     a) Find a working Twitter scraper on Apify
     b) Build custom Twitter scraper using different approach
     c) Focus exclusively on Reddit content for now

2. **Comments Issue** (Minor)
   - Reddit comments component sometimes shows comments from wrong story
   - Needs investigation in comment generation logic

### Next Steps
1. Research alternative Twitter scraping solutions
2. Consider using Twitter API v2 with better rate limit handling
3. Fix comment mixing issue in Reddit stories
4. Continue generating Reddit content while Twitter is resolved

### Commands Reference
```bash
# Generate Reddit story (WORKING)
npm run story:generate -- --source reddit --real-data

# Generate Twitter story (NOT WORKING)
npm run story:generate -- --source twitter --real-data

# Bulk generation
npm run story:bulk 5

# Test Apify connection
npm run apify:test
```

### Environment Variables Required
- `APIFY_API_TOKEN` - Set and working
- `PEXELS_API_KEY` - Set and working
- `TWITTER_BEARER_TOKEN` - Set but hitting rate limits
- All Supabase keys - Set and working

The Terry's assessment: Twitter's being a proper diva, Reddit's carrying the team. Focus on what works while we sort out the bird app's tantrums.