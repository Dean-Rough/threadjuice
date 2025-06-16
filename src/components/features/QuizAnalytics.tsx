'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Eye,
  Share2,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';

interface QuizAttempt {
  id: string;
  userId: string;
  username?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

interface QuizAnalyticsData {
  quizId: string;
  title: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  averageTime: number;
  completionRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: string;
  attempts: QuizAttempt[];
  questionAnalytics: Array<{
    questionId: string;
    question: string;
    correctRate: number;
    averageTime: number;
    totalAttempts: number;
  }>;
}

export interface QuizAnalyticsProps {
  data: QuizAnalyticsData;
  className?: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | 'all') => void;
  onRefresh?: () => void;
}

export function QuizAnalytics({
  data,
  className = '',
  timeRange = '30d',
  onTimeRangeChange,
  onRefresh,
}: QuizAnalyticsProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'attempts' | 'questions'>('overview');

  // Calculate filtered data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data;

    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filteredAttempts = data.attempts.filter(
      attempt => new Date(attempt.completedAt) >= cutoffDate
    );

    const totalAttempts = filteredAttempts.length;
    const completedAttempts = filteredAttempts.length; // All attempts are completed in this context
    const averageScore = totalAttempts > 0 
      ? filteredAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts 
      : 0;
    const averageTime = totalAttempts > 0
      ? filteredAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / totalAttempts
      : 0;

    return {
      ...data,
      totalAttempts,
      completedAttempts,
      averageScore,
      averageTime,
      completionRate: totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0,
      attempts: filteredAttempts,
    };
  }, [data, timeRange]);

  // Calculate score distribution
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { label: '90-100%', min: 90, max: 100, count: 0 },
      { label: '80-89%', min: 80, max: 89, count: 0 },
      { label: '70-79%', min: 70, max: 79, count: 0 },
      { label: '60-69%', min: 60, max: 69, count: 0 },
      { label: '0-59%', min: 0, max: 59, count: 0 },
    ];

    filteredData.attempts.forEach(attempt => {
      const range = ranges.find(r => attempt.percentage >= r.min && attempt.percentage <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [filteredData.attempts]);

  // Calculate daily attempt counts
  const dailyAttempts = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const dailyData: Array<{ date: string; attempts: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const attemptsOnDate = filteredData.attempts.filter(
        attempt => attempt.completedAt.split('T')[0] === dateStr
      ).length;

      dailyData.push({
        date: dateStr,
        attempts: attemptsOnDate,
      });
    }

    return dailyData;
  }, [filteredData.attempts, timeRange]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`quiz-analytics max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Analytics</h2>
          <p className="text-gray-600">{data.title}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span className="capitalize">{data.difficulty}</span>
            <span>•</span>
            <span>{data.category}</span>
            <span>•</span>
            <span>Created {formatDate(data.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">Total Attempts</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{filteredData.totalAttempts}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">Avg Score</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {filteredData.averageScore.toFixed(1)}%
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">Avg Time</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            {formatTime(Math.round(filteredData.averageTime))}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Award className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-800">Completion</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {filteredData.completionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'attempts', label: 'Attempts', icon: Users },
          { id: 'questions', label: 'Questions', icon: Target },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-8">
          {/* Daily Attempts Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attempts</h3>
            <div className="h-40 flex items-end space-x-2">
              {dailyAttempts.map((day, index) => {
                const maxAttempts = Math.max(...dailyAttempts.map(d => d.attempts), 1);
                const height = (day.attempts / maxAttempts) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-orange-200 rounded-t hover:bg-orange-300 transition-colors min-h-[4px]"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${day.attempts} attempts on ${formatDate(day.date)}`}
                    />
                    <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                      {formatDate(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
            <div className="space-y-3">
              {scoreDistribution.map((range, index) => {
                const percentage = filteredData.totalAttempts > 0 
                  ? (range.count / filteredData.totalAttempts) * 100 
                  : 0;
                
                return (
                  <div key={index} className="flex items-center">
                    <span className="w-16 text-sm text-gray-600 font-medium">
                      {range.label}
                    </span>
                    <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-gray-600 text-right">
                      {range.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'attempts' && (
        <div className="bg-gray-50 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-900">User</th>
                  <th className="text-left p-4 font-medium text-gray-900">Score</th>
                  <th className="text-left p-4 font-medium text-gray-900">Time</th>
                  <th className="text-left p-4 font-medium text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.attempts.slice(0, 50).map((attempt, index) => (
                  <tr key={attempt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <span className="font-medium text-gray-900">
                        {attempt.username || `User ${attempt.userId.slice(-4)}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className={`font-medium ${
                          attempt.percentage >= 80 ? 'text-green-600' : 
                          attempt.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attempt.percentage.toFixed(1)}%
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          ({attempt.score}/{attempt.totalPoints})
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {formatTime(attempt.timeSpent)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredData.attempts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No attempts in the selected time range.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'questions' && (
        <div className="space-y-4">
          {data.questionAnalytics.map((question, index) => (
            <div key={question.questionId} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 mr-3">
                      Question #{index + 1}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      question.correctRate >= 80 ? 'bg-green-100 text-green-800' :
                      question.correctRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.correctRate.toFixed(1)}% correct
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{question.question}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Correct Rate:</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${question.correctRate}%` }}
                      />
                    </div>
                    <span className="font-medium">{question.correctRate.toFixed(1)}%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Average Time:</p>
                  <p className="font-medium">{formatTime(Math.round(question.averageTime))}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Total Attempts:</p>
                  <p className="font-medium">{question.totalAttempts}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizAnalytics;