'use client';

import React, { useState, useEffect } from 'react';
import { contentModerator, ModerationResult } from '../lib/contentModerator';

interface ModerationLog {
  id: string;
  timestamp: Date;
  content: string;
  result: ModerationResult;
  action: 'blocked' | 'approved' | 'flagged';
  source: 'reddit' | 'twitter' | 'story-generation' | 'manual';
}

export default function ContentModerationDashboard() {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [testContent, setTestContent] = useState('');
  const [testResult, setTestResult] = useState<ModerationResult | null>(null);
  const [stats, setStats] = useState({
    totalChecked: 0,
    blocked: 0,
    approved: 0,
    flagged: 0,
  });

  // Test content moderation
  const testModeration = () => {
    if (!testContent.trim()) return;
    
    const result = contentModerator.moderateContent(testContent);
    setTestResult(result);
    
    // Add to logs
    const newLog: ModerationLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      content: testContent,
      result,
      action: result.isAllowed ? 'approved' : 'blocked',
      source: 'manual',
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50
    
    // Update stats
    setStats(prev => ({
      totalChecked: prev.totalChecked + 1,
      blocked: result.isAllowed ? prev.blocked : prev.blocked + 1,
      approved: result.isAllowed ? prev.approved + 1 : prev.approved,
      flagged: result.score > 10 ? prev.flagged + 1 : prev.flagged,
    }));
  };

  const getResultColor = (result: ModerationResult) => {
    if (!result.isAllowed) return 'text-red-600 bg-red-50';
    if (result.score > 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ThreadJuice Content Moderation
        </h1>
        <p className="text-gray-600">
          Monitor and test content filtering for political, religious, and racial content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.totalChecked}</div>
          <div className="text-sm text-gray-600">Total Checked</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          <div className="text-sm text-gray-600">Blocked</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{stats.flagged}</div>
          <div className="text-sm text-gray-600">Flagged</div>
        </div>
      </div>

      {/* Test Interface */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Content Moderation</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Content
            </label>
            <textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Enter text to test content moderation..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={4}
            />
          </div>
          
          <button
            onClick={testModeration}
            disabled={!testContent.trim()}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Moderation
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-md ${getResultColor(testResult)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {testResult.isAllowed ? '✅ Content Approved' : '❌ Content Blocked'}
              </span>
              <span className="text-sm">Score: {testResult.score}</span>
            </div>
            
            {testResult.blockedCategories.length > 0 && (
              <div className="mb-2">
                <span className="text-sm font-medium">Blocked Categories: </span>
                <span className="text-sm">{testResult.blockedCategories.join(', ')}</span>
              </div>
            )}
            
            {testResult.flaggedTerms.length > 0 && (
              <div>
                <span className="text-sm font-medium">Flagged Terms: </span>
                <span className="text-sm">{testResult.flaggedTerms.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Moderation Logs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Moderation Activity</h2>
        </div>
        
        <div className="p-6">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No moderation activity yet. Test some content above to see results.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                        {log.action.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {log.source}
                      </span>
                      <span className="text-sm text-gray-500">
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Score: {log.result.score}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-900 mb-2">
                    {log.content.slice(0, 200)}
                    {log.content.length > 200 && '...'}
                  </div>
                  
                  {log.result.blockedCategories.length > 0 && (
                    <div className="text-sm text-red-600">
                      Categories: {log.result.blockedCategories.join(', ')}
                    </div>
                  )}
                  
                  {log.result.flaggedTerms.length > 0 && (
                    <div className="text-sm text-orange-600">
                      Flagged: {log.result.flaggedTerms.slice(0, 5).join(', ')}
                      {log.result.flaggedTerms.length > 5 && ` (+${log.result.flaggedTerms.length - 5} more)`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
        <h2 className="text-xl font-semibold mb-4">Moderation Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Current Settings</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Strict mode enabled</li>
              <li>✅ Political content blocked</li>
              <li>✅ Religious content blocked</li>
              <li>✅ Racial content blocked</li>
              <li>✅ Violent content blocked</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Protected Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['political', 'religious', 'racial', 'violent', 'custom'].map(category => (
                <span
                  key={category}
                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}