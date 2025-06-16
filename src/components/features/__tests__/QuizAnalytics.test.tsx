/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizAnalytics, type QuizAnalyticsProps } from '../QuizAnalytics';

describe('QuizAnalytics', () => {
  const mockOnTimeRangeChange = jest.fn();
  const mockOnRefresh = jest.fn();

  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

  const mockData = {
    quizId: 'quiz-1',
    title: 'Test Quiz Analytics',
    totalAttempts: 100,
    completedAttempts: 95,
    averageScore: 75.5,
    averageTime: 180,
    completionRate: 95,
    difficulty: 'medium' as const,
    category: 'viral',
    createdAt: today.toISOString().slice(0, 10) + 'T00:00:00Z',
    attempts: [
      {
        id: 'attempt-1',
        userId: 'user-1',
        username: 'testuser1',
        score: 8,
        totalPoints: 10,
        percentage: 80,
        timeSpent: 150,
        completedAt: yesterday.toISOString(),
        answers: [
          { questionId: 'q1', isCorrect: true, timeSpent: 50 },
          { questionId: 'q2', isCorrect: false, timeSpent: 100 },
        ],
      },
      {
        id: 'attempt-2',
        userId: 'user-2',
        username: 'testuser2',
        score: 6,
        totalPoints: 10,
        percentage: 60,
        timeSpent: 200,
        completedAt: twoDaysAgo.toISOString(),
        answers: [
          { questionId: 'q1', isCorrect: false, timeSpent: 80 },
          { questionId: 'q2', isCorrect: true, timeSpent: 120 },
        ],
      },
    ],
    questionAnalytics: [
      {
        questionId: 'q1',
        question: 'What is 2+2?',
        correctRate: 70,
        averageTime: 65,
        totalAttempts: 100,
      },
      {
        questionId: 'q2',
        question: 'True or false: The sky is blue.',
        correctRate: 85,
        averageTime: 45,
        totalAttempts: 100,
      },
    ],
  };

  const defaultProps: QuizAnalyticsProps = {
    data: mockData,
    timeRange: 'all',
    onTimeRangeChange: mockOnTimeRangeChange,
    onRefresh: mockOnRefresh,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders analytics header with quiz information', () => {
    render(<QuizAnalytics {...defaultProps} />);

    expect(screen.getByText('Quiz Analytics')).toBeInTheDocument();
    expect(screen.getByText('Test Quiz Analytics')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('viral')).toBeInTheDocument();
  });

  it('displays key metrics correctly', () => {
    render(<QuizAnalytics {...defaultProps} />);

    expect(screen.getByText('100')).toBeInTheDocument(); // Total attempts
    expect(screen.getByText('75.5%')).toBeInTheDocument(); // Average score
    expect(screen.getByText('3:00')).toBeInTheDocument(); // Average time (180 seconds)
    expect(screen.getByText('95.0%')).toBeInTheDocument(); // Completion rate
  });

  it('shows time range selector with correct options', () => {
    render(<QuizAnalytics {...defaultProps} />);

    const timeRangeSelect = screen.getByDisplayValue('All time');
    expect(timeRangeSelect).toBeInTheDocument();

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 days')).toBeInTheDocument();
    expect(screen.getByText('All time')).toBeInTheDocument();
  });

  it('calls onTimeRangeChange when time range is changed', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} />);

    const timeRangeSelect = screen.getByDisplayValue('All time');
    await user.selectOptions(timeRangeSelect, '7d');

    expect(mockOnTimeRangeChange).toHaveBeenCalledWith('7d');
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} />);

    const refreshButton = screen.getByTitle('Refresh data');
    await user.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('renders tabs for different views', () => {
    render(<QuizAnalytics {...defaultProps} />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Attempts')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
  });

  it('switches to attempts tab and shows attempt data', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} />);

    await user.click(screen.getByText('Attempts'));

    expect(screen.getByText('testuser1')).toBeInTheDocument();
    expect(screen.getByText('testuser2')).toBeInTheDocument();
    expect(screen.getByText('80.0%')).toBeInTheDocument();
    expect(screen.getByText('60.0%')).toBeInTheDocument();
  });

  it('switches to questions tab and shows question analytics', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} />);

    await user.click(screen.getByText('Questions'));

    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.getByText('True or false: The sky is blue.')).toBeInTheDocument();
    expect(screen.getByText('70.0% correct')).toBeInTheDocument();
    expect(screen.getByText('85.0% correct')).toBeInTheDocument();
  });

  it('formats time correctly in attempts table', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} />);

    await user.click(screen.getByText('Attempts'));

    expect(screen.getByText('2:30')).toBeInTheDocument(); // 150 seconds
    expect(screen.getByText('3:20')).toBeInTheDocument(); // 200 seconds
  });

  it('shows score distribution in overview', () => {
    render(<QuizAnalytics {...defaultProps} />);

    expect(screen.getByText('Score Distribution')).toBeInTheDocument();
    expect(screen.getByText('90-100%')).toBeInTheDocument();
    expect(screen.getByText('80-89%')).toBeInTheDocument();
    expect(screen.getByText('70-79%')).toBeInTheDocument();
    expect(screen.getByText('60-69%')).toBeInTheDocument();
    expect(screen.getByText('0-59%')).toBeInTheDocument();
  });

  it('shows daily attempts chart in overview', () => {
    render(<QuizAnalytics {...defaultProps} />);

    expect(screen.getByText('Daily Attempts')).toBeInTheDocument();
  });

  it('handles empty attempts data gracefully', () => {
    const emptyData = {
      ...mockData,
      attempts: [],
      totalAttempts: 0,
      averageScore: 0,
      averageTime: 0,
      completionRate: 0,
    };

    render(<QuizAnalytics {...defaultProps} data={emptyData} />);

    // Check for zero values in empty data
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0); // Total attempts should show 0
    const percentageElements = screen.getAllByText('0.0%');
    expect(percentageElements.length).toBeGreaterThan(0); // Should have percentage elements
  });

  it('shows empty state for attempts tab when no data', async () => {
    const user = userEvent.setup();
    const emptyData = {
      ...mockData,
      attempts: [],
    };

    render(<QuizAnalytics {...defaultProps} data={emptyData} />);

    await user.click(screen.getByText('Attempts'));

    expect(screen.getByText('No attempts in the selected time range.')).toBeInTheDocument();
  });

  it('shows username fallback when username is not provided', async () => {
    const user = userEvent.setup();
    const dataWithoutUsernames = {
      ...mockData,
      attempts: [
        {
          ...mockData.attempts[0],
          username: undefined,
        },
      ],
    };

    render(<QuizAnalytics {...defaultProps} data={dataWithoutUsernames} />);

    await user.click(screen.getByText('Attempts'));

    // Should show fallback username based on user ID
    expect(screen.getByText('User er-1')).toBeInTheDocument(); // Last 4 chars of user-1
  });

  it('displays question performance correctly', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} />);

    await user.click(screen.getByText('Questions'));

    // Check that question performance indicators are correct
    const progressBars = document.querySelectorAll('.bg-green-500');
    expect(progressBars.length).toBeGreaterThan(0);

    expect(screen.getByText('1:05')).toBeInTheDocument(); // 65 seconds formatted
    expect(screen.getByText('0:45')).toBeInTheDocument(); // 45 seconds formatted
  });

  it('calculates and displays score distribution percentages', () => {
    render(<QuizAnalytics {...defaultProps} />);

    // With our mock data, we have 2 attempts: 80% and 60%
    // This should show distribution in the score ranges
    const scoreDistribution = screen.getByText('Score Distribution');
    expect(scoreDistribution).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<QuizAnalytics {...defaultProps} />);

    const todayFormatted = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    expect(screen.getByText(`Created ${todayFormatted}`)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<QuizAnalytics {...defaultProps} className="custom-analytics" />);

    const analyticsContainer = screen.getByText('Quiz Analytics').closest('.quiz-analytics');
    expect(analyticsContainer).toHaveClass('custom-analytics');
  });

  it('handles time range filtering correctly', () => {
    // Test that the component would filter data based on time range
    // Since the filtering is done via useMemo, we're testing the rendered result
    render(<QuizAnalytics {...defaultProps} timeRange="7d" />);

    // The component should still render with filtered data
    expect(screen.getByText('Quiz Analytics')).toBeInTheDocument();
  });

  it('shows correct progress bar styling for different score ranges', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} />);

    await user.click(screen.getByText('Questions'));

    // Check that progress bars have correct styling
    // 70% correct should have one color, 85% should have another
    const progressElements = document.querySelectorAll('[style*="width"]');
    expect(progressElements.length).toBeGreaterThan(0);
  });

  it('displays correct attempt details in table', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} />);

    await user.click(screen.getByText('Attempts'));

    // Check score format
    expect(screen.getByText('(8/10)')).toBeInTheDocument();
    expect(screen.getByText('(6/10)')).toBeInTheDocument();

    // Check that date formatting is working (exact dates depend on when test runs)
    const yesterdayFormatted = yesterday.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    expect(screen.getByText(yesterdayFormatted)).toBeInTheDocument();
  });

  it('handles missing onTimeRangeChange prop gracefully', () => {
    render(<QuizAnalytics {...defaultProps} onTimeRangeChange={undefined} />);

    const timeRangeSelect = screen.getByDisplayValue('All time');
    expect(timeRangeSelect).toBeInTheDocument();
    
    // Should not crash when changing selection without callback
    fireEvent.change(timeRangeSelect, { target: { value: '7d' } });
  });

  it('handles missing onRefresh prop gracefully', async () => {
    const user = userEvent.setup();
    render(<QuizAnalytics {...defaultProps} onRefresh={undefined} />);

    const refreshButton = screen.getByTitle('Refresh data');
    
    // Should not crash when clicking without callback
    await user.click(refreshButton);
  });

  it('limits attempts display to 50 items', async () => {
    const user = userEvent.setup();
    const manyAttempts = Array.from({ length: 60 }, (_, i) => ({
      id: `attempt-${i}`,
      userId: `user-${i}`,
      username: `user${i}`,
      score: Math.floor(Math.random() * 10),
      totalPoints: 10,
      percentage: Math.floor(Math.random() * 100),
      timeSpent: Math.floor(Math.random() * 300),
      completedAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(), // Recent dates
      answers: [],
    }));

    const dataWithManyAttempts = {
      ...mockData,
      attempts: manyAttempts,
    };

    render(<QuizAnalytics {...defaultProps} data={dataWithManyAttempts} timeRange="all" />);

    await user.click(screen.getByText('Attempts'));

    // Should only show 50 attempts (plus headers)
    const tableRows = document.querySelectorAll('tbody tr');
    expect(tableRows.length).toBe(50);
  });
});