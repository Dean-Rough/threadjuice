import { NextResponse } from 'next/server.js';

export async function POST() {
  // This endpoint can be used to trigger cache clearing
  // In production, you'd want to add authentication here

  return NextResponse.json(
    {
      message: 'Cache clear requested',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}
