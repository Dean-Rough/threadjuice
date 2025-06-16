'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Mail, 
  Zap, 
  TrendingUp,
  X
} from 'lucide-react';

/**
 * Interactive user onboarding flow for new ThreadJuice users
 * Guides users through account setup, preferences, and feature discovery
 */

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{ onNext: () => void; onBack: () => void; data: any; setData: (data: any) => void }>;
}

interface OnboardingData {
  preferences: {
    categories: string[];
    frequency: 'daily' | 'weekly' | 'instant';
    writers: string[];
  };
  profile: {
    firstName: string;
    interests: string[];
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Step 1: Welcome
function WelcomeStep({ onNext }: { onNext: () => void; onBack: () => void; data: any; setData: (data: any) => void }) {
  const { user } = useUser();

  return (
    <div className="text-center">
      <div className="mb-8">
        <Image
          src="/assets/img/logo/logo.svg"
          alt="ThreadJuice"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to ThreadJuice! 🧃
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Hi {user?.firstName || 'there'}! Let's get you set up to discover the best stories from Reddit, 
          transformed by our AI writers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-4">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Trending Content</h3>
          <p className="text-sm text-gray-600">
            AI discovers the hottest Reddit threads
          </p>
        </div>

        <div className="text-center p-4">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Writers</h3>
          <p className="text-sm text-gray-600">
            Unique personalities craft engaging stories
          </p>
        </div>

        <div className="text-center p-4">
          <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Curated Feed</h3>
          <p className="text-sm text-gray-600">
            No endless scrolling, just great content
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center mx-auto"
      >
        Let's Get Started
        <ArrowRight className="w-5 h-5 ml-2" />
      </button>
    </div>
  );
}

// Step 2: Content Preferences
function PreferencesStep({ onNext, onBack, data, setData }: { onNext: () => void; onBack: () => void; data: OnboardingData; setData: (data: OnboardingData) => void }) {
  const categories = [
    { id: 'technology', name: 'Technology', description: 'Programming, gadgets, AI, and tech news' },
    { id: 'entertainment', name: 'Entertainment', description: 'Movies, TV shows, games, and pop culture' },
    { id: 'science', name: 'Science', description: 'Research, discoveries, and scientific discussions' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Health, relationships, and life advice' },
    { id: 'humor', name: 'Humor', description: 'Funny stories, memes, and comedy' },
    { id: 'news', name: 'News & Politics', description: 'Current events and political discussions' },
    { id: 'business', name: 'Business', description: 'Entrepreneurship, finance, and career advice' },
    { id: 'sports', name: 'Sports', description: 'Sports news, highlights, and discussions' },
  ];

  const frequencies = [
    { id: 'daily', name: 'Daily Digest', description: 'Get the best stories every morning' },
    { id: 'weekly', name: 'Weekly Roundup', description: 'A curated collection every Sunday' },
    { id: 'instant', name: 'Real-time', description: 'Get notified as stories are published' },
  ];

  const toggleCategory = (categoryId: string) => {
    const currentCategories = data.preferences.categories;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    setData({
      ...data,
      preferences: {
        ...data.preferences,
        categories: newCategories,
      },
    });
  };

  const setFrequency = (frequency: 'daily' | 'weekly' | 'instant') => {
    setData({
      ...data,
      preferences: {
        ...data.preferences,
        frequency,
      },
    });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What interests you?
        </h2>
        <p className="text-gray-600">
          Choose the topics you'd like to see in your feed
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Categories</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                data.preferences.categories.includes(category.id)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                {data.preferences.categories.includes(category.id) && (
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How often would you like updates?</h3>
        <div className="space-y-3">
          {frequencies.map((freq) => (
            <button
              key={freq.id}
              onClick={() => setFrequency(freq.id as any)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                data.preferences.frequency === freq.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{freq.name}</h4>
                  <p className="text-sm text-gray-600">{freq.description}</p>
                </div>
                {data.preferences.frequency === freq.id && (
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={data.preferences.categories.length === 0}
          className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}

// Step 3: Writer Personas
function WritersStep({ onNext, onBack, data, setData }: { onNext: () => void; onBack: () => void; data: OnboardingData; setData: (data: OnboardingData) => void }) {
  const writers = [
    {
      id: 'snarky-sage',
      name: 'The Snarky Sage',
      description: 'Deadpan humor with a touch of wisdom',
      personality: 'Sarcastic • Observant • Witty',
      avatar: '/assets/img/personas/snarky-sage.jpg',
    },
    {
      id: 'down-to-earth-buddy',
      name: 'The Down-to-Earth Buddy',
      description: 'Your friendly neighborhood storyteller',
      personality: 'Friendly • Relatable • Warm',
      avatar: '/assets/img/personas/down-to-earth-buddy.jpg',
    },
    {
      id: 'dry-cynic',
      name: 'The Dry Cynic',
      description: 'Hilariously bitter take on everything',
      personality: 'Cynical • Sharp • Amusing',
      avatar: '/assets/img/personas/dry-cynic.jpg',
    },
    {
      id: 'enthusiastic-optimist',
      name: 'The Enthusiastic Optimist',
      description: 'Finding the bright side in every story',
      personality: 'Upbeat • Positive • Energetic',
      avatar: '/assets/img/personas/enthusiastic-optimist.jpg',
    },
  ];

  const toggleWriter = (writerId: string) => {
    const currentWriters = data.preferences.writers;
    const newWriters = currentWriters.includes(writerId)
      ? currentWriters.filter(id => id !== writerId)
      : [...currentWriters, writerId];
    
    setData({
      ...data,
      preferences: {
        ...data.preferences,
        writers: newWriters,
      },
    });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Meet our AI writers
        </h2>
        <p className="text-gray-600">
          Choose the writing personalities you'd like to read from
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {writers.map((writer) => (
          <button
            key={writer.id}
            onClick={() => toggleWriter(writer.id)}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              data.preferences.writers.includes(writer.id)
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{writer.name}</h3>
                  {data.preferences.writers.includes(writer.id) && (
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <p className="text-gray-600 mb-2">{writer.description}</p>
                <p className="text-sm text-orange-600">{writer.personality}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={data.preferences.writers.length === 0}
          className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}

// Step 4: Completion
function CompletionStep({ onNext, data }: { onNext: () => void; onBack: () => void; data: OnboardingData; setData: (data: OnboardingData) => void }) {
  const { user } = useUser();

  const handleFinish = async () => {
    try {
      // Save preferences to user profile
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // Track onboarding completion
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Onboarding Completed', {
          categories: data.preferences.categories.length,
          frequency: data.preferences.frequency,
          writers: data.preferences.writers.length,
        });
      }

      onNext();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      onNext(); // Continue anyway
    }
  };

  return (
    <div className="text-center">
      <div className="mb-8">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          You're all set! 🎉
        </h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Welcome to ThreadJuice, {user?.firstName}! Your personalized feed is ready.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Your Preferences:</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">Categories:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.preferences.categories.map(cat => (
                <span key={cat} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Updates:</span>
            <span className="ml-2 capitalize">{data.preferences.frequency}</span>
          </div>
          <div>
            <span className="text-gray-600">Favorite Writers:</span>
            <span className="ml-2">{data.preferences.writers.length} selected</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleFinish}
          className="w-full bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Start Reading Stories
        </button>
        <p className="text-sm text-gray-500">
          You can update these preferences anytime in your settings
        </p>
      </div>
    </div>
  );
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Welcome to ThreadJuice',
    component: WelcomeStep,
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Choose your interests',
    component: PreferencesStep,
  },
  {
    id: 'writers',
    title: 'Writers',
    description: 'Select AI writers',
    component: WritersStep,
  },
  {
    id: 'completion',
    title: 'Complete',
    description: 'All set!',
    component: CompletionStep,
  },
];

interface UserOnboardingProps {
  onComplete: () => void;
}

export default function UserOnboarding({ onComplete }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    preferences: {
      categories: [],
      frequency: 'daily',
      writers: [],
    },
    profile: {
      firstName: '',
      interests: [],
    },
    notifications: {
      email: true,
      push: false,
    },
  });

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </h2>
            <button
              onClick={onComplete}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 pb-8">
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
            data={data}
            setData={setData}
          />
        </div>
      </div>
    </div>
  );
}