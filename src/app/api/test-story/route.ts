import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read our generated story
    const storyPath = path.join(
      process.cwd(),
      'first-story-sister-fake-influencer-lifestyle-exposed.json'
    );

    if (!fs.existsSync(storyPath)) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const storyData = fs.readFileSync(storyPath, 'utf8');
    const story = JSON.parse(storyData);

    // Transform to match the API format expected by PostDetail
    const transformedStory = {
      id: story.id,
      title: story.title,
      slug: story.slug,
      excerpt: story.excerpt,
      category: story.category,
      status: story.status,
      trending: story.trending,
      featured: story.featured,
      author: story.author,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      persona: story.persona,
      content: story.content,
      imageUrl: story.imageUrl,
      viewCount: story.viewCount,
      upvoteCount: story.upvoteCount,
      commentCount: story.commentCount,
      shareCount: story.shareCount,
      bookmarkCount: story.bookmarkCount,
      tags: story.tags,
      redditSource: story.redditSource,
      readingTime: story.readingTime,
      viral_score: story.viral_score,
    };

    return NextResponse.json(transformedStory);
  } catch (error) {
    console.error('Error loading test story:', error);
    return NextResponse.json(
      { error: 'Failed to load story' },
      { status: 500 }
    );
  }
}
