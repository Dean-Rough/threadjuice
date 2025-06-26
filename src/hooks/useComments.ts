import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';

interface UseCommentsOptions {
  postId: string;
  enabled?: boolean;
}

interface UseCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addComment: (content: string, authorName: string, parentId?: string) => Promise<void>;
  voteComment: (commentId: string, type: 'upvote' | 'downvote', action: 'add' | 'remove') => Promise<void>;
}

export function useComments({ postId, enabled = true }: UseCommentsOptions): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    if (!enabled || !postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId, enabled]);

  const addComment = useCallback(async (
    content: string,
    authorName: string,
    parentId?: string
  ) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          authorName,
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      
      // Add the new comment to the list
      if (parentId) {
        // If it's a reply, add it to the parent's replies
        setComments(prevComments => {
          const updateReplies = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), data.comment],
                };
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: updateReplies(comment.replies),
                };
              }
              return comment;
            });
          };
          return updateReplies(prevComments);
        });
      } else {
        // If it's a root comment, add it to the top
        setComments(prevComments => [data.comment, ...prevComments]);
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add comment');
    }
  }, [postId]);

  const voteComment = useCallback(async (
    commentId: string,
    type: 'upvote' | 'downvote',
    action: 'add' | 'remove'
  ) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const data = await response.json();

      // Update the comment's vote counts
      setComments(prevComments => {
        const updateVotes = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateVotes(comment.replies),
              };
            }
            return comment;
          });
        };
        return updateVotes(prevComments);
      });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to vote');
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments,
    addComment,
    voteComment,
  };
}