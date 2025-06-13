# 🗂️ Product Requirements Document – **[Reddit-to-Viral Engine]**

## 1. **Overview**

A content platform that scrapes and curates Reddit’s most outrageous threads, transforming them into snackable, multimodal stories with custom avatars, quizzes, shareable visuals, and automated short-form videos — all wrapped in a sexy, mobile-first UI.

## 2. **Core Objectives**

- Automate and enhance Reddit content for virality and shareability
- Aggregate fragmented commentary into coherent, entertaining narratives
- Build a consistent brand through writer personas and content style
- Deliver content in multiple formats: articles, videos, quizzes, and carousels
- Optimise for SEO, social sharing, and rapid engagement loops

## 3. **User Personas**

- **Casual Scrollers** – want fast, funny, visual content
- **Quiz Lovers** – love personality quizzes and interactive formats
- **Social Sharers** – care more about _how_ it looks than what it says
- **Trend Trackers** – want to see what Reddit thinks about current events

## 4. **Writer Personas & Avatars**

Each post is voiced by a fictional persona with a name, avatar, and tone:

- **The Snarky Sage** – sarcastic and deadpan
- **The Down-to-Earth Buddy** – chill and friendly
- **The Dry Cynic** – bitterly hilarious, loves chaos
  Avatars are used in bylines, comments, video intros, and as part of the brand’s identity system.

## 5. **Content Flow**

### 5.1 Reddit Ingestion

- Scrape trending threads via Reddit API
- Target high-virality subreddits: r/TIFU, r/AmITheAsshole, r/PublicFreakout, r/Politics, etc.

### 5.2 GPT Processing

- Summarise thread into short article (hook, context, punchline)
- Extract top comments + sentiment
- Tag themes + cluster theories

## 6. **Comment Screenshots**

- Render Reddit comments as image cards (styled to resemble native Reddit UI)
- Tools: `html2canvas`, `puppeteer`, or Bannerbear
- Used within post content and video overlays
- Includes username, score, and timestamp-style metadata

## 7. **Quiz Generator**

- Each post may include a CTA quiz:
  - Format: “Which theory do you believe?”, “What kind of Redditor are you?”
  - Results are linked to personas or story angles
- Quiz completion triggers a custom share result with image or reaction
- Quiz answers are used to segment user behaviour (optional)

## 8. **Creative Commons Image Sourcing**

- Use only legally safe image sources:
  - **Wikimedia Commons** via MediaWiki API
  - **Flickr API** (with license filter)
  - **Unsplash/Pexels** for generic imagery
- Metadata stored per post:
  - `image_url`, `license_type`, `author`, `credit_text`, `source_link`
- Attribution displayed inline or post footer

## 9. **Article Format (Structured Output)**

Each post includes:

- 📰 Catchy headline
- ✍️ Avatar byline (writer persona)
- 🔥 Hook intro paragraph
- 🧠 Themed comment clusters
- 🖼️ Reddit comment screenshots
- 📸 Image (with attribution)
- 🎭 Quiz (optional)
- 📬 Share buttons
- 🗂 Related post links

## 10. **Event Aggregation Engine**

When multiple threads reference the same topic:

- Group them under an `event_id`
- Extract and deduplicate comments across posts
- Summarise as a single meta-post:
  - “What Reddit Thinks About Elon Musk’s Black Eye”
- Auto-update as new threads surface
- SEO boost: backlinks to all source threads included

## 11. **Short-Form Video Generator (TikTok & Reels)**

Each story becomes a vertical video:

- 🎬 Script:
  - 3–4 snappy lines (hook + theories + outro)
- 🎧 Voiceover:
  - AI voice matching persona (e.g. ElevenLabs)
- 📹 Visuals:
  - Background stock or AI video (Argil, Revid)
  - Overlayed comment screenshots
  - Captions, memes, emojis
- 🎵 Music:
  - Royalty-free viral tracks
- 📱 Format:
  - 9:16, subtitle-heavy, share CTA at end
- Tools: Invideo, Revid, Argil, Bannerbear

## 12. **Content Variants**

| Format            | Description                           |
| ----------------- | ------------------------------------- |
| **Post**          | Core narrative + comments + quiz      |
| **TikTok/Reel**   | 10–20 sec video version               |
| **Carousel**      | Theories as image cards               |
| **Newsletter**    | “This Week’s Reddit Meltdowns” digest |
| **Trending Page** | Live feed of story clusters           |

## 13. **Platform Architecture**

- **Frontend**: Next.js + Tailwind (or UI kit TBD)
- **Backend**: Node.js + Reddit API + GPT + CRON jobs
- **Database**: Postgres or Mongo
- **Media APIs**: Wikimedia, Pexels, Revid.ai
- **Video Pipeline**: Invideo, Argil, FFmpeg (optional)
- **Hosting**: Vercel or Render

## 14. **SEO & Growth Features**

- Structured JSON-LD schema per post
- Share image auto-gen with persona + comment snippet
- Auto-link Reddit sources
- Trending/related posts widget
- UTM-tagged share buttons (TikTok, IG, Twitter, WhatsApp)

## 15. **Roadmap Phases**

### Phase 1: MVP

- Reddit scraper + GPT content
- Static UI + share-ready output
- Persona system (1 avatar)
- Legal image support

### Phase 2: Expansion

- Quiz system
- Comment screenshot renderer
- Video generation (beta)
- Aggregated event post generator

### Phase 3: Growth

- Full video publishing pipeline
- Personality-based user onboarding
- Content A/B testing
- Monetisation via sponsorship or affiliate links
