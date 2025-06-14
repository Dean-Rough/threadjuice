// Re-export database types
export * from './database';

// Component-specific types
export interface QuizQuestionComponent {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface FeaturedPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  slug: string;
  tags: string[];
}

export interface TrendingTopic {
  id: string;
  text: string;
  url: string;
  category: string;
  trending: boolean;
  growth: number;
  icon: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  count: number;
  color: string;
  icon: string;
}
