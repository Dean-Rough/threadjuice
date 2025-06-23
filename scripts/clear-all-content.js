#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function clearAllContent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.log('❌ No Supabase credentials found');
    return;
  }

  const supabase = createClient(url, key);
  
  try {
    // Clear all posts
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (postsError) throw postsError;
    console.log('✅ Cleared all posts');

    // Clear personas (optional - keep them for consistency)
    // const { error: personasError } = await supabase
    //   .from('personas')
    //   .delete()
    //   .gt('id', 0);
    
    console.log('✅ All content cleared from database');
    
  } catch (error) {
    console.error('❌ Error clearing content:', error.message);
  }
}

clearAllContent();