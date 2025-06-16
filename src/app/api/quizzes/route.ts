import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Quiz validation schemas
const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple-choice', 'true-false', 'ranking']),
  question: z.string().min(10).max(500),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.union([z.string(), z.number(), z.array(z.string())]),
  explanation: z.string().optional(),
  points: z.number().min(1).max(10).default(1),
});

const CreateQuizSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['viral', 'trending', 'chaos', 'wholesome', 'drama']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeLimit: z.number().min(30).max(1800).optional(), // 30 seconds to 30 minutes
  questions: z.array(QuizQuestionSchema).min(3).max(20),
  isPublished: z.boolean().default(false),
  personaId: z.string().optional(),
});

const UpdateQuizSchema = CreateQuizSchema.partial();

// Mock database (in production, use Supabase)
interface Quiz {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  timeLimit?: number;
  questions: any[];
  isPublished: boolean;
  personaId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  analytics: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
  };
}

// Mock data store
let quizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Reddit Drama Knowledge Test',
    description: 'Test your knowledge of infamous Reddit drama and controversies',
    category: 'drama',
    difficulty: 'medium',
    timeLimit: 300,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which subreddit was infamous for the "Boston Bomber" incident?',
        options: ['/r/news', '/r/FindBostonBombers', '/r/worldnews', '/r/Boston'],
        correctAnswer: '/r/FindBostonBombers',
        explanation: 'Reddit users incorrectly identified the Boston Marathon bomber, leading to harassment of innocent people.',
        points: 2,
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'The "We did it Reddit!" meme originated from successfully solving a crime.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'The meme is actually sarcastic, referring to Reddit\'s failed attempts at amateur detective work.',
        points: 1,
      },
      {
        id: 'q3',
        type: 'ranking',
        question: 'Rank these Reddit controversies by year (earliest to latest):',
        options: ['Ellen Pao resignation', 'The Fappening', 'API changes protest', 'GameStop stock saga'],
        correctAnswer: ['The Fappening', 'Ellen Pao resignation', 'GameStop stock saga', 'API changes protest'],
        explanation: 'The Fappening (2014), Ellen Pao (2015), GameStop (2021), API changes (2023).',
        points: 3,
      },
    ],
    isPublished: true,
    createdBy: 'user_admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    analytics: {
      totalAttempts: 156,
      averageScore: 4.2,
      completionRate: 0.78,
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const published = searchParams.get('published');

    // Filter quizzes
    let filteredQuizzes = quizzes;
    
    if (category) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.category === category);
    }
    
    if (difficulty) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.difficulty === difficulty);
    }
    
    if (published !== null) {
      const isPublished = published === 'true';
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.isPublished === isPublished);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedQuizzes = filteredQuizzes.slice(startIndex, endIndex);

    return NextResponse.json({
      quizzes: paginatedQuizzes,
      pagination: {
        page,
        limit,
        total: filteredQuizzes.length,
        pages: Math.ceil(filteredQuizzes.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateQuizSchema.parse(body);

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      ...validatedData,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analytics: {
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0,
      },
    };

    quizzes.push(newQuiz);

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}