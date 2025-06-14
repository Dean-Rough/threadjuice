import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Reddit API
  http.get('https://oauth.reddit.com/r/:subreddit/hot', ({ params }) => {
    return HttpResponse.json({
      data: {
        children: [
          {
            data: {
              id: 'test_thread_1',
              title: 'TIFU by trying to impress my date',
              selftext: 'So this happened yesterday...',
              subreddit: params.subreddit,
              author: 'throwaway_user',
              score: 1234,
              num_comments: 567,
              created_utc: Date.now() / 1000 - 3600,
            },
          },
        ],
      },
    });
  }),

  // Mock OpenAI API
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: 'The Dating Disaster That Went Viral',
              hook: 'Sometimes trying too hard backfires spectacularly',
              content: [
                {
                  type: 'paragraph',
                  content:
                    'Our protagonist thought they had the perfect plan...',
                },
              ],
            }),
          },
        },
      ],
    });
  }),

  // Mock ThreadJuice API routes
  http.get('/api/posts', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    return HttpResponse.json({
      items: [
        {
          id: '1',
          title: 'Mock Post Title',
          slug: 'mock-post-title',
          hook: 'This is a mock post for testing',
          content: [],
          personaId: 1,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          persona: {
            id: 1,
            name: 'The Snarky Sage',
            avatarUrl: '/avatars/snarky-sage.png',
            tone: 'sarcastic',
          },
        },
      ],
      meta: {
        page,
        limit,
        total: 1,
        totalPages: 1,
      },
    });
  }),

  http.post('/api/ingest/reddit', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      jobId: 'mock-job-123',
      status: 'queued',
      estimatedTime: '2-3 minutes',
    });
  }),
];
