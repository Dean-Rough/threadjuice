import { http, HttpResponse } from 'msw';

// Example API handlers for mocking
export const handlers = [
  // Mock Reddit API endpoint
  http.get('https://oauth.reddit.com/r/*/hot', () => {
    return HttpResponse.json({
      data: {
        children: [
          {
            data: {
              id: 'test123',
              title: 'Test Reddit Post',
              selftext: 'This is a test post from Reddit',
              author: 'testuser',
              score: 100,
              num_comments: 25,
              created_utc: Date.now() / 1000,
              subreddit: 'test',
              permalink: '/r/test/comments/test123',
            },
          },
        ],
      },
    });
  }),

  // Mock OpenAI API endpoint
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'This is a mocked GPT response for testing.',
          },
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25,
      },
    });
  }),

  // Mock internal API endpoints
  http.get('/api/posts', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Test Post Title',
        content: 'Test post content',
        author: 'The Snarky Sage',
        createdAt: new Date().toISOString(),
        tags: ['test', 'example'],
      },
    ]);
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 'new-post-id',
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Mock error responses
  http.get('/api/error-test', () => {
    return HttpResponse.json({ error: 'Test error message' }, { status: 500 });
  }),
];
