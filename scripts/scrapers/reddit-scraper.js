/**
 * Reddit Content Scraper
 * Fetches real Reddit posts and comments using the public .json API
 */

import fetch from 'node-fetch';

export class RedditScraper {
  constructor() {
    this.baseUrl = 'https://www.reddit.com';
    this.headers = {
      'User-Agent': 'ThreadJuice/1.0 (Content Aggregator)',
    };
  }

  /**
   * Search Reddit for posts matching a query
   */
  async searchPosts(query, options = {}) {
    const {
      subreddit = null,
      sort = 'relevance',
      time = 'week',
      limit = 10,
    } = options;

    try {
      const searchUrl = subreddit
        ? `${this.baseUrl}/r/${subreddit}/search.json`
        : `${this.baseUrl}/search.json`;

      const params = new URLSearchParams({
        q: query,
        sort: sort,
        t: time,
        limit: limit,
        restrict_sr: subreddit ? 'true' : 'false',
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseSearchResults(data);
    } catch (error) {
      console.error('Reddit search error:', error);
      return [];
    }
  }

  /**
   * Get comments from a specific Reddit post
   */
  async getPostComments(postUrl, limit = 10) {
    try {
      // Extract post ID from URL
      const postId = this.extractPostId(postUrl);
      if (!postId) {
        throw new Error('Invalid Reddit post URL');
      }

      // Fetch post and comments
      const jsonUrl = `${postUrl}.json?limit=${limit}&sort=top`;
      const response = await fetch(jsonUrl, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      // First item is post, second is comments
      if (data.length < 2) {
        return [];
      }

      const commentsData = data[1];
      return this.parseComments(commentsData);
    } catch (error) {
      console.error('Reddit comments error:', error);
      return [];
    }
  }

  /**
   * Get trending posts from popular subreddits
   */
  async getTrendingPosts(category = 'all', options = {}) {
    const categoryToSubreddits = {
      technology: ['technology', 'programming', 'gadgets'],
      relationships: ['relationship_advice', 'AmItheAsshole', 'relationships'],
      workplace: ['antiwork', 'WorkReform', 'jobs'],
      food: ['food', 'cooking', 'MealPrepSunday'],
      sports: ['sports', 'nba', 'soccer'],
      entertainment: ['movies', 'television', 'music'],
      gaming: ['gaming', 'pcgaming', 'PS5'],
      all: ['AskReddit', 'todayilearned', 'mildlyinteresting'],
    };

    const subreddits =
      categoryToSubreddits[category] || categoryToSubreddits['all'];
    const allPosts = [];

    for (const subreddit of subreddits.slice(0, 2)) {
      // Limit to avoid rate limiting
      try {
        const url = `${this.baseUrl}/r/${subreddit}/hot.json?limit=5`;
        const response = await fetch(url, {
          headers: this.headers,
        });

        if (response.ok) {
          const data = await response.json();
          const posts = this.parseSearchResults(data);
          allPosts.push(...posts);
        }
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return allPosts;
  }

  /**
   * Parse search results into a standard format
   */
  parseSearchResults(data) {
    if (!data?.data?.children) return [];

    return data.data.children
      .filter(item => item.kind === 't3') // Only posts, not comments
      .map(item => {
        const post = item.data;
        return {
          id: post.id,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          url: `${this.baseUrl}${post.permalink}`,
          selftext: post.selftext,
          score: post.score,
          numComments: post.num_comments,
          created: new Date(post.created_utc * 1000),
          thumbnail: post.thumbnail !== 'self' ? post.thumbnail : null,
          isVideo: post.is_video,
          media: post.media,
          preview: post.preview,
        };
      });
  }

  /**
   * Parse comments into a standard format
   */
  parseComments(commentsData) {
    if (!commentsData?.data?.children) return [];

    const comments = [];

    const parseCommentTree = (children, depth = 0) => {
      if (depth > 2) return; // Limit depth to avoid huge trees

      children.forEach(item => {
        if (item.kind === 't1' && item.data.body) {
          const comment = item.data;
          comments.push({
            id: comment.id,
            author: comment.author,
            body: comment.body,
            score: comment.score,
            created: new Date(comment.created_utc * 1000),
            edited: comment.edited,
            awards: comment.all_awardings?.length || 0,
            isOP: comment.is_submitter,
            depth: depth,
          });

          // Parse replies if they exist
          if (comment.replies?.data?.children) {
            parseCommentTree(comment.replies.data.children, depth + 1);
          }
        }
      });
    };

    parseCommentTree(commentsData.data.children);

    // Sort by score and return top comments
    return comments.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * Extract post ID from Reddit URL
   */
  extractPostId(url) {
    const match = url.match(/\/comments\/([a-z0-9]+)\//i);
    return match ? match[1] : null;
  }

  /**
   * Get formatted comments for story generation
   */
  async getFormattedComments(query, category = 'all') {
    try {
      // First, try to find relevant posts
      const posts = await this.searchPosts(query, {
        sort: 'relevance',
        time: 'month',
        limit: 3,
      });

      if (posts.length === 0) {
        // Fallback to trending posts in category
        const trendingPosts = await this.getTrendingPosts(category);
        if (trendingPosts.length > 0) {
          posts.push(...trendingPosts.slice(0, 2));
        }
      }

      // Get comments from the most relevant post
      if (posts.length > 0) {
        const topPost = posts[0];
        const comments = await this.getPostComments(topPost.url, 20);

        // Format comments for story
        return comments
          .filter(c => c.body.length > 20 && c.body.length < 500)
          .map(c => ({
            content: c.body,
            author: c.author,
            upvotes: c.score,
            awards: c.awards,
            isOP: c.isOP,
          }))
          .slice(0, 6);
      }

      return [];
    } catch (error) {
      console.error('Error getting formatted comments:', error);
      return [];
    }
  }
}

// Export singleton instance
export const redditScraper = new RedditScraper();
