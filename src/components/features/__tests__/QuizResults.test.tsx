/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizResults, type QuizResultsProps } from '../QuizResults';

// Mock the ShareBar component
jest.mock('@/components/ui/ShareBar', () => {
  return function MockShareBar({ title, url }: { title: string; url: string }) {
    return <div data-testid="share-bar">Share: {title} - {url}</div>;
  };
});

describe('QuizResults', () => {
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
    {
      id: 'q3',
      type: 'multiple-choice' as const,
      question: 'Capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital city of France',
      points: 2,
    },
  ];

  const mockResult = {
    score: 4,
    totalPoints: 5,
    percentage: 80,
    timeSpent: 125, // 2:05
    answers: [
      { questionId: 'q1', answer: '4', timeSpent: 30, isCorrect: true },
      { questionId: 'q2', answer: 'False', timeSpent: 45, isCorrect: false },
      { questionId: 'q3', answer: 'Paris', timeSpent: 50, isCorrect: true },
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
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders quiz completion header', () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('viral')).toBeInTheDocument();
  });

  it('displays score with animated counter', async () => {
    render(<QuizResults {...defaultProps} />);

    // Initially should show 0%
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Fast-forward animation
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  it('shows correct performance level for high score', () => {
    const highScoreResult = { ...mockResult, percentage: 90 };
    render(<QuizResults {...defaultProps} result={highScoreResult} />);

    jest.advanceTimersByTime(3000);

    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('shows correct performance level for medium score', () => {
    const mediumScoreResult = { ...mockResult, percentage: 75 };
    render(<QuizResults {...defaultProps} result={mediumScoreResult} />);

    jest.advanceTimersByTime(3000);

    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('shows correct performance level for low score', () => {
    const lowScoreResult = { ...mockResult, percentage: 45 };
    render(<QuizResults {...defaultProps} result={lowScoreResult} />);

    jest.advanceTimersByTime(3000);

    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });

  it('displays correct statistics', () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByText('2/3')).toBeInTheDocument(); // Correct answers
    expect(screen.getByText('4')).toBeInTheDocument(); // Points scored
    expect(screen.getByText('2:05')).toBeInTheDocument(); // Time spent
  });

  it('formats time correctly', () => {
    const shortTimeResult = { ...mockResult, timeSpent: 65 }; // 1:05
    render(<QuizResults {...defaultProps} result={shortTimeResult} />);

    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('displays accuracy and average time per question', () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByText('80%')).toBeInTheDocument(); // Accuracy
    expect(screen.getByText('42s')).toBeInTheDocument(); // Average time per question (125/3 ≈ 42)
    expect(screen.getByText('4 / 5')).toBeInTheDocument(); // Total score
  });

  it('shows personality result when provided', () => {
    const personalityResult = {
      type: 'The Analytical Mind',
      description: 'You approach problems with logic and careful analysis.',
      traits: ['Logical', 'Methodical', 'Detail-oriented'],
    };

    render(<QuizResults {...defaultProps} personalityResult={personalityResult} />);

    expect(screen.getByText('Your Result: The Analytical Mind')).toBeInTheDocument();
    expect(screen.getByText('You approach problems with logic and careful analysis.')).toBeInTheDocument();
    expect(screen.getByText('Logical')).toBeInTheDocument();
    expect(screen.getByText('Methodical')).toBeInTheDocument();
    expect(screen.getByText('Detail-oriented')).toBeInTheDocument();
  });

  it('renders share bar component', () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByTestId('share-bar')).toBeInTheDocument();
    expect(screen.getByText(/I just scored 80% on "Test Quiz"!/)).toBeInTheDocument();
  });

  it('shows review answers section when enabled', async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} showDetailedAnswers={true} />);

    expect(screen.getByText('Review Answers')).toBeInTheDocument();
    expect(screen.getByText('Show Details')).toBeInTheDocument();

    // Click to show details
    await user.click(screen.getByText('Show Details'));

    expect(screen.getByText('Hide Details')).toBeInTheDocument();
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.getByText('The sky is blue.')).toBeInTheDocument();
    expect(screen.getByText('Capital of France?')).toBeInTheDocument();
  });

  it('hides review answers when showDetailedAnswers is false', () => {
    render(<QuizResults {...defaultProps} showDetailedAnswers={false} />);

    expect(screen.queryByText('Review Answers')).not.toBeInTheDocument();
  });

  it('shows correct and incorrect answers in review', async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} showDetailedAnswers={true} />);

    await user.click(screen.getByText('Show Details'));

    // Check correct answer (question 1)
    const correctAnswers = screen.getAllByText('Correct');
    expect(correctAnswers).toHaveLength(2); // Questions 1 and 3 are correct

    // Check incorrect answer (question 2)
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  it('displays user answers vs correct answers', async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} showDetailedAnswers={true} />);

    await user.click(screen.getByText('Show Details'));

    // For the incorrect answer (question 2)
    expect(screen.getByText('False')).toBeInTheDocument(); // User's wrong answer
    expect(screen.getByText('True')).toBeInTheDocument(); // Correct answer
  });

  it('shows explanations when available', async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} showDetailedAnswers={true} />);

    await user.click(screen.getByText('Show Details'));

    expect(screen.getByText('Basic arithmetic')).toBeInTheDocument();
    expect(screen.getByText('The sky appears blue due to light scattering')).toBeInTheDocument();
    expect(screen.getByText('Paris is the capital city of France')).toBeInTheDocument();
  });

  it('displays point values for each question', async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} showDetailedAnswers={true} />);

    await user.click(screen.getByText('Show Details'));

    expect(screen.getByText('2 points')).toBeInTheDocument(); // Questions 1 and 3
    expect(screen.getByText('1 point')).toBeInTheDocument(); // Question 2
  });

  it('calls onRetake when retake button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} />);

    await user.click(screen.getByText('Retake Quiz'));

    expect(mockOnRetake).toHaveBeenCalled();
  });

  it('calls onShare when share button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} />);

    await user.click(screen.getByText('Share Results'));

    expect(mockOnShare).toHaveBeenCalledWith('general');
  });

  it('handles array answers correctly', async () => {
    const user = userEvent.setup();
    const arrayAnswerResult = {
      ...mockResult,
      answers: [
        { questionId: 'q1', answer: ['A', 'B', 'C'], timeSpent: 30, isCorrect: true },
        { questionId: 'q2', answer: 'False', timeSpent: 45, isCorrect: false },
        { questionId: 'q3', answer: 'Paris', timeSpent: 50, isCorrect: true },
      ],
      questions: [
        {
          ...mockQuestions[0],
          type: 'ranking' as const,
          correctAnswer: ['A', 'B', 'C'],
        },
        ...mockQuestions.slice(1),
      ],
    };

    render(<QuizResults {...defaultProps} result={arrayAnswerResult} showDetailedAnswers={true} />);

    await user.click(screen.getByText('Show Details'));

    expect(screen.getByText('A, B, C')).toBeInTheDocument(); // User's array answer
  });

  it('handles missing user answers', async () => {
    const user = userEvent.setup();
    const missingAnswerResult = {
      ...mockResult,
      answers: [
        { questionId: 'q1', answer: '', timeSpent: 30, isCorrect: false },
        { questionId: 'q2', answer: 'False', timeSpent: 45, isCorrect: false },
        { questionId: 'q3', answer: 'Paris', timeSpent: 50, isCorrect: true },
      ],
    };

    render(<QuizResults {...defaultProps} result={missingAnswerResult} showDetailedAnswers={true} />);

    await user.click(screen.getByText('Show Details'));

    expect(screen.getByText('No answer')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<QuizResults {...defaultProps} className="custom-class" />);

    const quizResults = screen.getByText('Quiz Complete!').closest('.quiz-results');
    expect(quizResults).toHaveClass('custom-class');
  });

  it('shows trophy icon with correct color for high scores', () => {
    const highScoreResult = { ...mockResult, percentage: 85 };
    render(<QuizResults {...defaultProps} result={highScoreResult} />);

    // Trophy should be golden for high scores (≥80%)
    const trophyContainer = screen.getByText('Quiz Complete!').parentElement?.querySelector('.w-20.h-20');
    expect(trophyContainer).toBeInTheDocument();
  });

  it('shows correct circular progress styling', () => {
    render(<QuizResults {...defaultProps} />);

    // Check that SVG elements for circular progress are present
    const circles = document.querySelectorAll('circle');
    expect(circles).toHaveLength(2); // Background circle and progress circle
  });

  it('calculates statistics correctly', () => {
    const result = {
      score: 7,
      totalPoints: 10,
      percentage: 70,
      timeSpent: 180, // 3 minutes
      answers: [
        { questionId: 'q1', answer: 'A', timeSpent: 60, isCorrect: true },
        { questionId: 'q2', answer: 'B', timeSpent: 60, isCorrect: false },
        { questionId: 'q3', answer: 'C', timeSpent: 60, isCorrect: true },
      ],
      questions: mockQuestions,
    };

    render(<QuizResults {...defaultProps} result={result} />);

    expect(screen.getByText('2/3')).toBeInTheDocument(); // 2 correct out of 3
    expect(screen.getByText('7')).toBeInTheDocument(); // Score
    expect(screen.getByText('3:00')).toBeInTheDocument(); // 3 minutes
    expect(screen.getByText('60s')).toBeInTheDocument(); // Average time per question
  });
});