import { NextRequest, NextResponse } from 'next/server.js';
import { getSupabaseClient } from '@/lib/database';
import fs from 'fs';
import path from 'path';

// Load real generated stories as fallback
function loadGeneratedStories() {
  try {
    const storiesDir = path.join(process.cwd(), 'data', 'generated-stories');
    if (!fs.existsSync(storiesDir)) {
      return [];
    }

    const files = fs
      .readdirSync(storiesDir)
      .filter(file => file.endsWith('.json'));
    const stories = files.map(file => {
      const content = fs.readFileSync(path.join(storiesDir, file), 'utf-8');
      return JSON.parse(content);
    });

    return stories;
  } catch (error) {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    let categoryCount: Record<string, number> = {};
    let usedSupabase = false;

    // Try Supabase first
    try {
      // Get distinct categories from posts with counts
      const { data: posts, error } = await getSupabaseClient()
        .from('posts')
        .select('category')
        .eq('status', 'published');

      if (error) {
        throw error;
      }

      // Group and count categories from Supabase
      posts?.forEach(post => {
        if (post.category) {
          categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
        }
      });

      usedSupabase = true;
    } catch (supabaseError) {
      console.log('Supabase unavailable for categories, using filesystem fallback');
      
      // Fallback to file-based system
      const generatedStories = loadGeneratedStories();
      
      // Count categories from generated stories
      generatedStories.forEach(story => {
        if (story.category && (!story.status || story.status === 'published')) {
          categoryCount[story.category] = (categoryCount[story.category] || 0) + 1;
        }
      });
    }

    // Transform to array and sort by count
    const transformedCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        slug: category.toLowerCase(),
        post_count: count,
      }))
      .sort((a, b) => b.post_count - a.post_count);

    return NextResponse.json({
      categories: transformedCategories,
      source: usedSupabase ? 'supabase' : 'filesystem',
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch categories',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
