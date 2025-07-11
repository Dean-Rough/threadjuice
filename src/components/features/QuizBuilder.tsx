'use client';

import { useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Clock,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Edit3,
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'ranking';
  question: string;
  options: string[];
  correctAnswer: string | number | string[];
  explanation?: string;
  points: number;
}

interface Quiz {
  id?: string;
  title: string;
  description?: string;
  category: 'viral' | 'trending' | 'chaos' | 'wholesome' | 'drama';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  questions: QuizQuestion[];
  isPublished: boolean;
  personaId?: string;
}

export interface QuizBuilderProps {
  initialQuiz?: Quiz;
  onSave: (quiz: Quiz) => Promise<void>;
  onCancel: () => void;
  personas?: Array<{ id: string; name: string }>;
  className?: string;
}

export function QuizBuilder({
  initialQuiz,
  onSave,
  onCancel,
  personas = [],
  className = '',
}: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<Quiz>(
    initialQuiz || {
      title: '',
      description: '',
      category: 'viral',
      difficulty: 'medium',
      timeLimit: 300,
      questions: [],
      isPublished: false,
    }
  );

  const [saving, setSaving] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const addQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: 'multiple-choice',
      question: '',
      options: ['', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));

    setExpandedQuestion(newQuestion.id);
  }, []);

  const updateQuestion = useCallback(
    (questionId: string, updates: Partial<QuizQuestion>) => {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.map(q =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      }));
    },
    []
  );

  const removeQuestion = useCallback((questionId: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
  }, []);

  const moveQuestion = useCallback(
    (questionId: string, direction: 'up' | 'down') => {
      setQuiz(prev => {
        const questions = [...prev.questions];
        const index = questions.findIndex(q => q.id === questionId);

        if (index === -1) return prev;

        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= questions.length) return prev;

        [questions[index], questions[newIndex]] = [
          questions[newIndex],
          questions[index],
        ];

        return { ...prev, questions };
      });
    },
    []
  );

  const addOption = useCallback(
    (questionId: string) => {
      updateQuestion(questionId, {
        options: [
          ...(quiz.questions.find(q => q.id === questionId)?.options || []),
          '',
        ],
      });
    },
    [quiz.questions, updateQuestion]
  );

  const updateOption = useCallback(
    (questionId: string, optionIndex: number, value: string) => {
      const question = quiz.questions.find(q => q.id === questionId);
      if (!question) return;

      const newOptions = [...question.options];
      newOptions[optionIndex] = value;

      updateQuestion(questionId, { options: newOptions });
    },
    [quiz.questions, updateQuestion]
  );

  const removeOption = useCallback(
    (questionId: string, optionIndex: number) => {
      const question = quiz.questions.find(q => q.id === questionId);
      if (!question || question.options.length <= 2) return;

      const newOptions = question.options.filter(
        (_, index) => index !== optionIndex
      );
      updateQuestion(questionId, { options: newOptions });
    },
    [quiz.questions, updateQuestion]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(quiz);
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  const isValidQuiz =
    quiz.title.trim() &&
    quiz.questions.length >= 3 &&
    quiz.questions.every(
      q => q.question.trim() && q.options.length >= 2 && q.correctAnswer
    );

  return (
    <div
      className={`quiz-builder mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className='mb-8'>
        <h2 className='mb-2 text-2xl font-bold text-gray-900'>
          {initialQuiz ? 'Edit Quiz' : 'Create New Quiz'}
        </h2>
        <p className='text-gray-600'>
          Build an interactive quiz with multiple question types and automated
          scoring.
        </p>
      </div>

      {/* Basic Info */}
      <div className='mb-8 rounded-lg bg-gray-50 p-6'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Quiz Details
        </h3>

        <div className='mb-4 grid gap-4 md:grid-cols-2'>
          <div>
            <label
              htmlFor='quiz-title'
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Title *
            </label>
            <input
              id='quiz-title'
              type='text'
              value={quiz.title}
              onChange={e =>
                setQuiz(prev => ({ ...prev, title: e.target.value }))
              }
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
              placeholder='Enter quiz title...'
              maxLength={200}
            />
          </div>

          <div>
            <label
              htmlFor='quiz-category'
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Category *
            </label>
            <select
              id='quiz-category'
              value={quiz.category}
              onChange={e =>
                setQuiz(prev => ({
                  ...prev,
                  category: e.target.value as Quiz['category'],
                }))
              }
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
            >
              <option value='viral'>Viral</option>
              <option value='trending'>Trending</option>
              <option value='chaos'>Chaos</option>
              <option value='wholesome'>Wholesome</option>
              <option value='drama'>Drama</option>
            </select>
          </div>
        </div>

        <div className='mb-4 grid gap-4 md:grid-cols-3'>
          <div>
            <label
              htmlFor='quiz-difficulty'
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Difficulty
            </label>
            <select
              id='quiz-difficulty'
              value={quiz.difficulty}
              onChange={e =>
                setQuiz(prev => ({
                  ...prev,
                  difficulty: e.target.value as Quiz['difficulty'],
                }))
              }
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
            >
              <option value='easy'>Easy</option>
              <option value='medium'>Medium</option>
              <option value='hard'>Hard</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='quiz-time-limit'
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Time Limit (seconds)
            </label>
            <input
              id='quiz-time-limit'
              type='number'
              value={quiz.timeLimit || ''}
              onChange={e =>
                setQuiz(prev => ({
                  ...prev,
                  timeLimit: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                }))
              }
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
              placeholder='300'
              min={30}
              max={1800}
            />
          </div>

          {personas.length > 0 && (
            <div>
              <label
                htmlFor='quiz-persona'
                className='mb-2 block text-sm font-medium text-gray-700'
              >
                Persona (Optional)
              </label>
              <select
                id='quiz-persona'
                value={quiz.personaId || ''}
                onChange={e =>
                  setQuiz(prev => ({
                    ...prev,
                    personaId: e.target.value || undefined,
                  }))
                }
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
              >
                <option value=''>No persona</option>
                {personas.map(persona => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor='quiz-description'
            className='mb-2 block text-sm font-medium text-gray-700'
          >
            Description
          </label>
          <textarea
            id='quiz-description'
            value={quiz.description || ''}
            onChange={e =>
              setQuiz(prev => ({ ...prev, description: e.target.value }))
            }
            className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
            rows={3}
            placeholder='Describe what this quiz is about...'
            maxLength={1000}
          />
        </div>
      </div>

      {/* Questions */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Questions ({quiz.questions.length}/20)
          </h3>
          <button
            onClick={addQuestion}
            disabled={quiz.questions.length >= 20}
            className='flex items-center rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Question
          </button>
        </div>

        <div className='space-y-4'>
          {quiz.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              isExpanded={expandedQuestion === question.id}
              onToggleExpand={() =>
                setExpandedQuestion(
                  expandedQuestion === question.id ? null : question.id
                )
              }
              onUpdate={updates => updateQuestion(question.id, updates)}
              onRemove={() => removeQuestion(question.id)}
              onMoveUp={
                index > 0 ? () => moveQuestion(question.id, 'up') : undefined
              }
              onMoveDown={
                index < quiz.questions.length - 1
                  ? () => moveQuestion(question.id, 'down')
                  : undefined
              }
              onAddOption={() => addOption(question.id)}
              onUpdateOption={(optionIndex, value) =>
                updateOption(question.id, optionIndex, value)
              }
              onRemoveOption={optionIndex =>
                removeOption(question.id, optionIndex)
              }
            />
          ))}
        </div>

        {quiz.questions.length === 0 && (
          <div className='py-12 text-center text-gray-500'>
            <HelpCircle className='mx-auto mb-4 h-12 w-12 opacity-50' />
            <p>
              No questions yet. Click &quot;Add Question&quot; to get started.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className='flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row'>
        <div className='flex items-center space-x-4'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={quiz.isPublished}
              onChange={e =>
                setQuiz(prev => ({ ...prev, isPublished: e.target.checked }))
              }
              className='mr-2 rounded'
            />
            <span className='text-sm text-gray-700'>Publish immediately</span>
          </label>

          {quiz.timeLimit && (
            <div className='flex items-center text-sm text-gray-500'>
              <Clock className='mr-1 h-4 w-4' />
              {Math.floor(quiz.timeLimit / 60)}:
              {(quiz.timeLimit % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        <div className='flex items-center space-x-3'>
          <button
            onClick={onCancel}
            className='rounded-md border border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-50'
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={!isValidQuiz || saving}
            className='flex items-center rounded-md bg-orange-600 px-6 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Save className='mr-2 h-4 w-4' />
            {saving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Question Editor Component
interface QuestionEditorProps {
  question: QuizQuestion;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, value: string) => void;
  onRemoveOption: (index: number) => void;
}

function QuestionEditor({
  question,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: QuestionEditorProps) {
  return (
    <div className='rounded-lg border border-gray-200'>
      {/* Question Header */}
      <div className='border-b bg-gray-50 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <span className='text-sm font-medium text-gray-500'>
              #{index + 1}
            </span>
            <h4 className='font-medium text-gray-900'>
              {question.question || 'Untitled Question'}
            </h4>
            <span className='rounded bg-orange-100 px-2 py-1 text-xs text-orange-800'>
              {question.type.replace('-', ' ')}
            </span>
          </div>

          <div className='flex items-center space-x-2'>
            {onMoveUp && (
              <button
                onClick={onMoveUp}
                className='p-1 text-gray-400 hover:text-gray-600'
                title='Move up'
              >
                <ChevronUp className='h-4 w-4' />
              </button>
            )}

            {onMoveDown && (
              <button
                onClick={onMoveDown}
                className='p-1 text-gray-400 hover:text-gray-600'
                title='Move down'
              >
                <ChevronDown className='h-4 w-4' />
              </button>
            )}

            <button
              onClick={onToggleExpand}
              className='p-1 text-gray-400 hover:text-gray-600'
            >
              <Edit3 className='h-4 w-4' />
            </button>

            <button
              onClick={onRemove}
              className='p-1 text-red-400 hover:text-red-600'
              title='Delete question'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Question Content (Expanded) */}
      {isExpanded && (
        <div className='space-y-4 p-4'>
          {/* Question Type */}
          <div>
            <label
              htmlFor={`question-${question.id}-type`}
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Question Type
            </label>
            <select
              id={`question-${question.id}-type`}
              value={question.type}
              onChange={e =>
                onUpdate({ type: e.target.value as QuizQuestion['type'] })
              }
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
            >
              <option value='multiple-choice'>Multiple Choice</option>
              <option value='true-false'>True/False</option>
              <option value='ranking'>Ranking</option>
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label
              htmlFor={`question-${question.id}-text`}
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Question *
            </label>
            <textarea
              id={`question-${question.id}-text`}
              value={question.question}
              onChange={e => onUpdate({ question: e.target.value })}
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
              rows={2}
              placeholder='Enter your question...'
              maxLength={500}
            />
          </div>

          {/* Options */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <label className='block text-sm font-medium text-gray-700'>
                Options *
              </label>
              {question.options.length < 6 && (
                <button
                  onClick={onAddOption}
                  className='text-sm text-orange-600 hover:text-orange-700'
                >
                  + Add Option
                </button>
              )}
            </div>

            <div className='space-y-2'>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className='flex items-center space-x-2'>
                  <span className='w-6 text-sm text-gray-500'>
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                  <input
                    type='text'
                    value={option}
                    onChange={e => onUpdateOption(optionIndex, e.target.value)}
                    className='flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  {question.options.length > 2 && (
                    <button
                      onClick={() => onRemoveOption(optionIndex)}
                      className='p-1 text-red-400 hover:text-red-600'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <label
                htmlFor={`question-${question.id}-correct`}
                className='mb-2 block text-sm font-medium text-gray-700'
              >
                Correct Answer *
              </label>
              {question.type === 'multiple-choice' && (
                <select
                  id={`question-${question.id}-correct`}
                  value={question.correctAnswer as string}
                  onChange={e => onUpdate({ correctAnswer: e.target.value })}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                >
                  <option value=''>Select correct answer...</option>
                  {question.options.map((option, index) => (
                    <option key={index} value={option}>
                      {String.fromCharCode(65 + index)}. {option}
                    </option>
                  ))}
                </select>
              )}

              {question.type === 'true-false' && (
                <select
                  id={`question-${question.id}-correct`}
                  value={question.correctAnswer as string}
                  onChange={e => onUpdate({ correctAnswer: e.target.value })}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                >
                  <option value=''>Select correct answer...</option>
                  <option value='True'>True</option>
                  <option value='False'>False</option>
                </select>
              )}
            </div>

            <div>
              <label
                htmlFor={`question-${question.id}-points`}
                className='mb-2 block text-sm font-medium text-gray-700'
              >
                Points
              </label>
              <input
                id={`question-${question.id}-points`}
                type='number'
                value={question.points}
                onChange={e =>
                  onUpdate({ points: parseInt(e.target.value) || 1 })
                }
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                min={1}
                max={10}
              />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label
              htmlFor={`question-${question.id}-explanation`}
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Explanation (Optional)
            </label>
            <textarea
              id={`question-${question.id}-explanation`}
              value={question.explanation || ''}
              onChange={e => onUpdate({ explanation: e.target.value })}
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
              rows={2}
              placeholder='Explain why this is the correct answer...'
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizBuilder;
