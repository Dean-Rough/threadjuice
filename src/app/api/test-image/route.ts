import { NextRequest, NextResponse } from 'next/server.js';
import { imageService } from '@/lib/imageService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, category' },
        { status: 400 }
      );
    }

    // console.log(`🧪 Testing intelligent image routing for: "${title.slice(0, 50)}..."`)

    const result = await imageService.findBestImageIntelligent(
      title,
      content,
      category
    );

    return NextResponse.json({
      success: true,
      result,
      test_info: {
        title: title.slice(0, 100),
        category,
        analysis: result.analysis || null,
      },
    });
  } catch (error) {
    console.error('Image test API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
