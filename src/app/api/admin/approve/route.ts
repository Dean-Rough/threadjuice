import { NextResponse } from 'next/server.js';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // console.log('Auto-approving all draft posts...');

    // Get count of draft posts first
    const draftCount = await prisma.post.count({
      where: { status: 'draft' },
    });

    // console.log(`Found ${draftCount} draft posts`);

    // Auto-approve all draft posts
    const result = await prisma.post.updateMany({
      where: { status: 'draft' },
      data: { status: 'published' },
    });

    // console.log(`Auto-approved ${result.count} posts`);

    // Get updated count of published posts
    const publishedCount = await prisma.post.count({
      where: { status: 'published' },
    });

    return NextResponse.json({
      success: true,
      message: 'Auto-approval completed',
      results: {
        draftsFound: draftCount,
        approved: result.count,
        totalPublished: publishedCount,
      },
    });
  } catch (error) {
    console.error('Auto-approval failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Auto-approval failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await Promise.all([
      prisma.post.count({ where: { status: 'draft' } }),
      prisma.post.count({ where: { status: 'published' } }),
      prisma.post.count(),
    ]);

    return NextResponse.json({
      drafts: stats[0],
      published: stats[1],
      total: stats[2],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
