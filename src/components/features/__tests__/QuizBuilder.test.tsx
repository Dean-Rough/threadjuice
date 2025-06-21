/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizBuilder, type QuizBuilderProps } from '../QuizBuilder';

describe('QuizBuilder', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  const mockPersonas = [
    { id: 'persona-1', name: 'The Snarky Sage' },
    { id: 'persona-2', name: 'The Down-to-Earth Buddy' },
  ];

  const defaultProps: QuizBuilderProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    personas: mockPersonas,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders quiz builder with basic form fields', () => {
    render(<QuizBuilder {...defaultProps} />);

    expect(screen.getByText('Create New Quiz')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText('Add Question')).toBeInTheDocument();
  });

  it('shows edit mode when initialQuiz is provided', () => {
    const initialQuiz = {
      id: 'quiz-1',
      title: 'Existing Quiz',
      description: 'Test quiz',
      category: 'viral' as const,
      difficulty: 'hard' as const,
      timeLimit: 600,
      questions: [],
      isPublished: true,
    };

    render(<QuizBuilder {...defaultProps} initialQuiz={initialQuiz} />);

    expect(screen.getByText('Edit Quiz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Quiz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test quiz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('600')).toBeInTheDocument();
  });

  it('updates quiz title', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'New Quiz Title');

    expect(titleInput).toHaveValue('New Quiz Title');
  });

  it('updates quiz category', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, 'drama');

    expect(categorySelect).toHaveValue('drama');
  });

  it('updates quiz difficulty', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    const difficultySelect = screen.getByLabelText(/difficulty/i);
    await user.selectOptions(difficultySelect, 'hard');

    expect(difficultySelect).toHaveValue('hard');
  });

  it('updates time limit', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    const timeLimitInput = screen.getByLabelText(/time limit/i);
    await user.clear(timeLimitInput);
    await user.type(timeLimitInput, '600');

    expect(timeLimitInput).toHaveValue(600);
  });

  it('shows personas dropdown when personas are provided', () => {
    render(<QuizBuilder {...defaultProps} />);

    const personaSelect = screen.getByLabelText(/persona/i);
    expect(personaSelect).toBeInTheDocument();

    expect(screen.getByText('The Snarky Sage')).toBeInTheDocument();
    expect(screen.getByText('The Down-to-Earth Buddy')).toBeInTheDocument();
  });

  it('hides personas dropdown when no personas provided', () => {
    render(<QuizBuilder {...defaultProps} personas={[]} />);

    expect(screen.queryByLabelText(/persona/i)).not.toBeInTheDocument();
  });

  it('adds a new question', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    expect(screen.getByText('Questions (0/20)')).toBeInTheDocument();

    const addButton = screen.getByText('Add Question');
    await user.click(addButton);

    expect(screen.getByText('Questions (1/20)')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('expands question editor when question is added', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    const addButton = screen.getByText('Add Question');
    await user.click(addButton);

    // Question editor should be expanded by default for new questions
    expect(screen.getByLabelText(/question type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/question \*/i)).toBeInTheDocument();
  });

  it('disables add question button when limit reached', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add 20 questions to reach the limit
    const addButton = screen.getByText('Add Question');
    for (let i = 0; i < 20; i++) {
      await user.click(addButton);
    }

    expect(screen.getByText('Questions (20/20)')).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });

  it('removes a question', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add a question first
    const addButton = screen.getByText('Add Question');
    await user.click(addButton);

    expect(screen.getByText('Questions (1/20)')).toBeInTheDocument();

    // Remove the question
    const deleteButton = screen.getByTitle('Delete question');
    await user.click(deleteButton);

    expect(screen.getByText('Questions (0/20)')).toBeInTheDocument();
  });

  it('updates question content', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add a question
    await user.click(screen.getByText('Add Question'));

    // Update question text
    const questionInput = screen.getByLabelText(/question \*/i);
    await user.clear(questionInput);
    await user.type(questionInput, 'What is the answer?');

    expect(questionInput).toHaveValue('What is the answer?');
  });

  it('adds options to a question', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add a question
    await user.click(screen.getByText('Add Question'));

    // Initially should have 2 options
    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(2);

    // Add another option
    await user.click(screen.getByText('+ Add Option'));

    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(3);
  });

  it('removes options from a question (but not below minimum)', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add a question
    await user.click(screen.getByText('Add Question'));

    // Add a third option so we can test removal
    await user.click(screen.getByText('+ Add Option'));
    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(3);

    // Remove an option
    const deleteButtons = screen
      .getAllByTitle(/delete/i)
      .filter(btn => btn.closest('[class*="space-x-2"]'));
    await user.click(deleteButtons[0]);

    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(2);
  });

  it('does not allow removing options below minimum (2)', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add a question
    await user.click(screen.getByText('Add Question'));

    // Should have 2 options and no delete buttons (minimum reached)
    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(2);

    // Check that delete buttons for options are not present when at minimum
    const optionDeleteButtons = screen
      .queryAllByTitle(/delete/i)
      .filter(
        btn =>
          btn.closest('[class*="space-x-2"]') &&
          btn
            .closest('[class*="space-x-2"]')
            ?.querySelector('input[placeholder*="Option"]')
      );
    expect(optionDeleteButtons).toHaveLength(0);
  });

  it('limits options to maximum of 6', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add a question
    await user.click(screen.getByText('Add Question'));

    // Add options up to the limit
    const addOptionButton = screen.getByText('+ Add Option');
    await user.click(addOptionButton); // 3 options
    await user.click(addOptionButton); // 4 options
    await user.click(addOptionButton); // 5 options
    await user.click(addOptionButton); // 6 options

    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(6);
    expect(screen.queryByText('+ Add Option')).not.toBeInTheDocument();
  });

  it('moves questions up and down', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add two questions
    await user.click(screen.getByText('Add Question'));
    await user.click(screen.getByText('Add Question'));

    // Update the questions with different text to distinguish them
    const questionInputs = screen.getAllByLabelText(/question \*/i);
    await user.clear(questionInputs[0]);
    await user.type(questionInputs[0], 'First question');

    // Collapse first question to see the second one
    const editButtons = screen.getAllByTitle(/edit/i);
    await user.click(editButtons[0]);

    await user.clear(questionInputs[1]);
    await user.type(questionInputs[1], 'Second question');

    // Check for move buttons (they should exist based on position)
    // The first question should have a "move down" button, second should have "move up"
    expect(screen.getByTitle('Move down')).toBeInTheDocument();
    expect(screen.getByTitle('Move up')).toBeInTheDocument();
  });

  it('validates form before allowing save', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Save button should be disabled initially (no title, no questions)
    const saveButton = screen.getByText('Save Quiz');
    expect(saveButton).toBeDisabled();

    // Add title
    await user.type(screen.getByLabelText(/title/i), 'Test Quiz');
    expect(saveButton).toBeDisabled(); // Still disabled (no questions)

    // Add insufficient questions (need at least 3)
    await user.click(screen.getByText('Add Question'));
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByText('Add Question'));
    expect(saveButton).toBeDisabled();

    // Add third question
    await user.click(screen.getByText('Add Question'));

    // Fill in question details for all questions
    const questionInputs = screen.getAllByLabelText(/question \*/i);
    for (let i = 0; i < questionInputs.length; i++) {
      await user.clear(questionInputs[i]);
      await user.type(questionInputs[i], `Question ${i + 1}?`);

      // Set correct answer for each question
      const correctAnswerSelects = screen.getAllByLabelText(/correct answer/i);
      await user.selectOptions(
        correctAnswerSelects[i],
        questionInputs[i]
          .closest('[class*="space-y-4"]')
          ?.querySelector('input[placeholder="Option 1"]')
          ?.getAttribute('value') || ''
      );
    }

    expect(saveButton).not.toBeDisabled();
  });

  it('calls onSave with quiz data', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Fill in quiz details
    await user.type(screen.getByLabelText(/title/i), 'Test Quiz');
    await user.type(screen.getByLabelText(/description/i), 'Test description');
    await user.selectOptions(screen.getByLabelText(/category/i), 'drama');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'hard');
    await user.type(screen.getByLabelText(/time limit/i), '600');

    // Add minimum questions
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByText('Add Question'));

      const questionInputs = screen.getAllByLabelText(/question \*/i);
      await user.clear(questionInputs[i]);
      await user.type(questionInputs[i], `Question ${i + 1}?`);

      // Fill in options
      const optionInputs = screen.getAllByPlaceholderText(/option/i);
      const questionOptions = Array.from(optionInputs).slice(
        i * 2,
        (i + 1) * 2
      );
      await user.clear(questionOptions[0]);
      await user.type(questionOptions[0], `Option A for Q${i + 1}`);
      await user.clear(questionOptions[1]);
      await user.type(questionOptions[1], `Option B for Q${i + 1}`);

      // Set correct answer
      const correctAnswerSelects = screen.getAllByLabelText(/correct answer/i);
      await user.selectOptions(
        correctAnswerSelects[i],
        `Option A for Q${i + 1}`
      );
    }

    // Check publish checkbox
    await user.click(screen.getByLabelText(/publish immediately/i));

    // Save quiz
    const saveButton = screen.getByText('Save Quiz');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Quiz',
        description: 'Test description',
        category: 'drama',
        difficulty: 'hard',
        timeLimit: 600,
        isPublished: true,
        questions: expect.arrayContaining([
          expect.objectContaining({
            question: 'Question 1?',
            type: 'multiple-choice',
            options: ['Option A for Q1', 'Option B for Q1'],
            correctAnswer: 'Option A for Q1',
            points: 1,
          }),
        ]),
      });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    await user.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during save', async () => {
    const user = userEvent.setup();
    const slowOnSave = jest.fn(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<QuizBuilder {...defaultProps} onSave={slowOnSave} />);

    // Set up valid quiz
    await user.type(screen.getByLabelText(/title/i), 'Test Quiz');

    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByText('Add Question'));
      const questionInputs = screen.getAllByLabelText(/question \*/i);
      await user.clear(questionInputs[i]);
      await user.type(questionInputs[i], `Question ${i + 1}?`);
    }

    const saveButton = screen.getByText('Save Quiz');
    await user.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });
  });

  it('handles different question types', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add a question
    await user.click(screen.getByText('Add Question'));

    // The question should be expanded by default, check for the select element
    const questionTypeSelect = screen.getByLabelText(/question type/i);
    expect(questionTypeSelect).toHaveValue('multiple-choice');

    // Change to true-false
    await user.selectOptions(questionTypeSelect, 'true-false');
    expect(questionTypeSelect).toHaveValue('true-false');

    // Change to ranking
    await user.selectOptions(questionTypeSelect, 'ranking');
    expect(questionTypeSelect).toHaveValue('ranking');
  });

  it('validates points range', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    // Add a question
    await user.click(screen.getByText('Add Question'));

    const pointsInput = screen.getByLabelText(/points/i);

    // Test minimum value
    await user.clear(pointsInput);
    await user.type(pointsInput, '0');
    // Should default back to 1 due to min constraint
    expect(pointsInput).toHaveAttribute('min', '1');

    // Test maximum value
    await user.clear(pointsInput);
    await user.type(pointsInput, '15');
    expect(pointsInput).toHaveAttribute('max', '10');
  });

  it('shows empty state when no questions', () => {
    render(<QuizBuilder {...defaultProps} />);

    expect(
      screen.getByText('No questions yet. Click "Add Question" to get started.')
    ).toBeInTheDocument();
  });

  it('displays question count correctly', async () => {
    const user = userEvent.setup();
    render(<QuizBuilder {...defaultProps} />);

    expect(screen.getByText('Questions (0/20)')).toBeInTheDocument();

    await user.click(screen.getByText('Add Question'));
    expect(screen.getByText('Questions (1/20)')).toBeInTheDocument();

    await user.click(screen.getByText('Add Question'));
    expect(screen.getByText('Questions (2/20)')).toBeInTheDocument();
  });

  it('handles custom className', () => {
    render(<QuizBuilder {...defaultProps} className='custom-class' />);

    const quizBuilder = screen
      .getByText('Create New Quiz')
      .closest('.quiz-builder');
    expect(quizBuilder).toHaveClass('custom-class');
  });
});
