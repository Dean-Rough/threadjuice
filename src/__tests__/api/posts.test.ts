/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock Clerk auth before importing API routes
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock database functions before importing API routes
jest.mock('@/lib/database', () => ({
  getPosts: jest.fn(),
  createPost: jest.fn(),
  getPostById: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
}));

// Import API routes after mocking dependencies
import { GET, POST } from '@/app/api/posts/route';
import { GET as getById, PUT, DELETE } from '@/app/api/posts/[id]/route';
import * as database from '@/lib/database';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetPosts = database.getPosts as jest.MockedFunction<typeof database.getPosts>;
const mockCreatePost = database.createPost as jest.MockedFunction<typeof database.createPost>;
const mockGetPostById = database.getPostById as jest.MockedFunction<typeof database.getPostById>;
const mockUpdatePost = database.updatePost as jest.MockedFunction<typeof database.updatePost>;
const mockDeletePost = database.deletePost as jest.MockedFunction<typeof database.deletePost>;

describe('Posts API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should return paginated results with default parameters', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post 1',
          slug: 'test-post-1',
          hook: 'Test hook 1',
          content: [{ type: 'paragraph', content: 'Test content 1' }],
          status: 'published',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Test Post 2',
          slug: 'test-post-2',
          hook: 'Test hook 2',
          content: [{ type: 'paragraph', content: 'Test content 2' }],
          status: 'published',
          created_at: new Date().toISOString(),
        },
      ];

      mockGetPosts.mockResolvedValue({
        posts: mockPosts,
        total: 2,
      });

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(2);
      expect(data.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
      expect(mockGetPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
    });

    it('should handle pagination parameters', async () => {
      mockGetPosts.mockResolvedValue({
        posts: [],
        total: 50,
      });

      const request = new NextRequest('http://localhost:3000/api/posts?page=2&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
      expect(mockGetPosts).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
    });

    it('should handle filtering parameters', async () => {
      mockGetPosts.mockResolvedValue({
        posts: [],
        total: 0,
      });

      const request = new NextRequest('http://localhost:3000/api/posts?status=published&category=tech&featured=true');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        status: 'published',
        category: 'tech',
        featured: true,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
    });

    it('should return validation error for invalid parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?page=0&limit=200');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Invalid query parameters');
      expect(data.details).toBeDefined();
    });

    it('should return consistent error format for server errors', async () => {
      mockGetPosts.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/posts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
      expect(data.message).toBe('Failed to fetch posts');
    });
  });

  describe('POST /api/posts', () => {
    const validPostData = {
      title: 'Test Post',
      slug: 'test-post',
      hook: 'This is a test hook',
      content: [
        {
          type: 'paragraph',
          content: 'This is test content',
        },
      ],
      status: 'draft',
    };

    it('should require authentication', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify(validPostData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toBe('Authentication required');
    });

    it('should create post when authenticated with valid data', async () => {
      const userId = 'user_123';
      const mockCreatedPost = {
        id: 'post_123',
        ...validPostData,
        author_id: userId,
        created_at: new Date().toISOString(),
      };

      mockAuth.mockResolvedValue({ userId });
      mockCreatePost.mockResolvedValue(mockCreatedPost);

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify(validPostData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Post created successfully');
      expect(data.data).toEqual(mockCreatedPost);
      expect(mockCreatePost).toHaveBeenCalledWith({
        ...validPostData,
        featured: false,
        layout_style: 1,
        author_id: userId,
      });
    });

    it('should return validation error for invalid data', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const invalidData = {
        title: '', // Invalid: empty title
        slug: 'test-post',
        hook: 'Test hook',
        content: [], // Invalid: empty content
      };

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation Error');
      expect(data.message).toBe('Invalid post data');
      expect(data.details).toBeDefined();
    });

    it('should return consistent error format for server errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockCreatePost.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify(validPostData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
      expect(data.message).toBe('Failed to create post');
    });
  });

  describe('GET /api/posts/[id]', () => {
    it('should return post by ID', async () => {
      const mockPost = {
        id: 'post_123',
        title: 'Test Post',
        slug: 'test-post',
        hook: 'Test hook',
        content: [{ type: 'paragraph', content: 'Test content' }],
        status: 'published',
        author_id: 'user_123',
        created_at: new Date().toISOString(),
      };

      mockGetPostById.mockResolvedValue(mockPost);

      const request = new NextRequest('http://localhost:3000/api/posts/post_123');
      const response = await getById(request, { params: Promise.resolve({ id: 'post_123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockPost);
      expect(mockGetPostById).toHaveBeenCalledWith('post_123');
    });

    it('should return 404 for non-existent post', async () => {
      mockGetPostById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/posts/nonexistent');
      const response = await getById(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
      expect(data.message).toBe('Post not found');
    });

    it('should return 400 for invalid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts/');
      const response = await getById(request, { params: Promise.resolve({ id: '' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
      expect(data.message).toBe('Invalid post ID');
    });
  });

  describe('PUT /api/posts/[id]', () => {
    const updateData = {
      title: 'Updated Post Title',
      hook: 'Updated hook',
    };

    it('should require authentication', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/posts/550e8400-e29b-41d4-a716-446655440000', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toBe('Authentication required');
    });

    it('should only allow post author to update', async () => {
      const userId = 'user_123';
      const postId = '550e8400-e29b-41d4-a716-446655440000';
      const mockPost = {
        id: postId,
        author_id: 'different_user',
        title: 'Original Title',
      };

      mockAuth.mockResolvedValue({ userId });
      mockGetPostById.mockResolvedValue(mockPost);

      const request = new NextRequest(`http://localhost:3000/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: postId }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
      expect(data.message).toBe('You can only update your own posts');
    });

    it('should update post when authorized', async () => {
      const userId = 'user_123';
      const postId = '550e8400-e29b-41d4-a716-446655440000';
      const mockPost = {
        id: postId,
        author_id: userId,
        title: 'Original Title',
      };
      const updatedPost = {
        ...mockPost,
        ...updateData,
      };

      mockAuth.mockResolvedValue({ userId });
      mockGetPostById.mockResolvedValue(mockPost);
      mockUpdatePost.mockResolvedValue(updatedPost);

      const request = new NextRequest(`http://localhost:3000/api/posts/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...updateData,
          id: postId, // Include ID in the request body for validation
        }),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: postId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Post updated successfully');
      expect(data.data).toEqual(updatedPost);
    });
  });

  describe('DELETE /api/posts/[id]', () => {
    it('should require authentication', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/posts/550e8400-e29b-41d4-a716-446655440000', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toBe('Authentication required');
    });

    it('should only allow post author to delete', async () => {
      const userId = 'user_123';
      const postId = '550e8400-e29b-41d4-a716-446655440000';
      const mockPost = {
        id: postId,
        author_id: 'different_user',
        title: 'Test Post',
      };

      mockAuth.mockResolvedValue({ userId });
      mockGetPostById.mockResolvedValue(mockPost);

      const request = new NextRequest(`http://localhost:3000/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: postId }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
      expect(data.message).toBe('You can only delete your own posts');
    });

    it('should delete post when authorized', async () => {
      const userId = 'user_123';
      const postId = '550e8400-e29b-41d4-a716-446655440000';
      const mockPost = {
        id: postId,
        author_id: userId,
        title: 'Test Post',
      };

      mockAuth.mockResolvedValue({ userId });
      mockGetPostById.mockResolvedValue(mockPost);
      mockDeletePost.mockResolvedValue(undefined);

      const request = new NextRequest(`http://localhost:3000/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: postId }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Post deleted successfully');
      expect(mockDeletePost).toHaveBeenCalledWith(postId);
    });
  });

  describe('Error Format Consistency', () => {
    it('should return consistent error format across all endpoints', async () => {
      // Test GET endpoint error format
      mockGetPosts.mockRejectedValue(new Error('Test error'));
      const getRequest = new NextRequest('http://localhost:3000/api/posts');
      const getResponse = await GET(getRequest);
      const getData = await getResponse.json();

      expect(getData).toHaveProperty('error');
      expect(getData).toHaveProperty('message');
      expect(typeof getData.error).toBe('string');
      expect(typeof getData.message).toBe('string');

      // Test POST endpoint error format (unauthorized)
      mockAuth.mockResolvedValue({ userId: null });
      const postRequest = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const postResponse = await POST(postRequest);
      const postData = await postResponse.json();

      expect(postData).toHaveProperty('error');
      expect(postData).toHaveProperty('message');
      expect(typeof postData.error).toBe('string');
      expect(typeof postData.message).toBe('string');
    });
  });
}); 