import { useState, useCallback } from 'react';

interface UsePostInteractionsResult {
  vote: (postId: string, type: 'upvote' | 'downvote') => Promise<void>;
  share: (postId: string) => Promise<void>;
  bookmark: (postId: string) => Promise<void>;
  isVoting: boolean;
  isSharing: boolean;
  isBookmarking: boolean;
}

export function usePostInteractions(): UsePostInteractionsResult {
  const [isVoting, setIsVoting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const vote = useCallback(async (postId: string, type: 'upvote' | 'downvote') => {
    setIsVoting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const data = await response.json();
      
      // You could dispatch an event here to update UI
      window.dispatchEvent(new CustomEvent('post-interaction', {
        detail: {
          postId,
          type: 'vote',
          data,
        },
      }));

    } catch (error) {
      console.error('Vote failed:', error);
      throw error;
    } finally {
      setIsVoting(false);
    }
  }, []);

  const share = useCallback(async (postId: string) => {
    setIsSharing(true);
    try {
      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to record share');
      }

      const data = await response.json();

      // You could dispatch an event here to update UI
      window.dispatchEvent(new CustomEvent('post-interaction', {
        detail: {
          postId,
          type: 'share',
          data,
        },
      }));

    } catch (error) {
      console.error('Share tracking failed:', error);
      // Don't throw - sharing should still work even if tracking fails
    } finally {
      setIsSharing(false);
    }
  }, []);

  const bookmark = useCallback(async (postId: string) => {
    setIsBookmarking(true);
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to bookmark');
      }

      const data = await response.json();

      // You could dispatch an event here to update UI
      window.dispatchEvent(new CustomEvent('post-interaction', {
        detail: {
          postId,
          type: 'bookmark',
          data,
        },
      }));

    } catch (error) {
      console.error('Bookmark failed:', error);
      throw error;
    } finally {
      setIsBookmarking(false);
    }
  }, []);

  return {
    vote,
    share,
    bookmark,
    isVoting,
    isSharing,
    isBookmarking,
  };
}