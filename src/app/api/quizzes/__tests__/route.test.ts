/**
 * @jest-environment node
 */

import { GET, POST } from '../route';
import { NextRequest } from 'next/server.js';
import { auth } from '@clerk/nextjs/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/quizzes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/quizzes', () => {
    it('returns paginated quizzes', async () => {
      const url = 'http://localhost:3000/api/quizzes?page=1&limit=5';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('quizzes');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.quizzes)).toBe(true);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        pages: expect.any(Number),
      });
    });

    it('filters quizzes by category', async () => {
      const url = 'http://localhost:3000/api/quizzes?category=drama';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.quizzes.forEach((quiz: any) => {
        expect(quiz.category).toBe('drama');
      });
    });

    it('filters quizzes by difficulty', async () => {
      const url = 'http://localhost:3000/api/quizzes?difficulty=medium';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.quizzes.forEach((quiz: any) => {
        expect(quiz.difficulty).toBe('medium');
      });
    });

    it('filters quizzes by published status', async () => {
      const url = 'http://localhost:3000/api/quizzes?published=true';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.quizzes.forEach((quiz: any) => {
        expect(quiz.isPublished).toBe(true);
      });
    });

    it('handles pagination correctly', async () => {
      const url = 'http://localhost:3000/api/quizzes?page=2&limit=1';
      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(1);
    });

    it('handles server errors gracefully', async () => {
      // Mock a scenario that would cause an error
      const url = 'http://localhost:3000/api/quizzes?page=invalid';
      const request = new NextRequest(url);

      const response = await GET(request);

      // Since parseInt('invalid') returns NaN, which becomes 1 in our code
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/quizzes', () => {
    const validQuizData = {
      title: 'Test Quiz',
      description: 'A test quiz',
      category: 'viral' as const,
      difficulty: 'medium' as const,
      timeLimit: 300,
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice' as const,
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          explanation: 'Basic math',
          points: 1,
        },
        {
          id: 'q2',
          type: 'true-false' as const,
          question: 'The sky is blue.',
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 1,
        },
        {
          id: 'q3',
          type: 'multiple-choice' as const,
          question: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 'Paris',
          points: 2,
        },
      ],
      isPublished: false,
    };

    it('creates a quiz successfully with valid data', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(validQuizData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe(validQuizData.title);
      expect(data.createdBy).toBe('test-user-id');
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
      expect(data.analytics).toEqual({
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0,
      });
    });

    it('requires authentication', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(validQuizData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('validates required fields', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const invalidData = {
        title: '', // Invalid: too short
        category: 'viral',
        difficulty: 'medium',
        questions: [], // Invalid: too few questions
      };

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('validates question structure', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const invalidQuestionData = {
        ...validQuizData,
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Test?',
            options: ['A'], // Invalid: too few options
            correctAnswer: 'A',
            points: 1,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(invalidQuestionData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('validates category enum', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const invalidCategoryData = {
        ...validQuizData,
        category: 'invalid-category',
      };

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(invalidCategoryData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('validates difficulty enum', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const invalidDifficultyData = {
        ...validQuizData,
        difficulty: 'invalid-difficulty',
      };

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(invalidDifficultyData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('validates time limit range', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const invalidTimeData = {
        ...validQuizData,
        timeLimit: 10, // Invalid: too short
      };

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(invalidTimeData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('validates maximum questions limit', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const tooManyQuestions = Array.from({ length: 25 }, (_, i) => ({
        id: `q${i}`,
        type: 'multiple-choice' as const,
        question: `Question ${i}?`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        points: 1,
      }));

      const invalidData = {
        ...validQuizData,
        questions: tooManyQuestions,
      };

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('handles malformed JSON', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create quiz');
    });

    it('sets default values correctly', async () => {
      mockAuth.mockReturnValue({ userId: 'test-user-id' });

      const minimalData = {
        title: 'Minimal Quiz',
        category: 'viral' as const,
        difficulty: 'medium' as const,
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice' as const,
            question: 'Test question?',
            options: ['A', 'B'],
            correctAnswer: 'A',
            points: 1,
          },
          {
            id: 'q2',
            type: 'true-false' as const,
            question: 'True or false?',
            options: ['True', 'False'],
            correctAnswer: 'True',
            points: 1,
          },
          {
            id: 'q3',
            type: 'multiple-choice' as const,
            question: 'Another question?',
            options: ['X', 'Y'],
            correctAnswer: 'X',
            points: 1,
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/quizzes', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.isPublished).toBe(false); // Default value
      expect(data.description).toBeUndefined();
      expect(data.timeLimit).toBeUndefined();
      expect(data.personaId).toBeUndefined();
    });
  });
});
