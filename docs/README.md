# ThreadJuice - Reddit-to-Viral Engine

A content platform that hoovers up Reddit's wildest threads and spits them back as snack-worthy stories, quizzes, and vertical videos—ready for TikTok, Insta, and the newsletter crowd.

## Core Tech Stack
| Layer          | Tech                                   | Why                                 |
| -------------- | -------------------------------------- | ----------------------------------- |
| Frontend       | Next.js (App Router) + Tailwind CSS    | Fast DX, file-based routing, SSR    |
| Backend        | Node.js (Next API routes / tRPC option)| Tight coupling with frontend        |
| AI Services    | OpenAI GPT-4 (summaries), ElevenLabs   | Narrative + voice-over generation   |
| Data           | PostgreSQL (Supabase)                  | Relational, great SQL, row-level RBAC|
| Storage        | Supabase Storage / S3                  | Images, generated videos            |
| Auth           | Clerk                                  | Plug-and-play, social logins        |
| Infra/Hosting  | Vercel (primary)                       | CI, edge functions, CDN             |

## Local Setup (MVP)
```bash
git clone https://github.com/Dean-Rough/threadjuice.git
cd threadjuice
npm i
cp .env.example .env.local   # Fill in keys—see DEPLOYMENT.md
npm run dev
```

## Scripts
| Command                | Purpose                     |
| ---------------------- | --------------------------- |
| `npm run dev`          | Start local dev server      |
| `npm run lint`         | ESLint checks               |
| `npm run type-check`   | `tsc --noEmit`              |
| `npm run test`         | Jest unit tests             |
| `npm run e2e`          | Playwright end-to-end tests | 