'use client';

import React, { useState, useEffect } from 'react';
import { getAutomationEngine, AutomationConfig, GenerationJob } from '../lib/automationEngine';

export default function AutomationDashboard() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [stats, setStats] = useState({
    running: 0,
    pending: 0,
    completed: 0,
    failed: 0,
  });
  const [config, setConfig] = useState<AutomationConfig>({
    enabled: false,
    schedule: {
      interval: 'daily',
      time: '09:00',
    },
    generation: {
      storiesPerRun: 5,
      maxConcurrent: 2,
      retryAttempts: 3,
      sources: ['reddit'],
    },
    filtering: {
      strictMode: true,
      customFilters: [],
    },
    notifications: {
      onSuccess: true,
      onFailure: true,
    },
  });

  const engine = getAutomationEngine();

  // Simulate real-time updates (in production, use WebSocket or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      const status = engine.getJobStatus();
      setJobs(status.active);
      setStats(status.summary);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAutomation = async () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    
    const newConfig = { ...config, enabled: newEnabled };
    setConfig(newConfig);
    engine.updateConfig(newConfig);
    
    if (newEnabled) {
      await engine.start();
    } else {
      engine.stop();
    }
  };

  const handleConfigChange = (path: string, value: any) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current = newConfig as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setConfig(newConfig);
    engine.updateConfig(newConfig);
  };

  const handleManualGeneration = async () => {
    await engine.queueGeneration({
      count: 1,
      source: 'reddit',
      priority: 'high',
    });
  };

  const handleBulkGeneration = async () => {
    await engine.queueGeneration({
      count: 5,
      source: 'reddit',
      priority: 'normal',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = Math.round((endTime.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.round(duration / 60)}m`;
    return `${Math.round(duration / 3600)}h`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ThreadJuice Automation
        </h1>
        <p className="text-gray-600">
          Automated content generation and scheduling system
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Automation Control</h2>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isEnabled ? 'ENABLED' : 'DISABLED'}
            </div>
            <button
              onClick={handleToggleAutomation}
              className={`px-4 py-2 rounded-md font-medium ${
                isEnabled 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isEnabled ? 'Stop Automation' : 'Start Automation'}
            </button>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleManualGeneration}
            className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-left"
          >
            <div className="font-medium text-gray-900">Generate Single Story</div>
            <div className="text-sm text-gray-600">Create one story immediately</div>
          </button>
          
          <button
            onClick={handleBulkGeneration}
            className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 text-left"
          >
            <div className="font-medium text-gray-900">Bulk Generation</div>
            <div className="text-sm text-gray-600">Generate 5 stories in batch</div>
          </button>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Interval
            </label>
            <select
              value={config.schedule.interval}
              onChange={(e) => handleConfigChange('schedule.interval', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stories Per Run
            </label>
            <input
              type="number"
              value={config.generation.storiesPerRun}
              onChange={(e) => handleConfigChange('generation.storiesPerRun', parseInt(e.target.value))}
              min="1"
              max="20"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Source
            </label>
            <select
              value={config.generation.sources[0]}
              onChange={(e) => handleConfigChange('generation.sources', [e.target.value])}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            >
              <option value="reddit">Reddit</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
          <div className="text-sm text-gray-600">Running</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Job Queue */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Generation Queue</h2>
        </div>
        
        <div className="p-6">
          {jobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No active jobs. Start automation or trigger manual generation to see activity.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">
                        {job.type === 'manual' ? 'Manual Generation' : 
                         job.type === 'scheduled' ? 'Scheduled Generation' : 
                         'Bulk Generation'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDuration(job.startTime, job.endTime)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Job ID: {job.id}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Attempted:</span>
                      <span className="ml-1 font-medium">{job.results.attempted}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Successful:</span>
                      <span className="ml-1 font-medium text-green-600">{job.results.successful}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Failed:</span>
                      <span className="ml-1 font-medium text-red-600">{job.results.failed}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stories:</span>
                      <span className="ml-1 font-medium">{job.results.stories.length}</span>
                    </div>
                  </div>
                  
                  {job.results.errors.length > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      Latest error: {job.results.errors[job.results.errors.length - 1]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Current Configuration</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Interval: {config.schedule.interval}</li>
              <li>• Stories per run: {config.generation.storiesPerRun}</li>
              <li>• Max concurrent: {config.generation.maxConcurrent}</li>
              <li>• Content source: {config.generation.sources.join(', ')}</li>
              <li>• Strict filtering: {config.filtering.strictMode ? 'Yes' : 'No'}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Next Scheduled Run</h3>
            <div className="text-sm text-gray-600">
              {isEnabled ? (
                <div>
                  <div>• Next run: {config.schedule.time || 'Based on interval'}</div>
                  <div>• Frequency: {config.schedule.interval}</div>
                  <div>• Will generate: {config.generation.storiesPerRun} stories</div>
                </div>
              ) : (
                <div className="text-gray-500">Automation is disabled</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}