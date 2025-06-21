'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { postKeys } from '@/hooks/usePosts';

export function CacheClearer() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Clear all post-related caches on mount
    queryClient.removeQueries({ queryKey: postKeys.all });
    queryClient.invalidateQueries({ queryKey: postKeys.all });
    
    // Also clear any browser caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Cache cleared
  }, [queryClient]);
  
  return null;
}