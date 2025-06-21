/**
 * Consolidated category logic for ThreadJuice
 * Provides unified category definitions with icons and emojis
 */

import {
  Flame,
  TrendingUp,
  Gamepad2,
  Monitor,
  Film,
  Trophy,
  Music,
  UtensilsCrossed,
  Plane,
  Sparkles,
  Radio,
  FlaskConical,
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

export const CATEGORIES: readonly Category[] = [
  {
    id: 'all',
    name: 'All',
    emoji: '🔥',
    icon: Flame,
    description: 'All viral content',
    color: 'orange',
  },
  {
    id: 'viral',
    name: 'Viral',
    emoji: '🔥',
    icon: Flame,
    description: 'Trending viral content',
    color: 'red',
  },
  {
    id: 'trending',
    name: 'Trending',
    emoji: '📈',
    icon: TrendingUp,
    description: 'Currently trending topics',
    color: 'green',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    emoji: '🎮',
    icon: Gamepad2,
    description: 'Gaming news and discussions',
    color: 'purple',
  },
  {
    id: 'tech',
    name: 'Technology',
    emoji: '💻',
    icon: Monitor,
    description: 'Tech news and innovations',
    color: 'blue',
  },
  {
    id: 'movie',
    name: 'Movies',
    emoji: '🎬',
    icon: Film,
    description: 'Movie reviews and entertainment',
    color: 'yellow',
  },
  {
    id: 'sports',
    name: 'Sports',
    emoji: '🏆',
    icon: Trophy,
    description: 'Sports news and highlights',
    color: 'indigo',
  },
  {
    id: 'music',
    name: 'Music',
    emoji: '🎵',
    icon: Music,
    description: 'Music news and discussions',
    color: 'pink',
  },
  {
    id: 'food',
    name: 'Food',
    emoji: '🍽️',
    icon: UtensilsCrossed,
    description: 'Food and cooking content',
    color: 'amber',
  },
  {
    id: 'travel',
    name: 'Travel',
    emoji: '✈️',
    icon: Plane,
    description: 'Travel stories and tips',
    color: 'cyan',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    emoji: '✨',
    icon: Sparkles,
    description: 'Lifestyle and personal stories',
    color: 'rose',
  },
  {
    id: 'news',
    name: 'News',
    emoji: '📰',
    icon: Radio,
    description: 'Current events and news',
    color: 'gray',
  },
  {
    id: 'science',
    name: 'Science',
    emoji: '🔬',
    icon: FlaskConical,
    description: 'Science and research',
    color: 'emerald',
  },
] as const;

// Helper functions
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find(category => category.id === id);
};

export const getCategoryEmoji = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.emoji || '📰';
};

export const getCategoryIcon = (
  categoryId: string
): React.ComponentType<any> => {
  const category = getCategoryById(categoryId);
  return category?.icon || Radio;
};

export const getCategoryName = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.name || 'Unknown';
};

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || 'gray';
};

// Get categories for display (excluding 'all' for filter lists)
export const getDisplayCategories = (
  includeAll = true
): readonly Category[] => {
  return includeAll ? CATEGORIES : CATEGORIES.slice(1);
};

// Type exports
export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type CategoryColor = (typeof CATEGORIES)[number]['color'];
