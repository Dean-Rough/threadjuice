# Development Guidelines

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type - use proper typing
- Use type guards for runtime validation

### React/Next.js

- Use App Router (not Pages Router)
- Prefer Server Components when possible
- Use Client Components only when necessary (interactivity, hooks)
- Follow Next.js 14+ conventions

### Styling

- Use Tailwind CSS for all styling
- Follow mobile-first responsive design
- Use semantic HTML elements
- Maintain consistent spacing scale

## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Protected routes
│   ├── (public)/          # Public routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── features/         # Feature-specific components
├── lib/                  # Utility functions and services
│   ├── auth.ts           # Authentication utilities
│   ├── database.ts       # Database connection
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
```

## Naming Conventions

### Files and Directories

- Use kebab-case for file names: `reddit-scraper.ts`
- Use PascalCase for React components: `PostCard.tsx`
- Use camelCase for utility functions: `fetchRedditPost.ts`

### Variables and Functions

- Use camelCase: `const userName = 'dean'`
- Use descriptive names: `fetchUserPosts()` not `getData()`
- Boolean variables start with `is`, `has`, `can`: `isLoading`, `hasError`

### Constants

- Use SCREAMING_SNAKE_CASE: `const MAX_POSTS_PER_PAGE = 20`

## Component Guidelines

### React Components

```typescript
// Good: Typed props interface
interface PostCardProps {
  post: Post;
  compact?: boolean;
  onShare?: (postId: string) => void;
}

export function PostCard({ post, compact = false, onShare }: PostCardProps) {
  // Component logic
}

// Export as named export, not default
export { PostCard };
```

### API Routes

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    // Handle request
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Error Handling

### Client-Side

- Use Error Boundaries for component-level errors
- Show user-friendly error messages
- Log errors for debugging

### Server-Side

- Always wrap API routes in try-catch
- Return consistent error response format
- Log errors with context

```typescript
// Consistent error response
{
  "error": "VALIDATION_ERROR",
  "message": "Post ID is required",
  "details": { "field": "postId" }
}
```

## Testing Strategy

### Unit Tests (Jest)

- Test utility functions in isolation
- Mock external dependencies
- Aim for 80%+ code coverage

### Integration Tests

- Test API routes end-to-end
- Test database operations
- Use test database for isolation

### E2E Tests (Playwright)

- Test critical user flows
- Test across different browsers
- Run in CI/CD pipeline

## Performance Guidelines

### Database

- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Use connection pooling
- Cache expensive queries

### Frontend

- Implement lazy loading for images
- Use Next.js Image component
- Minimize bundle size
- Implement proper loading states

### API

- Implement rate limiting
- Use compression middleware
- Cache responses when appropriate
- Validate input data

## Security Best Practices

### Authentication

- Use Clerk for all authentication
- Protect API routes with auth middleware
- Validate user permissions

### Data Validation

- Validate all input data
- Sanitize user-generated content
- Use parameterized queries

### Environment Variables

- Never commit secrets to git
- Use different keys for different environments
- Rotate API keys regularly

## Git Workflow

### Commit Messages

Follow conventional commits format:

```
feat: add Reddit post scraping functionality
fix: resolve authentication redirect loop
docs: update API documentation
test: add unit tests for post validation
```

### Branch Naming

- `feature/reddit-integration`
- `fix/auth-redirect-bug`
- `docs/api-documentation`

### Pull Requests

- Keep PRs small and focused
- Include tests for new features
- Update documentation as needed
- Request review from team members

## Documentation

### Code Comments

- Explain why, not what
- Document complex business logic
- Use JSDoc for functions

### README Updates

- Keep setup instructions current
- Document new environment variables
- Update dependency requirements

## Monitoring and Logging

### Production Logging

- Log errors with context
- Use structured logging (JSON)
- Monitor API response times
- Track user authentication events

### Development Debugging

- Use meaningful console.log messages
- Remove debug logs before committing
- Use browser dev tools effectively
