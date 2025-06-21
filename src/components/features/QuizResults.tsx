'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  Target,
  Clock,
  Share2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Users,
} from 'lucide-react';
import ShareBar from '@/components/ui/ShareBar';

interface QuizAnswer {
  questionId: string;
  answer: string | number | string[];
  timeSpent: number;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'ranking';
  question: string;
  options: string[];
  correctAnswer: string | number | string[];
  explanation?: string;
  points: number;
}

interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  answers: QuizAnswer[];
  questions: QuizQuestion[];
}

export interface QuizResultsProps {
  result: QuizResult;
  quizTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  onRetake: () => void;
  onShare?: (platform: string) => void;
  className?: string;
  showDetailedAnswers?: boolean;
  personalityResult?: {
    type: string;
    description: string;
    traits: string[];
  };
}

export function QuizResults({
  result,
  quizTitle,
  difficulty,
  category,
  onRetake,
  onShare,
  className = '',
  showDetailedAnswers = true,
  personalityResult,
}: QuizResultsProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [celebrationPlayed, setCelebrationPlayed] = useState(false);

  // Animate score counting up
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = result.percentage / steps;
      let current = 0;

      const animation = setInterval(() => {
        current += increment;
        if (current >= result.percentage) {
          current = result.percentage;
          clearInterval(animation);
        }
        setAnimatedScore(Math.round(current));
      }, duration / steps);

      return () => clearInterval(animation);
    }, 500); // Start after 500ms

    return () => clearTimeout(timer);
  }, [result.percentage]);

  // Trigger celebration for high scores
  useEffect(() => {
    if (result.percentage >= 80 && !celebrationPlayed) {
      setCelebrationPlayed(true);
      // You could add confetti or other celebration effects here
    }
  }, [result.percentage, celebrationPlayed]);

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
      return {
        level: 'Excellent',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    if (percentage >= 80)
      return { level: 'Great', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 70)
      return {
        level: 'Good',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      };
    if (percentage >= 60)
      return {
        level: 'Fair',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      };
    return {
      level: 'Needs Improvement',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    };
  };

  const performance = getPerformanceLevel(result.percentage);
  const correctAnswers = result.answers.filter(a => a.isCorrect).length;
  const avgTimePerQuestion = result.timeSpent / result.questions.length;

  return (
    <div
      className={`quiz-results mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className='mb-8 text-center'>
        <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100'>
          <Trophy
            className={`h-10 w-10 ${result.percentage >= 80 ? 'text-yellow-500' : 'text-orange-600'}`}
          />
        </div>

        <h2 className='mb-2 text-2xl font-bold text-gray-900'>
          Quiz Complete!
        </h2>
        <p className='text-gray-600'>{quizTitle}</p>

        <div className='mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500'>
          <span
            className={`rounded px-2 py-1 ${performance.bgColor} ${performance.color} font-medium`}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          <span>•</span>
          <span>{category}</span>
        </div>
      </div>

      {/* Score Display */}
      <div className='mb-8 rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 p-8 text-center'>
        <div className='relative'>
          {/* Circular Progress */}
          <div className='relative mx-auto mb-6 h-32 w-32'>
            <svg
              className='h-32 w-32 -rotate-90 transform'
              viewBox='0 0 120 120'
            >
              <circle
                cx='60'
                cy='60'
                r='54'
                fill='none'
                stroke='#e5e7eb'
                strokeWidth='8'
              />
              <circle
                cx='60'
                cy='60'
                r='54'
                fill='none'
                stroke={
                  result.percentage >= 80
                    ? '#10b981'
                    : result.percentage >= 60
                      ? '#f59e0b'
                      : '#ef4444'
                }
                strokeWidth='8'
                strokeLinecap='round'
                strokeDasharray={`${(animatedScore / 100) * 339.292} 339.292`}
                className='transition-all duration-1000 ease-out'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-3xl font-bold text-gray-900'>
                {animatedScore}%
              </span>
            </div>
          </div>

          <div
            className={`inline-block rounded-full px-4 py-2 ${performance.bgColor} ${performance.color} font-semibold`}
          >
            {performance.level}
          </div>
        </div>

        <div className='mt-8 grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='mb-2 flex items-center justify-center'>
              <Target className='mr-1 h-5 w-5 text-gray-500' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {correctAnswers}/{result.questions.length}
            </p>
            <p className='text-sm text-gray-600'>Correct</p>
          </div>

          <div className='text-center'>
            <div className='mb-2 flex items-center justify-center'>
              <Award className='mr-1 h-5 w-5 text-gray-500' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{result.score}</p>
            <p className='text-sm text-gray-600'>Points</p>
          </div>

          <div className='text-center'>
            <div className='mb-2 flex items-center justify-center'>
              <Clock className='mr-1 h-5 w-5 text-gray-500' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>
              {Math.floor(result.timeSpent / 60)}:
              {(result.timeSpent % 60).toString().padStart(2, '0')}
            </p>
            <p className='text-sm text-gray-600'>Time</p>
          </div>
        </div>
      </div>

      {/* Personality Result (if available) */}
      {personalityResult && (
        <div className='mb-8 rounded-lg bg-purple-50 p-6'>
          <h3 className='mb-3 text-lg font-semibold text-purple-900'>
            Your Result: {personalityResult.type}
          </h3>
          <p className='mb-4 text-purple-700'>
            {personalityResult.description}
          </p>

          <div className='flex flex-wrap gap-2'>
            {personalityResult.traits.map((trait, index) => (
              <span
                key={index}
                className='rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800'
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className='mb-8 grid gap-6 md:grid-cols-2'>
        <div className='rounded-lg bg-gray-50 p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Performance Breakdown
          </h3>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Accuracy:</span>
              <span className='font-semibold'>{result.percentage}%</span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Average Time per Question:</span>
              <span className='font-semibold'>
                {Math.round(avgTimePerQuestion)}s
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-gray-600'>Total Score:</span>
              <span className='font-semibold'>
                {result.score} / {result.totalPoints}
              </span>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-gray-50 p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Share Your Results
          </h3>

          <ShareBar
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={`I just scored ${result.percentage}% on "${quizTitle}"!`}
            description={`Check out this ${difficulty} ${category} quiz and test your knowledge.`}
            orientation='vertical'
            showLabels
            className='mb-4'
          />
        </div>
      </div>

      {/* Detailed Answers */}
      {showDetailedAnswers && (
        <div className='mb-8'>
          <div className='mb-6 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Review Answers
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className='font-medium text-orange-600 hover:text-orange-700'
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDetails && (
            <div className='space-y-4'>
              {result.questions.map((question, index) => {
                const userAnswer = result.answers.find(
                  a => a.questionId === question.id
                );
                const isCorrect = userAnswer?.isCorrect || false;

                return (
                  <div
                    key={question.id}
                    className={`rounded-lg border p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className='mb-3 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center'>
                          <span className='mr-3 text-sm font-medium text-gray-500'>
                            #{index + 1}
                          </span>
                          {isCorrect ? (
                            <CheckCircle className='mr-2 h-5 w-5 text-green-600' />
                          ) : (
                            <XCircle className='mr-2 h-5 w-5 text-red-600' />
                          )}
                          <span
                            className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                          >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>

                        <h4 className='mb-2 font-medium text-gray-900'>
                          {question.question}
                        </h4>
                      </div>

                      <span className='text-sm text-gray-500'>
                        {question.points}{' '}
                        {question.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>

                    <div className='grid gap-4 text-sm md:grid-cols-2'>
                      <div>
                        <p className='mb-1 text-gray-600'>Your Answer:</p>
                        <p
                          className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
                        >
                          {Array.isArray(userAnswer?.answer)
                            ? userAnswer?.answer.join(', ')
                            : userAnswer?.answer || 'No answer'}
                        </p>
                      </div>

                      <div>
                        <p className='mb-1 text-gray-600'>Correct Answer:</p>
                        <p className='font-medium text-green-800'>
                          {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(', ')
                            : question.correctAnswer}
                        </p>
                      </div>
                    </div>

                    {question.explanation && (
                      <div className='mt-3 rounded bg-blue-50 p-3'>
                        <p className='text-sm text-blue-800'>
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className='flex flex-col items-center justify-center gap-4 border-t pt-6 sm:flex-row'>
        <button
          onClick={onRetake}
          className='flex items-center rounded-lg bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700'
        >
          <RotateCcw className='mr-2 h-5 w-5' />
          Retake Quiz
        </button>

        <button
          onClick={() => onShare?.('general')}
          className='flex items-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50'
        >
          <Share2 className='mr-2 h-5 w-5' />
          Share Results
        </button>
      </div>
    </div>
  );
}

export default QuizResults;
