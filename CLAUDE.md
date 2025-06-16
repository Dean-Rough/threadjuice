# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Plase see /Users/deannewton/Documents/ThreadJuice/.claude/settings.json

## Project Overview

ThreadJuice is a Reddit-to-viral content engine that transforms trending Reddit threads into multimodal stories with custom avatars, quizzes, and automated short-form videos. The platform aggregates Reddit content and enhances it for virality across social media platforms.

## Architecture & Tech Stack

**UPDATED**: Now built on Sarsa Next.js template foundation

- **Frontend**: Next.js 15 + **Sarsa Template** + Bootstrap 5 + Tailwind CSS  
- **Template**: Sarsa Next.js (magazine/news template with 8+ layouts)
- **UI Framework**: Bootstrap 5 (from Sarsa) + Tailwind CSS (existing)
- **Animations**: WOW.js, Swiper, React Fast Marquee, Isotope Layout (from Sarsa)
- **Styling**: Sarsa CSS + Custom ThreadJuice branding
- **Backend**: Node.js with Reddit API integration + OpenAI GPT
- **Database**: PostgreSQL (recommended) or MongoDB  
- **External APIs**: Reddit API, OpenAI GPT, Wikimedia Commons, Flickr, Unsplash/Pexels, ElevenLabs (voice), video generation APIs (Invideo/Argil)
- **Hosting**: Vercel or Render
- **Media Processing**: html2canvas/puppeteer for comment screenshots, FFmpeg for video processing

## Core System Components

### Content Pipeline

1. **Reddit Scraper** - Ingests trending threads from high-virality subreddits
2. **GPT Processor** - Transforms raw Reddit content into structured narratives
3. **Comment Screenshot Renderer** - Converts Reddit comments to styled image cards
4. **Writer Persona System** - Assigns content to fictional avatars with distinct voices
5. **Event Aggregator** - Groups related threads under single event IDs
6. **Quiz Generator** - Creates interactive content tied to story themes
7. **Video Pipeline** - Generates TikTok/Reels format vertical videos with AI voiceover

### Writer Personas

- **The Snarky Sage** - sarcastic and deadpan tone
- **The Down-to-Earth Buddy** - chill and friendly voice
- **The Dry Cynic** - bitterly hilarious, chaos-loving perspective

Each persona has associated avatar imagery and consistent voice characteristics.

## Content Structure

All posts follow this format:

- Catchy headline with emoji prefixes
- Avatar byline (writer persona)
- Hook intro paragraph
- Themed comment clusters
- Reddit comment screenshots
- Creative Commons images with proper attribution
- Optional interactive quiz
- Share buttons with UTM tracking
- Related post links

## Legal & Attribution Requirements

**Critical**: All images must use Creative Commons or properly licensed sources:

- Wikimedia Commons via MediaWiki API
- Flickr API with license filtering
- Unsplash/Pexels for generic imagery
- Store metadata: `image_url`, `license_type`, `author`, `credit_text`, `source_link`
- Display attribution in footer or inline

## Development Phases

**UPDATED APPROACH**: Template-first development using Sarsa foundation

**Phase 0 (Foundation)**: Sarsa template integration + App Router compatibility + ThreadJuice branding ✅  
**Phase 1 (MVP)**: Reddit scraper + GPT content + Sarsa UI adaptation + persona system + legal image support
**Phase 2**: Quiz system + comment screenshots + video generation beta + event aggregation  
**Phase 3**: Full video pipeline + user onboarding + A/B testing + monetization

## Sarsa Template Integration

**Key Implementation Strategy**:
- Use ACTUAL Sarsa template pages instead of recreating components
- Copy Sarsa page files directly to App Router structure  
- Add "use client" directives for React hooks compatibility
- Update router imports (useRouter → usePathname for App Router)
- Replace Sarsa branding with ThreadJuice SVG logos
- Adapt content themes while keeping Sarsa layouts intact

**Template Pages Integrated**:
- Homepage: `sarsa/pages/index-6.js` → `app/page.tsx`
- Blog List: `sarsa/pages/blog.js` → `app/blog/page.tsx`  
- Blog Detail: `sarsa/pages/blog/[id].js` → `app/blog/[slug]/page.tsx`
- Personas: Custom page using Sarsa layout patterns

**CSS and Dependencies**:
- Full Sarsa CSS chain imported via `globals.css`
- All Sarsa animation libraries (WOW.js, Swiper, Isotope) installed
- Bootstrap 5 + Tailwind CSS coexistence maintained

## Key Integration Points

- Reddit API for thread ingestion
- OpenAI GPT for content transformation and quiz generation
- Media APIs for legal image sourcing
- Video generation APIs for TikTok/Reels content
- Social platform APIs for automated sharing

## SEO Requirements

- Structured JSON-LD schema per post
- Auto-generated share images with persona + comment snippets
- Backlinks to original Reddit sources
- UTM-tagged share buttons for all platforms
