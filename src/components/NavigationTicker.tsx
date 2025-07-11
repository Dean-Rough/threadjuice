'use client';

import Link from 'next/link';
import {
  Users,
  Trophy,
  Laptop,
  Star,
  Building,
  Heart,
  Briefcase,
  GraduationCap,
  Plane,
  UtensilsCrossed,
  Baby,
  MessageCircle,
  Heart as HealthIcon,
  TreePine,
  Gamepad2,
  Scale,
  Home,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

// Icon mapping for categories
const categoryIcons: { [key: string]: React.ComponentType<any> } = {
  politics: Users,
  sports: Trophy,
  technology: Laptop,
  celebrity: Star,
  business: Building,
  relationships: Heart,
  workplace: Briefcase,
  education: GraduationCap,
  travel: Plane,
  food: UtensilsCrossed,
  parenting: Baby,
  social: MessageCircle,
  health: HealthIcon,
  environment: TreePine,
  gaming: Gamepad2,
  legal: Scale,
  housing: Home,
  money: DollarSign,
};

export function NavigationTicker() {
  const { data: categoriesData, isLoading, isError } = useCategories();

  // Default categories as fallback
  const defaultCategories = [
    { name: 'Politics', slug: 'politics', post_count: 0 },
    { name: 'Technology', slug: 'technology', post_count: 0 },
    { name: 'Relationships', slug: 'relationships', post_count: 0 },
    { name: 'Sports', slug: 'sports', post_count: 0 },
    { name: 'Business', slug: 'business', post_count: 0 },
    { name: 'Celebrity', slug: 'celebrity', post_count: 0 },
    { name: 'Workplace', slug: 'workplace', post_count: 0 },
    { name: 'Food', slug: 'food', post_count: 0 },
  ];

  // Use API categories if available, otherwise use defaults
  const categories = (categoriesData?.categories && categoriesData.categories.length > 0) 
    ? categoriesData.categories 
    : defaultCategories;

  if (isLoading) {
    return (
      <div className='bg-orange-500 py-3'>
        <div className='animate-pulse'>
          <div className='flex items-center space-x-4 px-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-8 w-24 rounded-full bg-white/20' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='overflow-hidden bg-orange-500 py-3'>
      <div className='animate-ticker flex items-center whitespace-nowrap'>
        {/* Triple the categories for seamless infinite scroll */}
        {[...Array(3)].map((_, setIndex) =>
          categories.map((category, index) => {
            const IconComponent = categoryIcons[category.slug] || Tag;
            return (
              <Link
                key={`set-${setIndex}-${index}`}
                href={`/category/${category.slug}`}
                className='touch-target touch-focus tag-pill mx-2 flex-shrink-0'
              >
                <IconComponent className='h-4 w-4 text-orange-500' />
                <span className='font-mono'>{category.name}</span>
                <span className='font-mono text-xs text-orange-400'>
                  ({category.post_count})
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
