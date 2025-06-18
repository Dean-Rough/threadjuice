import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { createPostSchema, postQuerySchema, validateRequestBody, validateQueryParams } from '@/lib/validations';

// Mock data for development when database is not available
function getMockPosts(limit: number = 12) {
  const mockWriters = [
    { id: 1, name: "Alex Chen", avatar_url: "/avatars/alex.png", tone: "witty" },
    { id: 2, name: "Sam Rivera", avatar_url: "/avatars/sam.png", tone: "thoughtful" },
    { id: 3, name: "Jordan Blake", avatar_url: "/avatars/jordan.png", tone: "sharp" },
    { id: 4, name: "Casey Morgan", avatar_url: "/avatars/casey.png", tone: "insightful" }
  ];

  const viralTitles = [
    "This restaurant charged me $50 for 'emotional labor' after I complained about my cold food",
    "My neighbor keeps stealing my packages so I started sending myself glitter bombs",
    "UPDATE: I told my coworkers I was 'working from home' but I was actually at Disneyland",
    "My roommate replaced all my furniture with cardboard replicas as a 'prank'",
    "I found out my boyfriend has been catfishing me... with better photos of himself",
    "My mom rated my cooking 2 stars on Google Reviews (she doesn't know I can see who wrote it)",
    "I've been pretending to be twins to get double vacation days at work for 3 years",
    "My landlord installed a doorbell that plays 'Baby Shark' and now I can't turn it off",
    "I accidentally became the most popular food critic in town by reviewing gas station snacks",
    "My dating app match turned out to be my therapist's other patient",
    "I've been living in an Airbnb for 8 months because the host forgot they listed it",
    "My ex is trying to copyright the breakup letter I wrote to them"
  ];

  const excerpts = [
    "What started as a normal dinner turned into the most expensive meal of my life...",
    "Sometimes petty revenge is the only way to restore balance to the universe.",
    "The Mickey Mouse ears were a dead giveaway, but somehow I thought I could get away with it.",
    "I came home to find my entire apartment looking like a cardboard city.",
    "The audacity of this man to catfish me with his own face but better lighting.",
    "Mom, if you're reading this, your meatloaf really isn't that great.",
    "The elaborate web of lies I've constructed is finally catching up to me.",
    "It's been 47 days and I've heard Baby Shark approximately 2,847 times.",
    "Who knew that reviewing a 7-Eleven hot dog could launch a career?",
    "The session got really awkward when we realized we both knew the same person intimately.",
    "At this point I think I legally live here now.",
    "Apparently creativity in breakup letters can be considered intellectual property."
  ];

  const categories = ["lifestyle", "relationships", "work", "food", "tech", "random"];
  
  const images = [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center", 
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1494790108755-2616c6d77eed?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=400&h=300&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&crop=center"
  ];

  const heroImages = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=1200&h=600&fit=crop&crop=center"
  ];

  const mockPosts = [];
  for (let i = 1; i <= limit; i++) {
    const writer = mockWriters[(i - 1) % mockWriters.length];
    const titleIndex = (i - 1) % viralTitles.length;
    mockPosts.push({
      id: `story-${i}`,
      title: viralTitles[titleIndex],
      slug: `story-${i}`,
      content: { text: "Full story content would go here..." },
      excerpt: excerpts[titleIndex],
      image_url: images[titleIndex % images.length],
      hero_image: heroImages[titleIndex % heroImages.length],
      persona_id: writer.id,
      personas: writer,
      category: categories[i % categories.length],
      featured: i <= 3,
      trending: i <= 8,
      published: true,
      view_count: Math.floor(Math.random() * 50000) + 5000,
      share_count: Math.floor(Math.random() * 2000) + 100,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      updated_at: new Date(Date.now() - i * 3600000).toISOString()
    });
  }
  return mockPosts;
}

// Initialize Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/posts - List posts with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = validateQueryParams(postQuerySchema as any, Object.fromEntries(searchParams));
    
    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', message: queryValidation.error },
        { status: 400 }
      );
    }

    const { 
      page, 
      limit, 
      category, 
      persona_id, 
      published, 
      search,
      featured,
      trending,
      offset: directOffset 
    } = queryValidation.data as any;
    
    // Support both page-based and offset-based pagination
    const offset = directOffset !== undefined ? directOffset : (page - 1) * limit;

    // Build query
    let query = supabase
      .from('posts')
      .select(`
        *,
        personas (
          id,
          name,
          avatar_url,
          tone
        )
      `, { count: 'exact' });

    // Apply filters
    if (category) query = query.eq('category', category);
    if (persona_id) query = query.eq('persona_id', persona_id);
    if (published !== undefined) query = query.eq('published', published);
    if (featured !== undefined) query = query.eq('featured', featured);
    if (trending !== undefined) query = query.eq('trending', trending);
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      
      // Handle missing schema/relationship gracefully with mock data
      if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
        console.warn('Database schema not initialized, returning mock data');
        return NextResponse.json({
          posts: getMockPosts(limit),
          total: 50,
          hasMore: true,
          page: page,
          pagination: {
            page,
            limit,
            total: 50,
            total_pages: Math.ceil(50 / limit),
            has_next: page < Math.ceil(50 / limit),
            has_prev: page > 1,
          },
          timestamp: new Date().toISOString(),
        });
      }
      
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    // Format response to match frontend expectations
    const hasMore = (offset + limit) < (count || 0);
    
    return NextResponse.json({
      posts: posts || [],
      total: count || 0,
      hasMore,
      page: directOffset !== undefined ? Math.floor(offset / limit) + 1 : page,
      pagination: {
        page: directOffset !== undefined ? Math.floor(offset / limit) + 1 : page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts - Create a new post (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(createPostSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', message: validation.error },
        { status: 400 }
      );
    }

    const postData = validation.data;

    // Check if persona exists
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('id')
      .eq('id', postData.persona_id)
      .single();

    if (personaError || !persona) {
      return NextResponse.json(
        { error: 'Invalid persona', message: 'Persona not found' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    // Create post
    const { data: post, error: createError } = await supabase
      .from('posts')
      .insert({
        ...postData,
        slug,
        author_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        personas (
          id,
          name,
          avatar_url,
          tone
        )
      `)
      .single();

    if (createError) {
      console.error('Database error:', createError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}