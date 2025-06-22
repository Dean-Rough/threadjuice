# Apify Integration Guide

## Overview

ThreadJuice now integrates with Apify scrapers as a backup solution for Reddit and Twitter content scraping. This provides reliable, managed scraping with built-in proxy rotation.

## Setup

### 1. Get Apify API Token

1. Sign up at [apify.com](https://apify.com)
2. Go to Settings > Integrations
3. Copy your API token

### 2. Add to Environment

Add your Apify API token to `.env.local`:

```bash
APIFY_API_TOKEN=apify_api_xxxxxxxxxx
```

### 3. Test Connection

```bash
npm run apify:test
```

## Available Commands

### Reddit Scraping

```bash
# Scrape viral Reddit content
npm run apify:reddit scrape

# Scrape with timeframe and limit
npm run apify:reddit scrape day 10
npm run apify:reddit scrape week 20

# Test connection
npm run apify:reddit test
```

### Twitter Scraping

```bash
# Scrape from default viral accounts
npm run apify:twitter scrape

# Scrape specific accounts
npm run apify:twitter scrape "elonmusk,naval,dril" 15

# List available accounts
npm run apify:twitter accounts

# Test connection
npm run apify:twitter test
```

## How It Works

### Reddit Integration

- Uses `trudax/reddit-scraper-lite` actor (FREE - no subscription required!)
- Targets viral subreddits: AITA, tifu, antiwork, etc.
- Fetches real content with full post body text
- Automatically adds relevant Pexels images
- Converts to ThreadJuice story format with Terry's commentary

### Twitter Integration

- Uses `quacker/twitter-scraper` actor
- "Chosen accounts" approach with curated viral accounts
- Tech drama: elonmusk, naval, paulg, dhh
- Pop culture: kanyewest, rihanna, kimkardashian
- Drama/commentary: dramaalert, popbase, popcrave
- Filters for >1K engagement threshold

## Targeted Subreddits

**Drama & Relationships:**
- AmItheAsshole
- relationship_advice
- tifu
- TrueOffMyChest

**Workplace:**
- antiwork
- MaliciousCompliance
- pettyrevenge

**Family:**
- JUSTNOMIL
- entitledparents

**General Viral:**
- HolUp
- facepalm
- therewasanattempt

## Curated Twitter Accounts

**Tech Drama:**
- @elonmusk, @naval, @paulg, @dhh, @balajis

**Pop Culture:**
- @kanyewest, @justinbieber, @rihanna, @kimkardashian

**News/Politics:**
- @cnn, @breaking911, @mrdeadmoth

**Viral Content:**
- @dril, @dog_rates, @weirdlilguys, @sosadtoday

**Drama/Commentary:**
- @dramaalert, @popbase, @popcrave, @defnoodles

## Output Format

Both scrapers convert content to ThreadJuice story format with:

- **Hero section** with source attribution
- **Original content** preserved
- **ALL media** (images, videos, GIFs) embedded inline
- **Engagement metrics** (likes, comments, retweets)
- **Terry's commentary** added automatically
- **Proper categorization** for discovery

## Benefits over Direct APIs

- **Proxy rotation** - No IP blocking
- **Rate limit management** - Professional service
- **Reliability** - Managed infrastructure
- **Scalability** - Handle high volume
- **Legal compliance** - Proper data handling

## Cost Considerations

Apify pricing is usage-based:
- Free tier: 10,000 results/month
- Pro plans start at $49/month
- Pay only for what you scrape

## Troubleshooting

### "Missing APIFY_API_TOKEN"
- Add token to `.env.local`
- Restart development server

### Actor Not Found
- Verify actor names in scripts
- Check Apify marketplace availability

### Rate Limits
- Apify manages rate limits automatically
- Increase delays if needed

## Next Steps

1. Set up Apify account
2. Add API token to `.env.local`
3. Test with `npm run apify:test`
4. Run scrapers: `npm run apify:reddit scrape`
5. Monitor results in database

The Apify integration provides reliable viral content scraping when direct APIs fail!