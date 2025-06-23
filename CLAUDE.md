# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThreadJuice is a modern viral content aggregator that curates and presents engaging Reddit-style stories with professional design and interactive features. Built with Next.js 15 and shadcn/ui for a polished user experience.

## Core Mission

- The whole point is to find the most viral content from Twitter and Reddit - ie most liked/most engagement/most commented/most shared - and repackage it in a fun bitesize way for easy consumption

## Current Implementation Status

**✅ COMPLETED: Full UI Transformation**

- Complete shadcn/ui integration with dark mode theming
- Professional Geist fonts with extrabold headings (800 weight)
- ThreadJuice branding with white SVG logos and orange accents
- Hero carousel with auto-cycling background images
- Category ticker with clickable navigation
- Dual voting toolbars with engagement metrics
- Dynamic filter pages for categories and authors
- Responsive design optimized for all devices

## Scraping System

**Real Content Scraping** - No mock or simulated data anywhere

### Primary Scrapers
- **Reddit Scraper** (`scripts/scraping/scrape-reddit-story.js`) - Direct API via .json endpoints
- **Twitter Scraper** (`scripts/scraping/scrape-twitter-story.js`) - Twitter API v2 with bearer token

### Reddit Direct API (Primary Solution)
- **Reddit**: Direct API access via .json endpoints - NO RATE LIMITS!
- **Comprehensive media extraction**: Images, videos, galleries, embeds
- **Rich comment data**: Top comments, controversial detection
- **No dependencies**: Uses built-in fetch, no external services needed

### Apify Integration (Twitter Only)
- **Twitter**: `scripts/apify/apify-twitter-scraper.js` using `quacker/twitter-scraper`
- **Note**: Currently not functional - all Twitter scrapers returning 0 results
- **See**: `docs/APIFY_INTEGRATION.md` for setup

## Development Commands

```bash
# Development
npm run dev         # Start development server
npm run build       # Production build
npm run lint        # Code quality check

# Testing
npm run test        # Jest unit tests
npm run test:e2e    # Playwright E2E tests

# Story Generation
npm run story:generate      # Generate single story
npm run story:bulk 5        # Generate multiple stories
npm run story:help          # Show all options

# Content Scraping (Direct APIs)
npm run scrape:reddit <reddit-url>      # Scrape Reddit post
npm run scrape:twitter thread <url>     # Scrape Twitter thread
npm run scrape:twitter drama <url1> <url2>  # Scrape Twitter drama

# Apify Integration (Managed Scraping)
npm run apify:reddit scrape day 10      # Viral Reddit content
npm run apify:twitter scrape "elonmusk,naval" 15  # Twitter accounts
npm run apify:twitter accounts           # List available accounts
npm run apify:test                       # Test connection

# Database (when implemented)
npm run db:setup    # Initialize database
npm run db:migrate  # Run migrations
npm run db:seed     # Seed with data
```

## Environment Variables Required

```bash
# Twitter API (for direct scraping)
TWITTER_BEARER_TOKEN=xxxxx

# Apify (for managed scraping)
APIFY_API_TOKEN=apify_api_xxxxx

# Supabase (database)
NEXT_PUBLIC_SUPABASE_URL=xxxxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

## NO MOCK OR SIMULATED DATA ANYWHERE
**HARD RULE**: Never use mock, simulated, dummy, or placeholder data. All content must be real, production-ready material. No "simulate", "mock", or "fake" prefixes in data generation. 

**CRITICAL**: Stories MUST be based on REAL Reddit/Twitter posts. If no real data is available, DO NOT generate a story. The system will throw an error rather than create AI-generated content.

The `generate-story-unified.js` script now REQUIRES real Reddit data via direct API. No AI generation, no data = no story.

## Script Guidance
- `generate-story-unified.js` is our MAIN content generation script - that is what we tweak to improve our story generation. DO NOT create new content generation scripts without instruction to do so

## Content Philosophy
- REAL DATA ONLY: We scrape real viral content from Reddit/Twitter
- NO AI STORIES: We transform real posts, not create fictional ones
- AUTHENTICITY: Every story is based on actual viral internet content
- TRANSFORMATION: We enhance real stories with multiple sections, not copy them directly

## Content Integrity Rules
- NO FAKE DATA, NO MOCK DATA, NO EXCEPTIONS

## Current System Status (Dec 2024)

### ✅ WORKING
- Reddit scraping via direct API (no rate limits!)
- Story generation from real Reddit data
- Rich media extraction (images, videos, galleries)
- Image selection with Pexels API
- Supabase database integration

### ❌ NOT WORKING
- Twitter/X scraping via Apify (all actors returning 0 results or demo data)
- Twitter API hitting rate limits (429 errors)
- Comments occasionally showing from wrong story

### Known Issues & Next Steps
- Twitter scrapers not functioning - need alternative solution
- See `/handover.md` for detailed status and troubleshooting