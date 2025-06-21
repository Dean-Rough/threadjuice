# Reddit Scraping Integration Plan

## Phase 1: Basic Reddit API Integration

### Setup

```bash
# Already have credentials in .env.local:
REDDIT_CLIENT_ID=cZKHimI6hVazNj-O7d4YIQ
REDDIT_CLIENT_SECRET=VfrMLSEyqjJjMN-tY0ejWj-NGzDFnA
REDDIT_USER_AGENT=ThreadJuice/1.0
```

### Implementation Strategy

**1. Reddit Comment Scraper**

```javascript
// reddit-comment-scraper.js
async function scrapeRedditComments(postUrl) {
  // Use Reddit API to fetch real comments
  // Parse and format for ThreadJuice display
  // Respect rate limits and attribution
}
```

**2. Legal Attribution**

- Link back to original Reddit thread ✅ (Already implemented)
- Show "Originally from Reddit" banner ✅ (Already implemented)
- Include direct links to source ✅ (Already implemented)
- Respect Reddit's terms of service

**3. Comment Selection Algorithm**

```javascript
function selectBestComments(allComments) {
  // Sort by upvotes, controversy, engagement
  // Filter for appropriate content
  // Maintain thread structure
  // Include top-level and nested replies
}
```

**4. Real-time vs Cached**

- Cache comments to avoid API limits
- Refresh every 24 hours
- Fall back to AI-generated if Reddit unavailable

## Phase 2: Advanced Features

**1. Comment Thread Reconstruction**

- Maintain parent-child relationships
- Show collapsed/expanded states
- Preserve Reddit formatting (markdown, links)

**2. User Privacy**

- Option to anonymize usernames
- Filter out personal information
- Respect deleted/removed content

**3. Content Moderation**

- Filter inappropriate content
- Check comment quality scores
- Maintain ThreadJuice brand standards

## Phase 3: Integration Points

**1. Story Generator Enhancement**

```javascript
// In generate-full-automated-story.js
async function getActualRedditComments(storyTheme) {
  // Search Reddit for similar real stories
  // Extract genuine reactions
  // Mix with AI-generated for optimal engagement
}
```

**2. Hybrid Approach**

- Use real Reddit comments for authenticity
- Supplement with AI-generated for perfect narrative flow
- Best of both worlds: real reactions + curated experience

## Implementation Priority

1. ✅ **Attribution & Backlinking** (Done)
2. 🔄 **Basic Reddit API wrapper**
3. 🔄 **Comment scraping for existing stories**
4. 🔄 **Integration with auto-generator**
5. 🔄 **Advanced thread reconstruction**

## Legal Considerations

- Reddit API terms compliance
- Fair use for commentary/criticism
- Attribution requirements met
- No reproduction of full posts, just comments
- Transformative use for viral content curation

**Status**: Ready to implement when needed. Current AI approach provides excellent control and consistency while we build audience.
