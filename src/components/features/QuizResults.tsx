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
  Users
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
    if (percentage >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 80) return { level: 'Great', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 70) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (percentage >= 60) return { level: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const performance = getPerformanceLevel(result.percentage);
  const correctAnswers = result.answers.filter(a => a.isCorrect).length;
  const avgTimePerQuestion = result.timeSpent / result.questions.length;

  return (
    <div className={`quiz-results max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <Trophy className={`w-10 h-10 ${result.percentage >= 80 ? 'text-yellow-500' : 'text-orange-600'}`} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
        <p className="text-gray-600">{quizTitle}</p>
        
        <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
          <span className={`px-2 py-1 rounded ${performance.bgColor} ${performance.color} font-medium`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          <span>•</span>
          <span>{category}</span>
        </div>
      </div>

      {/* Score Display */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-8 mb-8 text-center">
        <div className="relative">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={result.percentage >= 80 ? '#10b981' : result.percentage >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(animatedScore / 100) * 339.292} 339.292`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">
                {animatedScore}%
              </span>
            </div>
          </div>

          <div className={`inline-block px-4 py-2 rounded-full ${performance.bgColor} ${performance.color} font-semibold`}>
            {performance.level}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-gray-500 mr-1" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{correctAnswers}/{result.questions.length}</p>
            <p className="text-sm text-gray-600">Correct</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-gray-500 mr-1" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{result.score}</p>
            <p className="text-sm text-gray-600">Points</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-gray-500 mr-1" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-sm text-gray-600">Time</p>
          </div>
        </div>
      </div>

      {/* Personality Result (if available) */}
      {personalityResult && (
        <div className="bg-purple-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            Your Result: {personalityResult.type}
          </h3>
          <p className="text-purple-700 mb-4">{personalityResult.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {personalityResult.traits.map((trait, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-semibold">{result.percentage}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Time per Question:</span>
              <span className="font-semibold">
                {Math.round(avgTimePerQuestion)}s
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Score:</span>
              <span className="font-semibold">{result.score} / {result.totalPoints}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Results</h3>
          
          <ShareBar
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={`I just scored ${result.percentage}% on "${quizTitle}"!`}
            description={`Check out this ${difficulty} ${category} quiz and test your knowledge.`}
            orientation="vertical"
            showLabels
            className="mb-4"
          />
        </div>
      </div>

      {/* Detailed Answers */}
      {showDetailedAnswers && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Review Answers</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {showDetails && (
            <div className="space-y-4">
              {result.questions.map((question, index) => {
                const userAnswer = result.answers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect || false;
                
                return (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-gray-500 mr-3">
                            #{index + 1}
                          </span>
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mr-2" />
                          )}
                          <span className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-2">
                          {question.question}
                        </h4>
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Your Answer:</p>
                        <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {Array.isArray(userAnswer?.answer) 
                            ? userAnswer?.answer.join(', ') 
                            : userAnswer?.answer || 'No answer'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 mb-1">Correct Answer:</p>
                        <p className="font-medium text-green-800">
                          {Array.isArray(question.correctAnswer) 
                            ? question.correctAnswer.join(', ') 
                            : question.correctAnswer}
                        </p>
                      </div>
                    </div>

                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">
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
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t">
        <button
          onClick={onRetake}
          className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Retake Quiz
        </button>
        
        <button
          onClick={() => onShare?.('general')}
          className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Results
        </button>
      </div>
    </div>
  );
}

export default QuizResults;