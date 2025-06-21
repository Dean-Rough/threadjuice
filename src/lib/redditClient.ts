import { z } from 'zod'

// Reddit API response schemas
const RedditPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  selftext: z.string(),
  author: z.string(),
  subreddit: z.string(),
  subreddit_name_prefixed: z.string(),
  score: z.number(),
  upvote_ratio: z.number(),
  num_comments: z.number(),
  created_utc: z.number(),
  permalink: z.string(),
  url: z.string(),
  thumbnail: z.string().optional(),
  is_self: z.boolean(),
  stickied: z.boolean(),
  over_18: z.boolean(),
})

const RedditCommentSchema = z.object({
  id: z.string(),
  author: z.string(),
  body: z.string(),
  score: z.number(),
  created_utc: z.number(),
  parent_id: z.string(),
  depth: z.number(),
  replies: z.any().optional(),
})

const RedditListingSchema = z.object({
  data: z.object({
    children: z.array(z.object({
      data: RedditPostSchema,
    })),
    after: z.string().nullable(),
    before: z.string().nullable(),
  }),
})

export type RedditPost = z.infer<typeof RedditPostSchema>
export type RedditComment = z.infer<typeof RedditCommentSchema>

interface RedditClientConfig {
  userAgent: string
  clientId?: string
  clientSecret?: string
}

export class RedditClient {
  private userAgent: string
  private clientId?: string
  private clientSecret?: string
  private accessToken?: string
  private tokenExpiresAt?: number
  private baseUrl = 'https://www.reddit.com'
  private oauthUrl = 'https://oauth.reddit.com'

  // Rate limiting
  private requestQueue: Array<() => Promise<any>> = []
  private lastRequestTime = 0
  private readonly REQUEST_DELAY = 1000 // 1 second between requests

  constructor(config: RedditClientConfig) {
    this.userAgent = config.userAgent
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
  }

  /**
   * Authenticate with Reddit OAuth2 if credentials are provided
   */
  private async authenticate(): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      // console.log('Reddit: No OAuth credentials, using public API')
      return null
    }

    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
      
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'User-Agent': this.userAgent,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      })

      if (!response.ok) {
        throw new Error(`Reddit auth failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000 // Refresh 1 min early

      // console.log('Reddit: OAuth authentication successful')
      return this.accessToken
    } catch (error) {
      console.error('Reddit authentication failed:', error)
      return null
    }
  }

  /**
   * Rate-limited fetch with proper error handling
   */
  private async rateLimitedFetch(url: string): Promise<Response> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          // Ensure minimum delay between requests
          const now = Date.now()
          const timeSinceLastRequest = now - this.lastRequestTime
          if (timeSinceLastRequest < this.REQUEST_DELAY) {
            await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest))
          }

          const token = await this.authenticate()
          const baseUrl = token ? this.oauthUrl : this.baseUrl
          const headers: Record<string, string> = {
            'User-Agent': this.userAgent,
          }

          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          this.lastRequestTime = Date.now()
          const response = await fetch(`${baseUrl}${url}`, { headers })

          if (response.status === 429) {
            // Rate limited - implement exponential backoff
            const retryAfter = parseInt(response.headers.get('retry-after') || '60')
            // console.log(`Reddit rate limited, waiting ${retryAfter} seconds`)
            setTimeout(() => executeRequest(), retryAfter * 1000)
            return
          }

          if (!response.ok) {
            throw new Error(`Reddit API error: ${response.status} ${response.statusText}`)
          }

          resolve(response)
        } catch (error) {
          reject(error)
        }
      }

      this.requestQueue.push(executeRequest)
      if (this.requestQueue.length === 1) {
        executeRequest()
      }
    })
  }

  /**
   * Get hot posts from a specific subreddit
   */
  async getHotPosts(
    subreddit: string, 
    options: {
      limit?: number
      after?: string
      timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
    } = {}
  ): Promise<{ posts: RedditPost[], after: string | null }> {
    const { limit = 25, after, timeframe = 'day' } = options
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      t: timeframe,
    })
    
    if (after) {
      params.set('after', after)
    }

    const url = `/r/${subreddit}/hot.json?${params}`
    
    try {
      const response = await this.rateLimitedFetch(url)
      const data = await response.json()
      
      const parsed = RedditListingSchema.parse(data)
      const posts = parsed.data.children.map(child => child.data)
      
      return {
        posts: posts.filter(post => 
          !post.stickied && // Exclude pinned posts
          !post.over_18 && // Exclude NSFW
          post.is_self && // Text posts only
          post.num_comments > 10 && // Minimum engagement
          post.score > 50 // Minimum upvotes
        ),
        after: parsed.data.after,
      }
    } catch (error) {
      console.error(`Failed to fetch posts from r/${subreddit}:`, error)
      throw error
    }
  }

  /**
   * Get comments for a specific post
   */
  async getComments(
    subreddit: string,
    postId: string,
    options: {
      limit?: number
      sort?: 'best' | 'top' | 'new' | 'controversial' | 'old'
      depth?: number
    } = {}
  ): Promise<RedditComment[]> {
    const { limit = 50, sort = 'top', depth = 3 } = options
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      sort,
      depth: depth.toString(),
    })

    const url = `/r/${subreddit}/comments/${postId}.json?${params}`
    
    try {
      const response = await this.rateLimitedFetch(url)
      const data = await response.json()
      
      if (!Array.isArray(data) || data.length < 2) {
        return []
      }

      const commentsListing = data[1] // Comments are in the second element
      const comments: RedditComment[] = []
      
      const extractComments = (commentData: any, currentDepth = 0) => {
        if (currentDepth > depth) return
        
        try {
          const comment = RedditCommentSchema.parse(commentData.data)
          if (comment.body !== '[deleted]' && comment.body !== '[removed]') {
            comments.push({ ...comment, depth: currentDepth })
          }
          
          // Process replies recursively
          if (commentData.data.replies && commentData.data.replies.data) {
            for (const reply of commentData.data.replies.data.children) {
              extractComments(reply, currentDepth + 1)
            }
          }
        } catch (error) {
          // Skip invalid comments
        }
      }
      
      for (const commentChild of commentsListing.data.children) {
        extractComments(commentChild)
      }
      
      return comments
        .filter(comment => comment.score > 5) // Filter low-quality comments
        .sort((a, b) => b.score - a.score) // Sort by score
        .slice(0, limit)
    } catch (error) {
      console.error(`Failed to fetch comments for ${postId}:`, error)
      throw error
    }
  }

  /**
   * Get multiple subreddits' hot posts for content discovery
   */
  async getMultiSubredditPosts(
    subreddits: string[],
    options: { limit?: number; timeframe?: string } = {}
  ): Promise<{ subreddit: string; posts: RedditPost[] }[]> {
    const results = []
    
    for (const subreddit of subreddits) {
      try {
        const { posts } = await this.getHotPosts(subreddit, options)
        results.push({ subreddit, posts })
        
        // Add delay between subreddit requests
        await new Promise(resolve => setTimeout(resolve, 1500))
      } catch (error) {
        console.error(`Failed to fetch from r/${subreddit}:`, error)
        results.push({ subreddit, posts: [] })
      }
    }
    
    return results
  }

  /**
   * Filter posts for viral potential based on engagement metrics
   */
  filterViralPosts(posts: RedditPost[]): RedditPost[] {
    return posts.filter(post => {
      // Viral potential criteria
      const commentsToUpvotesRatio = post.num_comments / Math.max(post.score, 1)
      const isHighEngagement = post.num_comments > 100 || post.score > 1000
      const hasGoodRatio = commentsToUpvotesRatio > 0.1 // Controversial = viral
      const isRecentEnough = (Date.now() / 1000 - post.created_utc) < 86400 * 2 // 2 days old max
      
      return isHighEngagement && hasGoodRatio && isRecentEnough
    }).sort((a, b) => {
      // Sort by viral potential score
      const scoreA = a.score + (a.num_comments * 2)
      const scoreB = b.score + (b.num_comments * 2)
      return scoreB - scoreA
    })
  }
}

// Target subreddits for viral content
export const VIRAL_SUBREDDITS = [
  'AmItheAsshole',
  'relationship_advice',
  'tifu',
  'pettyrevenge',
  'maliciouscompliance',
  'entitledparents',
  'ChoosingBeggars',
  'bridezillas',
  'MildlyInfuriating',
  'facepalm'
] as const

// Import env at the bottom to avoid circular dependencies
import { env } from './env'

// Create singleton instance
export const redditClient = new RedditClient({
  userAgent: env.REDDIT_USER_AGENT || 'ThreadJuice/1.0',
  clientId: env.REDDIT_CLIENT_ID,
  clientSecret: env.REDDIT_CLIENT_SECRET,
})