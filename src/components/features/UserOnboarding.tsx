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
  X,
} from 'lucide-react';

/**
 * Interactive user onboarding flow for new ThreadJuice users
 * Guides users through account setup, preferences, and feature discovery
 */

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{
    onNext: () => void;
    onBack: () => void;
    data: any;
    setData: (data: any) => void;
  }>;
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
function WelcomeStep({
  onNext,
}: {
  onNext: () => void;
  onBack: () => void;
  data: any;
  setData: (data: any) => void;
}) {
  const { user } = useUser();

  return (
    <div className='text-center'>
      <div className='mb-8'>
        <Image
          src='/assets/img/logo/logo.svg'
          alt='ThreadJuice'
          width={80}
          height={80}
          className='mx-auto mb-4'
        />
        <h1 className='mb-4 text-3xl font-bold text-gray-900'>
          Welcome to ThreadJuice! 🧃
        </h1>
        <p className='mx-auto max-w-md text-lg text-gray-600'>
          Hi {user?.firstName || 'there'}! Let's get you set up to discover the
          best stories from Reddit, transformed by our AI writers.
        </p>
      </div>

      <div className='mb-8 grid gap-6 md:grid-cols-3'>
        <div className='p-4 text-center'>
          <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
            <TrendingUp className='h-8 w-8 text-blue-600' />
          </div>
          <h3 className='mb-2 font-semibold text-gray-900'>Trending Content</h3>
          <p className='text-sm text-gray-600'>
            AI discovers the hottest Reddit threads
          </p>
        </div>

        <div className='p-4 text-center'>
          <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
            <Zap className='h-8 w-8 text-green-600' />
          </div>
          <h3 className='mb-2 font-semibold text-gray-900'>AI Writers</h3>
          <p className='text-sm text-gray-600'>
            Unique personalities craft engaging stories
          </p>
        </div>

        <div className='p-4 text-center'>
          <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100'>
            <Mail className='h-8 w-8 text-purple-600' />
          </div>
          <h3 className='mb-2 font-semibold text-gray-900'>Curated Feed</h3>
          <p className='text-sm text-gray-600'>
            No endless scrolling, just great content
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className='mx-auto flex items-center rounded-lg bg-orange-600 px-8 py-3 text-white transition-colors hover:bg-orange-700'
      >
        Let's Get Started
        <ArrowRight className='ml-2 h-5 w-5' />
      </button>
    </div>
  );
}

// Step 2: Content Preferences
function PreferencesStep({
  onNext,
  onBack,
  data,
  setData,
}: {
  onNext: () => void;
  onBack: () => void;
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  const categories = [
    {
      id: 'technology',
      name: 'Technology',
      description: 'Programming, gadgets, AI, and tech news',
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      description: 'Movies, TV shows, games, and pop culture',
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Research, discoveries, and scientific discussions',
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      description: 'Health, relationships, and life advice',
    },
    {
      id: 'humor',
      name: 'Humor',
      description: 'Funny stories, memes, and comedy',
    },
    {
      id: 'news',
      name: 'News & Politics',
      description: 'Current events and political discussions',
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Entrepreneurship, finance, and career advice',
    },
    {
      id: 'sports',
      name: 'Sports',
      description: 'Sports news, highlights, and discussions',
    },
  ];

  const frequencies = [
    {
      id: 'daily',
      name: 'Daily Digest',
      description: 'Get the best stories every morning',
    },
    {
      id: 'weekly',
      name: 'Weekly Roundup',
      description: 'A curated collection every Sunday',
    },
    {
      id: 'instant',
      name: 'Real-time',
      description: 'Get notified as stories are published',
    },
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
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-2xl font-bold text-gray-900'>
          What interests you?
        </h2>
        <p className='text-gray-600'>
          Choose the topics you'd like to see in your feed
        </p>
      </div>

      <div className='mb-8'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Content Categories
        </h3>
        <div className='grid gap-3 md:grid-cols-2'>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                data.preferences.categories.includes(category.id)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='font-medium text-gray-900'>{category.name}</h4>
                  <p className='text-sm text-gray-600'>
                    {category.description}
                  </p>
                </div>
                {data.preferences.categories.includes(category.id) && (
                  <CheckCircle className='h-5 w-5 text-orange-600' />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className='mb-8'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          How often would you like updates?
        </h3>
        <div className='space-y-3'>
          {frequencies.map(freq => (
            <button
              key={freq.id}
              onClick={() => setFrequency(freq.id as any)}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                data.preferences.frequency === freq.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='font-medium text-gray-900'>{freq.name}</h4>
                  <p className='text-sm text-gray-600'>{freq.description}</p>
                </div>
                {data.preferences.frequency === freq.id && (
                  <CheckCircle className='h-5 w-5 text-orange-600' />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className='flex justify-between'>
        <button
          onClick={onBack}
          className='flex items-center px-6 py-3 text-gray-600 transition-colors hover:text-gray-800'
        >
          <ArrowLeft className='mr-2 h-5 w-5' />
          Back
        </button>

        <button
          onClick={onNext}
          disabled={data.preferences.categories.length === 0}
          className='flex items-center rounded-lg bg-orange-600 px-8 py-3 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Continue
          <ArrowRight className='ml-2 h-5 w-5' />
        </button>
      </div>
    </div>
  );
}

// Step 3: Writer Personas
function WritersStep({
  onNext,
  onBack,
  data,
  setData,
}: {
  onNext: () => void;
  onBack: () => void;
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
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
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-2xl font-bold text-gray-900'>
          Meet our AI writers
        </h2>
        <p className='text-gray-600'>
          Choose the writing personalities you'd like to read from
        </p>
      </div>

      <div className='mb-8 grid gap-4 md:grid-cols-2'>
        {writers.map(writer => (
          <button
            key={writer.id}
            onClick={() => toggleWriter(writer.id)}
            className={`rounded-lg border-2 p-6 text-left transition-all ${
              data.preferences.writers.includes(writer.id)
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            <div className='flex items-start space-x-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-200'>
                <User className='h-8 w-8 text-gray-600' />
              </div>
              <div className='flex-1'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='font-semibold text-gray-900'>{writer.name}</h3>
                  {data.preferences.writers.includes(writer.id) && (
                    <CheckCircle className='h-5 w-5 text-orange-600' />
                  )}
                </div>
                <p className='mb-2 text-gray-600'>{writer.description}</p>
                <p className='text-sm text-orange-600'>{writer.personality}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className='flex justify-between'>
        <button
          onClick={onBack}
          className='flex items-center px-6 py-3 text-gray-600 transition-colors hover:text-gray-800'
        >
          <ArrowLeft className='mr-2 h-5 w-5' />
          Back
        </button>

        <button
          onClick={onNext}
          disabled={data.preferences.writers.length === 0}
          className='flex items-center rounded-lg bg-orange-600 px-8 py-3 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Continue
          <ArrowRight className='ml-2 h-5 w-5' />
        </button>
      </div>
    </div>
  );
}

// Step 4: Completion
function CompletionStep({
  onNext,
  data,
}: {
  onNext: () => void;
  onBack: () => void;
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
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
    <div className='text-center'>
      <div className='mb-8'>
        <CheckCircle className='mx-auto mb-4 h-20 w-20 text-green-500' />
        <h2 className='mb-4 text-3xl font-bold text-gray-900'>
          You're all set! 🎉
        </h2>
        <p className='mx-auto max-w-md text-lg text-gray-600'>
          Welcome to ThreadJuice, {user?.firstName}! Your personalized feed is
          ready.
        </p>
      </div>

      <div className='mx-auto mb-8 max-w-md rounded-lg bg-gray-50 p-6 text-left'>
        <h3 className='mb-4 font-semibold text-gray-900'>Your Preferences:</h3>
        <div className='space-y-3 text-sm'>
          <div>
            <span className='text-gray-600'>Categories:</span>
            <div className='mt-1 flex flex-wrap gap-1'>
              {data.preferences.categories.map(cat => (
                <span
                  key={cat}
                  className='rounded bg-orange-100 px-2 py-1 text-xs text-orange-800'
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className='text-gray-600'>Updates:</span>
            <span className='ml-2 capitalize'>
              {data.preferences.frequency}
            </span>
          </div>
          <div>
            <span className='text-gray-600'>Favorite Writers:</span>
            <span className='ml-2'>
              {data.preferences.writers.length} selected
            </span>
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        <button
          onClick={handleFinish}
          className='w-full rounded-lg bg-orange-600 px-8 py-3 text-white transition-colors hover:bg-orange-700'
        >
          Start Reading Stories
        </button>
        <p className='text-sm text-gray-500'>
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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl'>
        {/* Progress bar */}
        <div className='px-8 pb-4 pt-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-sm font-medium text-gray-500'>
              Step {currentStep + 1} of {steps.length}
            </h2>
            <button
              onClick={onComplete}
              className='text-gray-400 hover:text-gray-600'
            >
              <X className='h-6 w-6' />
            </button>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-orange-600 transition-all duration-300'
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className='px-8 pb-8'>
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
