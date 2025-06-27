'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, XCircle, 
  TrendingUp, Eye, Heart, MessageSquare, Share2,
  ToggleLeft, ToggleRight, RefreshCw, PauseCircle,
  Zap, Database, Globe, Bot
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: Date;
  errors: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
  metrics: {
    contentGeneration: boolean;
    databaseHealth: boolean;
    apiHealth: boolean;
    cronJobs: boolean;
  };
}

interface DashboardStats {
  dailyTraffic: number;
  aiSearchTraffic: number;
  viralScore: number;
  totalPosts: number;
  lastGenerated: Date | null;
  topPerformer: {
    title: string;
    views: number;
  } | null;
}

export default function SecretAdminDashboard() {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    lastCheck: new Date(),
    errors: [],
    metrics: {
      contentGeneration: true,
      databaseHealth: true,
      apiHealth: true,
      cronJobs: true
    }
  });

  const [stats, setStats] = useState<DashboardStats>({
    dailyTraffic: 0,
    aiSearchTraffic: 0,
    viralScore: 0,
    totalPosts: 0,
    lastGenerated: null,
    topPerformer: null
  });

  const [controls, setControls] = useState({
    contentGeneration: true,
    seoOptimization: true,
    socialSharing: true,
    aiSearchOptimization: true
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch system health
      const healthRes = await fetch('/api/admin/health');
      const healthData = await healthRes.json();
      
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      
      setHealth(healthData);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setHealth(prev => ({
        ...prev,
        status: 'warning',
        errors: [...prev.errors, {
          type: 'dashboard',
          message: 'Failed to fetch dashboard data',
          timestamp: new Date()
        }]
      }));
    }
  };

  const toggleControl = async (control: keyof typeof controls) => {
    const newValue = !controls[control];
    setControls(prev => ({ ...prev, [control]: newValue }));
    
    // Update server
    await fetch('/api/admin/controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [control]: newValue })
    });
  };

  const executeAction = async (action: string) => {
    const res = await fetch(`/api/admin/actions/${action}`, { method: 'POST' });
    const result = await res.json();
    
    if (result.success) {
      fetchDashboardData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ThreadJuice Control Center</h1>
          <p className="text-gray-400">System Dashboard • {new Date().toLocaleString()}</p>
        </div>

        {/* System Health */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </h2>
            <span className={`flex items-center gap-2 ${getStatusColor(health.status)}`}>
              {health.status === 'healthy' && <CheckCircle className="h-5 w-5" />}
              {health.status === 'warning' && <AlertTriangle className="h-5 w-5" />}
              {health.status === 'critical' && <XCircle className="h-5 w-5" />}
              {health.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-700 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Content Gen</span>
                {health.metrics.contentGeneration ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-red-500" />
                }
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Database</span>
                {health.metrics.databaseHealth ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-red-500" />
                }
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">APIs</span>
                {health.metrics.apiHealth ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-red-500" />
                }
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Cron Jobs</span>
                {health.metrics.cronJobs ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-red-500" />
                }
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Daily Traffic</span>
              <Eye className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold">{stats.dailyTraffic.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">views today</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">AI Search Traffic</span>
              <Bot className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold">{stats.aiSearchTraffic}%</div>
            <div className="text-sm text-gray-500 mt-1">from AI platforms</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Viral Score</span>
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold">{stats.viralScore}</div>
            <div className="text-sm text-gray-500 mt-1">average engagement</div>
          </div>
        </div>

        {/* Master Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Master Controls
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Content Generation</span>
              <button
                onClick={() => toggleControl('contentGeneration')}
                className="flex items-center gap-2"
              >
                {controls.contentGeneration ? 
                  <ToggleRight className="h-8 w-8 text-green-500" /> : 
                  <ToggleLeft className="h-8 w-8 text-gray-500" />
                }
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span>SEO Optimization</span>
              <button
                onClick={() => toggleControl('seoOptimization')}
                className="flex items-center gap-2"
              >
                {controls.seoOptimization ? 
                  <ToggleRight className="h-8 w-8 text-green-500" /> : 
                  <ToggleLeft className="h-8 w-8 text-gray-500" />
                }
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Social Sharing</span>
              <button
                onClick={() => toggleControl('socialSharing')}
                className="flex items-center gap-2"
              >
                {controls.socialSharing ? 
                  <ToggleRight className="h-8 w-8 text-green-500" /> : 
                  <ToggleLeft className="h-8 w-8 text-gray-500" />
                }
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span>AI Search Optimization</span>
              <button
                onClick={() => toggleControl('aiSearchOptimization')}
                className="flex items-center gap-2"
              >
                {controls.aiSearchOptimization ? 
                  <ToggleRight className="h-8 w-8 text-green-500" /> : 
                  <ToggleLeft className="h-8 w-8 text-gray-500" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Actions
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => executeAction('clear-cache')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded flex items-center justify-center gap-2"
            >
              <Database className="h-5 w-5" />
              Clear Cache
            </button>
            
            <button
              onClick={() => executeAction('restart-crons')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Restart Crons
            </button>
            
            <button
              onClick={() => executeAction('pause-all')}
              className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded flex items-center justify-center gap-2"
            >
              <PauseCircle className="h-5 w-5" />
              Pause All
            </button>
          </div>
        </div>

        {/* Recent Errors */}
        {health.errors.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Recent Errors
            </h2>
            
            <div className="space-y-2">
              {health.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-red-400 font-medium">{error.type}</span>
                      <p className="text-sm text-gray-400 mt-1">{error.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}