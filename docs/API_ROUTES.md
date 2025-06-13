# API Routes Specification

| Method | Endpoint                        | Purpose                             | Auth | Payload / Params (📥) | Response (📤) |
| ------ | ------------------------------ | ----------------------------------- | ---- | --------------------- | ------------- |
| GET    | `/api/posts`                   | List paginated posts                | ❌   | `?page, ?tag`         | `{ items, meta }` |
| GET    | `/api/posts/:id`               | Fetch single post + relations       | ❌   | `:id`                 | `{ post, comments }` |
| POST   | `/api/ingest/reddit`           | Trigger Reddit scrape + GPT pass    | 🔒   | `{ subreddit, threadId? }` | `{ status, postId }` |
| POST   | `/api/quizzes`                 | Create quiz for a post              | 🔒   | `{ postId, questions }` | `{ quizId }` |
| POST   | `/api/events/aggregate`        | Aggregate related threads           | 🔒   | `{ topic }`           | `{ eventId }` |
| POST   | `/api/videos/generate`         | Create vertical video from post     | 🔒   | `{ postId, persona }` | `{ jobId }` |
| GET    | `/api/videos/status/:jobId`    | Poll video generation status        | ❌   | `:jobId`              | `{ progress, url? }` |

## Example Payloads

### POST /api/ingest/reddit
```json
{
  "subreddit": "TIFU",
  "threadId": "abc123",
  "persona": "snarky-sage"
}
```

### Response
```json
{
  "status": "processing",
  "postId": "uuid-here",
  "estimatedTime": "2-3 minutes"
}
```

## Error Handling
```jsonc
// 4xx
{ "error": "VALIDATION_ERROR", "details": "postId is required" }

// 5xx
{ "error": "INTERNAL_SERVER_ERROR", "requestId": "xyz-123" }
``` 