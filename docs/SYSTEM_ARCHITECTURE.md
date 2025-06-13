# System Architecture (Text Diagram)

**Clients**
• Browser (mobile-first)  
• Social crawlers (OG/SEO)  

**Edge**
• Vercel Edge → `middleware.ts` → Clerk auth

**Frontend**
• Next.js App Router  
  – `app/(public)` – landing, trending, post pages  
  – `app/(auth)` – user settings  

**Backend (API / Services)**
1. **Content Ingest Service** (cron or on-demand)  
   • `/api/ingest/reddit` → Scraper → GPT-4 summariser  
2. **Quiz Service**  
   • `/api/quizzes/:id`  
3. **Video Generator Service**  
   • Worker queue (Supabase Edge Functions / Vercel Cron)  
4. **Event Aggregator**  
   • Groups related threads by topic

**Data**
• PostgreSQL  
  – `posts`, `comments`, `events`, `quizzes`, `personas`, `images`  
• Storage bucket – screenshots, videos, OG images

**External APIs**
Reddit → GPT-4 → Wikimedia/Flickr/Unsplash → ElevenLabs → Bannerbear 