import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/database';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  // Check authorization
  const secretPath = request.headers.get('referer')?.includes('tj-control-x7j9k');
  if (!secretPath) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action } = await params;

  try {
    switch (action) {
      case 'clear-cache':
        // Clear Next.js cache
        revalidatePath('/', 'layout');
        
        // Clear any cached data in database
        await supabase
          .from('cache')
          .delete()
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared successfully' 
        });

      case 'restart-crons':
        // Trigger immediate cron execution
        const cronEndpoints = [
          '/api/cron/generate-content',
          '/api/cron/update-trending'
        ];
        
        const results = await Promise.allSettled(
          cronEndpoints.map(endpoint => 
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4242'}${endpoint}`, {
              headers: {
                'Authorization': `Bearer ${process.env.CRON_SECRET}`
              }
            })
          )
        );
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        
        return NextResponse.json({ 
          success: true, 
          message: `Restarted ${successCount}/${cronEndpoints.length} cron jobs` 
        });

      case 'pause-all':
        // Set all controls to false
        const controls = {
          contentGeneration: false,
          seoOptimization: false,
          socialSharing: false,
          aiSearchOptimization: false
        };
        
        // Save to controls file
        const { writeFile } = await import('fs/promises');
        const path = await import('path');
        const controlsFile = path.default.join(process.cwd(), '.threadjuice-controls.json');
        await writeFile(controlsFile, JSON.stringify(controls, null, 2));
        
        // Update environment
        process.env.CONTENT_GENERATION_ENABLED = 'false';
        process.env.SEO_OPTIMIZATION_ENABLED = 'false';
        
        return NextResponse.json({ 
          success: true, 
          message: 'All operations paused' 
        });

      case 'fix-database':
        // Run database maintenance
        const { error: cleanupError } = await supabase
          .from('posts')
          .delete()
          .is('title', null);
        
        // Update missing slugs
        const { data: postsWithoutSlugs } = await supabase
          .from('posts')
          .select('id, title')
          .is('slug', null);
        
        if (postsWithoutSlugs && postsWithoutSlugs.length > 0) {
          for (const post of postsWithoutSlugs) {
            const slug = post.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');
            
            await supabase
              .from('posts')
              .update({ slug })
              .eq('id', post.id);
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Database maintenance completed' 
        });

      default:
        return NextResponse.json({ 
          error: 'Unknown action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error(`Action ${action} failed:`, error);
    return NextResponse.json({ 
      error: `Action failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}