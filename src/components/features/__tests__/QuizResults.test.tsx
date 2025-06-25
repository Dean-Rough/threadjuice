/**
 * @jest-environment jsdom
 */

import { render, screen, act } from '@testing-library/react';
import { QuizResults, type QuizResultsProps } from '../QuizResults';

// Mock the ShareBar component
jest.mock('@/components/ui/ShareBar', () => {
  return function MockShareBar({ title, url }: { title: string; url: string }) {
    return (
      <div data-testid='share-bar'>
        Share: {title} - {url}
      </div>
    );
  };
});

describe('QuizResults - Simplified', () => {
  const mockOnRetake = jest.fn();
  const mockOnShare = jest.fn();

  const mockQuestions = [
    {
      id: 'q1',
      type: 'multiple-choice' as const,
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      explanation: 'Basic arithmetic',
      points: 2,
    },
    {
      id: 'q2',
      type: 'true-false' as const,
      question: 'The sky is blue.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'The sky appears blue due to light scattering',
      points: 1,
    },
  ];

  const mockResult = {
    score: 3,
    totalPoints: 3,
    percentage: 100,
    timeSpent: 125, // 2:05
    answers: [
      { questionId: 'q1', answer: '4', timeSpent: 30, isCorrect: true },
      { questionId: 'q2', answer: 'True', timeSpent: 95, isCorrect: true },
    ],
    questions: mockQuestions,
  };

  const defaultProps: QuizResultsProps = {
    result: mockResult,
    quizTitle: 'Test Quiz',
    difficulty: 'medium',
    category: 'viral',
    onRetake: mockOnRetake,
    onShare: mockOnShare,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders quiz completion header', () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('viral')).toBeInTheDocument();
  });

  it('displays basic statistics', () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByText('2/2')).toBeInTheDocument(); // Correct answers
    expect(screen.getByText('3')).toBeInTheDocument(); // Points scored
    expect(screen.getByText('2:05')).toBeInTheDocument(); // Time spent
  });

  it('shows performance level for perfect score', async () => {
    render(<QuizResults {...defaultProps} />);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('renders share component', () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByTestId('share-bar')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByText('Retake Quiz')).toBeInTheDocument();
    expect(screen.getByText('Share Results')).toBeInTheDocument();
  });

  it('handles different score levels', async () => {
    const lowScoreResult = { ...mockResult, percentage: 45 };
    render(<QuizResults {...defaultProps} result={lowScoreResult} />);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });

  it('formats time correctly for different durations', () => {
    const shortTimeResult = { ...mockResult, timeSpent: 65 }; // 1:05
    render(<QuizResults {...defaultProps} result={shortTimeResult} />);

    expect(screen.getByText('1:05')).toBeInTheDocument();
  });
});
