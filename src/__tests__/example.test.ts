import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

// Example service function to test
function processPostData(data: any) {
  if (!data) return null;
  
  return {
    id: data.id,
    title: data.title?.trim(),
    isPublished: data.status === 'published',
    commentCount: data.comments?.length || 0,
    tags: data.tags || [],
  };
}

describe('Example Tests with Jest Extended', () => {
  describe('processPostData function', () => {
    it('should process valid post data correctly', () => {
      const mockData = {
        id: '123',
        title: '  Test Post  ',
        status: 'published',
        comments: [{ id: 1 }, { id: 2 }],
        tags: ['reddit', 'viral'],
      };

      const result = processPostData(mockData);

      // Using jest-extended matchers
      expect(result).toBeObject();
      expect(result).toContainAllKeys(['id', 'title', 'isPublished', 'commentCount', 'tags']);
      expect(result.title).toEqualIgnoringWhitespace('Test Post');
      expect(result.isPublished).toBeTrue();
      expect(result.commentCount).toBeNumber();
      expect(result.commentCount).toBeGreaterThan(0);
      expect(result.tags).toBeArrayOfSize(2);
      expect(result.tags).toIncludeAllMembers(['reddit', 'viral']);
    });

    it('should handle missing data gracefully', () => {
      const result = processPostData(null);
      
      expect(result).toBeNull();
    });

    it('should handle incomplete data', () => {
      const incompleteData = {
        id: '456',
        status: 'draft',
      };

      const result = processPostData(incompleteData);

      expect(result).toBeObject();
      expect(result.isPublished).toBeFalse();
      expect(result.commentCount).toBeZero();
      expect(result.tags).toBeEmpty();
      expect(result.title).toBeUndefined();
    });
  });

  describe('API Integration with MSW', () => {
    it('should fetch posts from mocked API', async () => {
      const response = await fetch('/api/posts?page=1&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toContainKey('items');
      expect(data).toContainKey('meta');
      expect(data.items).toBeArray();
      expect(data.items).not.toBeEmpty();
      expect(data.meta.page).toBeNumber();
      expect(data.meta.total).toBePositive();
    });

    it('should handle Reddit ingestion request', async () => {
      const requestBody = {
        subreddit: 'TIFU',
        persona: 'snarky-sage',
        limit: 5,
      };

      const response = await fetch('/api/ingest/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toContainAllKeys(['jobId', 'status', 'estimatedTime']);
      expect(data.jobId).toBeString();
      expect(data.status).toBeOneOf(['queued', 'processing']);
      expect(data.estimatedTime).toMatch(/\d+-\d+ minutes/);
    });

    it('should handle API errors gracefully', async () => {
      // Override the handler for this test
      server.use(
        http.get('/api/posts', () => {
          return HttpResponse.json(
            { error: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed' },
            { status: 500 }
          );
        })
      );

      const response = await fetch('/api/posts');
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toContainKey('error');
      expect(data.error).toEqual('INTERNAL_SERVER_ERROR');
    });
  });

  describe('Data Validation', () => {
    it('should validate array structures', () => {
      const posts = [
        { id: '1', title: 'Post 1' },
        { id: '2', title: 'Post 2' },
        { id: '3', title: 'Post 3' },
      ];

      expect(posts).toBeArrayOfSize(3);
      expect(posts).toSatisfyAll((post: any) => {
        return typeof post.id === 'string' && typeof post.title === 'string';
      });
      
      const titles = posts.map(p => p.title);
      expect(titles).toIncludeAllMembers(['Post 1', 'Post 2', 'Post 3']);
    });

    it('should validate object properties', () => {
      const persona = {
        id: 1,
        name: 'The Snarky Sage',
        tone: 'sarcastic',
        avatarUrl: '/avatars/snarky.png',
        isActive: true,
      };

      expect(persona).toBeObject();
      expect(persona).toContainKeys(['id', 'name', 'tone']);
      expect(persona.id).toBePositive();
      expect(persona.name).toStartWith('The');
      expect(persona.avatarUrl).toMatch(/^\/avatars\/.*\.png$/);
      expect(persona.isActive).toBeBoolean();
    });

    it('should validate numeric ranges', () => {
      const metrics = {
        score: 1500,
        ratio: 0.85,
        comments: 42,
        views: 10000,
      };

      expect(metrics.score).toBeWithin(1000, 2000);
      expect(metrics.ratio).toBeWithin(0, 1);
      expect(metrics.comments).toBePositive();
      expect(metrics.views).toBeGreaterThanOrEqual(1000);
    });
  });
});