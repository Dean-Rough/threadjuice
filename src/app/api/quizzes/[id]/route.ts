import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// Import the quiz types from the main route
const UpdateQuizSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z
    .enum(['viral', 'trending', 'chaos', 'wholesome', 'drama'])
    .optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  timeLimit: z.number().min(30).max(1800).optional(),
  questions: z.array(z.any()).min(3).max(20).optional(),
  isPublished: z.boolean().optional(),
  personaId: z.string().optional(),
});

// Mock quiz data (same as main route - in production, use shared database)
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

let quizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Reddit Drama Knowledge Test',
    description:
      'Test your knowledge of infamous Reddit drama and controversies',
    category: 'drama',
    difficulty: 'medium',
    timeLimit: 300,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question:
          'Which subreddit was infamous for the "Boston Bomber" incident?',
        options: [
          '/r/news',
          '/r/FindBostonBombers',
          '/r/worldnews',
          '/r/Boston',
        ],
        correctAnswer: '/r/FindBostonBombers',
        explanation:
          'Reddit users incorrectly identified the Boston Marathon bomber, leading to harassment of innocent people.',
        points: 2,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check if user owns the quiz
    if (quiz.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only edit your own quizzes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateQuizSchema.parse(body);

    // Update quiz
    const updatedQuiz = {
      ...quiz,
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    const quizIndex = quizzes.findIndex(q => q.id === id);
    quizzes[quizIndex] = updatedQuiz;

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const quiz = quizzes.find(q => q.id === id);

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check if user owns the quiz
    if (quiz.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - you can only delete your own quizzes' },
        { status: 403 }
      );
    }

    // Remove quiz
    quizzes = quizzes.filter(q => q.id !== id);

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
