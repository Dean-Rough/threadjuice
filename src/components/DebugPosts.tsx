'use client';

import { usePosts } from '@/hooks/usePosts';

export function DebugPosts() {
  const {
    data: postsResponse,
    isLoading,
    error,
  } = usePosts({
    trending: true,
    limit: 3,
  });

  // console.log('DebugPosts:', { postsResponse, isLoading, error });

  if (isLoading) return <div>Loading debug posts...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!postsResponse) return <div>No posts response</div>;

  return (
    <div className='rounded border border-red-500 bg-red-100 p-4'>
      <h3>Debug Posts</h3>
      <p>Total posts: {postsResponse.meta.total}</p>
      <p>Posts returned: {postsResponse.posts.length}</p>
      {postsResponse.posts.slice(0, 2).map(post => (
        <div key={post.id} className='mt-2 border-t pt-2'>
          <p>
            <strong>{post.title}</strong>
          </p>
          <p>Category: {post.category}</p>
        </div>
      ))}
    </div>
  );
}
