import { useQuery } from '@tanstack/react-query';

interface Category {
  name: string;
  slug: string;
  post_count: number;
}

interface CategoriesResponse {
  categories: Category[];
}

async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch('/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
