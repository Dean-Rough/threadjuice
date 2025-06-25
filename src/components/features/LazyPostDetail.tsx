'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the heavy SimplePostDetail component
const SimplePostDetail = lazy(() =>
  import('./SimplePostDetail').then(module => ({
    default: module.default,
  }))
);

interface LazyPostDetailProps {
  postId: string;
  showSidebar?: boolean;
  showRelated?: boolean;
}

// Loading skeleton that matches the post detail layout
function PostDetailSkeleton() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid gap-8 lg:grid-cols-4'>
          <div className='lg:col-span-3'>
            <article className='max-w-none'>
              <div className='animate-pulse space-y-6'>
                {/* Hero image skeleton */}
                <Skeleton className='h-[400px] w-full rounded-xl' />

                {/* Title skeleton */}
                <div className='space-y-3'>
                  <Skeleton className='h-8 w-3/4' />
                  <Skeleton className='h-6 w-1/2' />
                </div>

                {/* Meta info skeleton */}
                <div className='flex items-center space-x-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>

                {/* Content skeleton */}
                <div className='space-y-4'>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className='space-y-2'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-4 w-5/6' />
                      <Skeleton className='h-4 w-4/6' />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar skeleton */}
          <div className='lg:col-span-1'>
            <div className='sticky top-20 space-y-6'>
              <Skeleton className='h-64 w-full rounded-lg' />
              <Skeleton className='h-48 w-full rounded-lg' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LazyPostDetail(props: LazyPostDetailProps) {
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <SimplePostDetail {...props} />
    </Suspense>
  );
}
