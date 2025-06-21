# 🗂️ Product Requirements Document v2 – **ThreadJuice: The Viral Content Engine**

*Last Updated: June 2025*

## 1. **Overview**

### Original Vision (2024)
A content platform that scrapes and curates Reddit's most outrageous threads, transforming them into snackable, multimodal stories with custom avatars, quizzes, shareable visuals, and automated short-form videos.

### Current Reality (June 2025)
ThreadJuice has evolved into a **viral content aggregator** with:
- ✅ AI-generated stories using GPT-4o with persona voices
- ✅ Professional UI built with Next.js 15, shadcn/ui, and Tailwind CSS
- ✅ 15+ generated viral stories with intelligent image selection
- ✅ Master template system for consistent story presentation
- ✅ Interactive elements (voting, comments, bookmarks, sharing)
- ✅ Advanced filtering by category and author
- ✅ Google AdSense monetization integration
- ✅ **Reddit API integration working** - real data available
- ❌ Video generation pipeline (critical priority)
- ❌ Twitter drama aggregation (high potential)

## 2. **Core Objectives**

### Achieved ✅
- Build a consistent brand through writer personas and content style
- Deliver content in article format with interactive elements
- Optimize for SEO and social sharing
- Create engaging, shareable viral content
- Implement monetization through display advertising
- **Reddit API integration for real-time content**

### Immediate Priorities 🚨
- **Automated video generation** (TikTok/Reels with Veo-3)
- **Twitter drama detection** and aggregation
- **Admin dashboard** for content scheduling and control
- **Sponsored content** integration

### Future Goals 🎯
- Scale to 50+ stories daily across platforms
- Multi-source content aggregation (Reddit + Twitter + TikTok trends)
- Automated cross-platform publishing

## 3. **User Personas**

### Current
- **Casual Scrollers** ✅ – fast, funny, visual content with engaging headlines
- **Social Sharers** ✅ – beautiful UI and shareable story formats
- **Quiz Lovers** ⚡ – quiz system built but not integrated with stories
- **Trend Trackers** ✅ – Reddit trends now available with API

### Priority Targets 🎯
- **TikTok/Reels Viewers** – short-form video content consumers
- **Twitter Drama Enthusiasts** – love following online feuds
- **Brand Partners** – sponsored content opportunities

## 4. **Content Sources & Automation**

### Current Implementation ✅
- **Reddit API**: Live data pulling capability
- **GPT-4o**: Story generation with personas
- **Image Selection**: Unsplash + DALL-E 3

### Immediate Implementation 🚨

#### Admin Dashboard Requirements
```typescript
interface DashboardFeatures {
  // Content Control
  redditScrapeInterval: '15min' | '30min' | '1hr' | '2hr' | '6hr' | 'manual';
  twitterMonitoring: boolean;
  autoPublish: boolean;
  contentApproval: 'auto' | 'manual' | 'ai-filtered';
  
  // Video Generation
  autoGenerateVideos: boolean;
  videoPublishSchedule: CronExpression;
  platformTargets: ('tiktok' | 'reels' | 'youtube-shorts')[];
  
  // Monetization
  sponsoredContentSlots: number;
  affiliateAutoTag: boolean;
  revenueTracking: DashboardMetrics;
}
```

#### Twitter Drama Detection
- Monitor trending hashtags for controversy
- Track quote tweet ratios (high = drama)
- Identify viral thread patterns
- Aggregate opposing viewpoints
- Generate "Twitter is Fighting About X" stories

## 5. **Video Generation Pipeline (Priority)**

### Implementation with Veo-3
```typescript
interface VideoGeneration {
  // Content Pipeline
  story: ThreadJuiceStory;
  script: VideoScript; // 30-60 second narrative
  
  // Veo-3 Generation
  visualStyle: 'dramatic' | 'comedic' | 'documentary';
  scenes: Scene[]; // 3-5 scenes per video
  
  // Audio Layer
  voiceover: ElevenLabsVoice; // Persona-matched
  backgroundMusic: 'trending' | 'dramatic' | 'upbeat';
  
  // Branding
  watermark: 'ThreadJuice.com';
  endCard: 'Visit for full story';
  captions: 'auto-generated';
}
```

### Video Format Specifications
- **Duration**: 30-60 seconds
- **Aspect**: 9:16 (vertical)
- **Resolution**: 1080x1920
- **Captions**: Bold, readable, meme-style
- **Branding**: Consistent ThreadJuice colors/logo
- **CTA**: "Full story at ThreadJuice.com"

## 6. **Monetization Strategy (Enhanced)**

### Current ✅
- **Display Ads**: Google AdSense integration

### Immediate Revenue Streams 🚨
1. **Sponsored Content System**
   - Native story slots for brands
   - Clearly marked but engaging
   - $500-2000 per sponsored story
   - Automated insertion into feed

2. **Video Monetization**
   - TikTok Creator Fund
   - Instagram Reels Play Bonus
   - YouTube Shorts Fund
   - Affiliate links in bio

3. **Newsletter Sponsorships**
   - Weekly digest with sponsor slots
   - $50-500 per newsletter

### Revenue Targets
- **Month 1**: $1,000 (AdSense + first sponsors)
- **Month 3**: $5,000 (scaled content + video revenue)
- **Month 6**: $15,000 (multiple revenue streams)

## 7. **Technical Implementation**

### Admin Dashboard Stack
- **Frontend**: React Admin or custom Next.js dashboard
- **Auth**: Clerk with admin roles
- **Database**: PostgreSQL for settings/metrics
- **Queue**: BullMQ for scheduled tasks
- **Monitoring**: Real-time metrics display

### Video Generation Stack
- **Veo-3 API**: Google's video generation
- **ElevenLabs**: Voice synthesis
- **FFmpeg**: Video processing
- **Remotion**: Programmatic video editing
- **Upload APIs**: TikTok, Instagram, YouTube

### Twitter Integration
- **Twitter API v2**: Streaming API for trends
- **Sentiment Analysis**: Detect controversy
- **Thread Reconstruction**: Compile full discussions
- **Drama Detection**: Engagement ratio algorithms

## 8. **Content Schedule**

### Automated Publishing Cadence
- **Reddit Stories**: Every 2-4 hours
- **Twitter Drama**: As detected (max 3/day)
- **Videos**: 2-3 per day per platform
- **Newsletter**: Weekly Sunday digest

### Dashboard Controls
- Pause/resume automation
- Bulk approve/reject content
- Schedule sponsored posts
- A/B test headlines
- Monitor revenue in real-time

## 9. **Success Metrics**

### 30-Day Targets
- 100+ published stories
- 50+ videos generated
- 10k+ TikTok followers
- 5 sponsored content deals
- $2,500 total revenue

### 90-Day Goals
- 500+ story library
- 300+ videos published
- 100k+ social followers
- 25 sponsor relationships
- $10k monthly revenue

## 10. **Implementation Priority**

### Week 1-2: Admin Dashboard
- Build control panel for content automation
- Reddit scrape interval controls
- Content approval queue
- Basic metrics display

### Week 3-4: Video Pipeline
- Veo-3 API integration
- Automated script generation
- Voice synthesis setup
- First test videos

### Week 5-6: Twitter Integration
- Drama detection algorithms
- Thread aggregation
- Automated story generation
- Controversy categorization

### Week 7-8: Revenue Optimization
- Sponsored content system
- Automated affiliate tagging
- Newsletter monetization
- Revenue tracking dashboard

---

## Summary

ThreadJuice is pivoting from proof-of-concept to revenue-generating content engine. With Reddit API already working, the focus shifts to:

1. **Admin control** over automation frequency and content flow
2. **Video generation** to tap into massive TikTok/Reels audiences  
3. **Twitter drama** aggregation for additional viral content
4. **Sponsored content** as primary revenue driver

The key is building sustainable, automated systems that generate revenue while maintaining content quality and brand consistency. 