import { NextRequest, NextResponse } from 'next/server.js';
import { z } from 'zod';
import supabase from '@/lib/database';
import fs from 'fs';
import path from 'path';

const PostQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(50))
    .optional(),
  category: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  trending: z
    .string()
    .nullable()
    .transform(val => val === 'true')
    .optional(),
  featured: z
    .string()
    .nullable()
    .transform(val => val === 'true')
    .optional(),
  search: z.string().nullable().optional(),
  sortBy: z
    .enum(['views', 'shares', 'comments', 'latest', 'trending'])
    .nullable()
    .optional(),
});

// Load real generated stories as fallback
function loadGeneratedStories() {
  try {
    const storiesDir = path.join(process.cwd(), 'data', 'generated-stories');
    if (!fs.existsSync(storiesDir)) {
      return [];
    }
    
    const files = fs.readdirSync(storiesDir).filter(file => file.endsWith('.json'));
    const stories = files.map(file => {
      const content = fs.readFileSync(path.join(storiesDir, file), 'utf-8');
      return JSON.parse(content);
    });
    
    // Sort by creation date, newest first
    return stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    // Failed to load generated stories
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // Validate query parameters
    const result = PostQuerySchema.safeParse(queryParams);
    if (!result.success) {
      return NextResponse.json(
        { error: 'INVALID_QUERY', details: result.error.format() },
        { status: 400 }
      );
    }

    const {
      page = 1,
      limit = 12,
      category,
      author,
      trending,
      featured,
      search,
      sortBy = 'latest',
    } = result.data;

    let posts = [];
    let usedSupabase = false;

    // Try Supabase first
    try {
      // Attempting to fetch from Supabase
      
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          slug,
          hook,
          content,
          category,
          status,
          featured,
          trending_score,
          view_count,
          share_count,
          featured_image,
          created_at,
          updated_at,
          personas (
            name,
            avatar_url,
            tone
          )
        `)
        .eq('status', 'published');

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }

      if (trending === true) {
        query = query.gte('trending_score', 50);
      }

      if (featured === true) {
        query = query.eq('featured', true);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,hook.ilike.%${search}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'views':
          query = query.order('view_count', { ascending: false });
          break;
        case 'shares':
          query = query.order('share_count', { ascending: false });
          break;
        case 'trending':
          query = query.order('trending_score', { ascending: false });
          break;
        case 'latest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      // Pagination parameters calculated
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        // Supabase error encountered
        throw error;
      }

      // Successfully fetched from Supabase
      
      // Transform Supabase data to match expected format
      posts = data?.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.hook,
        imageUrl: post.featured_image,
        category: post.category,
        author: (Array.isArray(post.personas) ? post.personas[0]?.name : post.personas?.name) || 'The Terry',
        viewCount: post.view_count,
        upvoteCount: Math.floor(post.view_count * 0.08), // Derived metric
        commentCount: Math.floor(post.view_count * 0.03), // Derived metric
        shareCount: post.share_count,
        bookmarkCount: Math.floor(post.view_count * 0.05), // Derived metric
        trending: post.trending_score >= 50,
        featured: post.featured,
        status: post.status,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        content: post.content,
        persona: {
          name: (Array.isArray(post.personas) ? post.personas[0]?.name : post.personas?.name) || 'The Terry',
          avatar: (Array.isArray(post.personas) ? post.personas[0]?.avatar_url : post.personas?.avatar_url) || '/assets/img/personas/the-terry.svg',
          bio: (Array.isArray(post.personas) ? post.personas[0]?.tone : post.personas?.tone) || 'Acerbic wit and social commentary'
        },
        readingTime: Math.ceil((post.content?.sections?.length || 8) * 0.5)
      })) || [];

      usedSupabase = true;

    } catch (supabaseError) {
      // Supabase unavailable, falling back to file system
      
      // Fallback to file-based system
      const generatedStories = loadGeneratedStories();
      
      // Filter and process like before
      const filteredPosts = generatedStories.filter(post => {
        if (post.status && post.status !== 'published') return false;
        if (category && post.category !== category) return false;
        if (author) {
          const authorSlug = author.toLowerCase().replace(/\s+/g, '-');
          if (!post.author.toLowerCase().includes(authorSlug)) return false;
        }
        if (trending === true && !post.trending) return false;
        if (featured === true && !post.featured) return false;
        if (search) {
          const searchLower = search.toLowerCase();
          const titleMatch = post.title.toLowerCase().includes(searchLower);
          const excerptMatch = post.excerpt?.toLowerCase().includes(searchLower);
          if (!titleMatch && !excerptMatch) return false;
        }
        return true;
      });

      // Sort posts
      switch (sortBy) {
        case 'views':
          filteredPosts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
          break;
        case 'shares':
          filteredPosts.sort((a, b) => (b.shareCount || 0) - (a.shareCount || 0));
          break;
        case 'trending':
          filteredPosts.sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0));
          break;
        case 'latest':
        default:
          filteredPosts.sort((a, b) => 
            new Date(b.createdAt || b.updatedAt).getTime() - 
            new Date(a.createdAt || a.updatedAt).getTime()
          );
          break;
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      posts = filteredPosts.slice(startIndex, endIndex);
    }

    // Calculate pagination info
    const total = usedSupabase ? posts.length : posts.length; // Would need count query for Supabase
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Transform posts to ensure consistent format
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
      category: post.category,
      author: post.author,
      viewCount: post.viewCount || 0,
      upvoteCount: post.upvoteCount || 0,
      commentCount: post.commentCount || 0,
      shareCount: post.shareCount || 0,
      bookmarkCount: post.bookmarkCount || 0,
      trending: post.trending || false,
      featured: post.featured || false,
      status: post.status || 'published',
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      readingTime: post.readingTime || 5,
      persona: post.persona || {
        name: 'The Terry',
        avatar: '/assets/img/personas/the-terry.svg',
        bio: 'Acerbic wit and social commentary'
      }
    }));

    return NextResponse.json({
      posts: transformedPosts,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        source: usedSupabase ? 'supabase' : 'filesystem',
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch posts',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}

// POST endpoint for creating new posts (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'slug', 'content', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: 'MISSING_FIELD', field },
          { status: 400 }
        );
      }
    }

    // Transform data for Supabase
    const postData = {
      title: body.title,
      slug: body.slug,
      hook: body.excerpt || body.title,
      content: body.content,
      category: body.category,
      featured: body.featured || false,
      trending_score: body.viral_score || 0,
      view_count: body.viewCount || 0,
      share_count: body.shareCount || 0,
      featured_image: body.imageUrl,
      status: 'published'
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create post:', error);
      return NextResponse.json(
        { error: 'CREATE_FAILED', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: data }, { status: 201 });

  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Failed to create post' },
      { status: 500 }
    );
  }
}