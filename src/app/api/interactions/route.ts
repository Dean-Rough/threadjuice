import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const InteractionSchema = z.object({
  post_id: z.string().uuid(),
  interaction_type: z.enum(['upvote', 'downvote', 'bookmark', 'share', 'view']),
  metadata: z
    .object({
      share_platform: z
        .enum(['twitter', 'facebook', 'reddit', 'copy'])
        .optional(),
      user_agent: z.string().optional(),
      referrer: z.string().url().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = InteractionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { post_id, interaction_type, metadata } = validationResult.data;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: post_id },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: 'NOT_FOUND',
          message: 'Post not found',
        },
        { status: 404 }
      );
    }

    // Get client IP for anonymous tracking
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0]
      : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create interaction record
    const interaction = await prisma.userInteraction.create({
      data: {
        postId: post_id,
        interactionType: interaction_type,
        metadata,
        ipAddress: ip,
        userAgent,
      },
    });

    // Get updated count for this interaction type
    const newCount = await prisma.userInteraction.count({
      where: {
        postId: post_id,
        interactionType: interaction_type,
      },
    });

    // Update the post's counter based on interaction type
    const updateData: any = {};
    switch (interaction_type) {
      case 'upvote':
        updateData.upvoteCount = newCount;
        break;
      case 'share':
        updateData.shareCount = newCount;
        break;
      case 'bookmark':
        updateData.bookmarkCount = newCount;
        break;
      case 'view':
        updateData.viewCount = newCount;
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.post.update({
        where: { id: post_id },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      interaction_id: interaction.id,
      new_count: newCount,
    });
  } catch (error) {
    console.error('Interactions API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to record interaction',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
