import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

// Store controls in a JSON file (in production, use database)
const CONTROLS_FILE = path.join(process.cwd(), '.threadjuice-controls.json');

const DEFAULT_CONTROLS = {
  contentGeneration: true,
  seoOptimization: true,
  socialSharing: true,
  aiSearchOptimization: true
};

async function getControls() {
  try {
    const data = await readFile(CONTROLS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return DEFAULT_CONTROLS;
  }
}

async function saveControls(controls: any) {
  await writeFile(CONTROLS_FILE, JSON.stringify(controls, null, 2));
}

export async function GET(request: NextRequest) {
  // Check authorization
  const secretPath = request.headers.get('referer')?.includes('tj-control-x7j9k');
  if (!secretPath) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const controls = await getControls();
  return NextResponse.json(controls);
}

export async function POST(request: NextRequest) {
  // Check authorization
  const secretPath = request.headers.get('referer')?.includes('tj-control-x7j9k');
  if (!secretPath) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    const currentControls = await getControls();
    const newControls = { ...currentControls, ...updates };
    
    await saveControls(newControls);
    
    // Update environment variables for cron jobs
    if ('contentGeneration' in updates) {
      process.env.CONTENT_GENERATION_ENABLED = updates.contentGeneration ? 'true' : 'false';
    }
    
    if ('seoOptimization' in updates) {
      process.env.SEO_OPTIMIZATION_ENABLED = updates.seoOptimization ? 'true' : 'false';
    }
    
    return NextResponse.json({ success: true, controls: newControls });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update controls' }, { status: 500 });
  }
}