# Component Breakdown

## Frontend Components

| Component                          | Purpose                                   | Props |
| ---------------------------------- | ----------------------------------------- | ----- |
| `<PostCard />`                     | Teaser card for feed                      | `post, compact?` |
| `<PostPage />`                     | Full article renderer                     | `post, comments` |
| `<CommentScreenshot />`            | Renders pre-generated screenshot image    | `comment, theme?` |
| `<Quiz />`                         | Runs client-side quiz flow                | `quiz, onComplete` |
| `<ShareBar />`                     | Social share buttons with UTM tagging     | `url, title, image?` |
| `<PersonaBadge />`                 | Avatar + persona name                     | `persona, size?` |
| `<TrendingFeed />`                 | Live list of related story clusters       | `limit?, filter?` |
| `<VideoPlayer />`                  | Embeds generated vertical video           | `videoUrl, poster?` |
| `<EventCluster />`                 | Groups related posts by topic            | `event, posts` |

## Page Components

| Page                               | Route                    | Purpose |
| ---------------------------------- | ------------------------ | ------- |
| `app/page.tsx`                     | `/`                      | Landing + trending feed |
| `app/posts/[slug]/page.tsx`        | `/posts/[slug]`          | Individual post view |
| `app/trending/page.tsx`            | `/trending`              | All trending posts |
| `app/quizzes/[id]/page.tsx`        | `/quizzes/[id]`          | Standalone quiz page |
| `app/(auth)/dashboard/page.tsx`    | `/dashboard`             | User dashboard (auth required) |

## Backend Services

| File / Service               | Responsibility                               |
| ---------------------------- | -------------------------------------------- |
| `lib/redditScraper.ts`       | Fetch thread JSON, rate-limited              |
| `lib/gptSummariser.ts`       | Prompt + condense thread                     |
| `lib/imageFetcher.ts`        | Pull CC images, store metadata               |
| `lib/videoGenerator.ts`      | Hit external API, track status               |
| `lib/eventAggregator.ts`     | Group posts by topic                         |
| `lib/quizService.ts`         | CRUD for quizzes, evaluate answers           |
| `lib/database.ts`            | Database connection and queries              |
| `lib/auth.ts`                | Clerk auth utilities                         |

## API Route Handlers

| File                                | Endpoint                    | Purpose |
| ----------------------------------- | --------------------------- | ------- |
| `app/api/posts/route.ts`            | `GET /api/posts`            | List posts with pagination |
| `app/api/posts/[id]/route.ts`       | `GET /api/posts/[id]`       | Single post + relations |
| `app/api/ingest/reddit/route.ts`    | `POST /api/ingest/reddit`   | Trigger Reddit scrape |
| `app/api/quizzes/route.ts`          | `POST /api/quizzes`         | Create quiz |
| `app/api/videos/generate/route.ts`  | `POST /api/videos/generate` | Generate video |
| `app/api/videos/status/[id]/route.ts` | `GET /api/videos/status/[id]` | Video generation status | 