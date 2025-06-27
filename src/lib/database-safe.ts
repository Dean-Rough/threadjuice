import { createClient } from '@supabase/supabase-js';
import { getSafeEnv, isSupabaseConfigured } from './env-safe';

// Safe Supabase client initialization
function createSafeSupabaseClient() {
  const env = getSafeEnv();
  
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - using mock client');
    
    // Return a mock client that won't crash the app
    return {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            order: () => ({
              range: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' }, count: 0 }),
            }),
          }),
          order: () => ({
            range: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' }, count: 0 }),
          }),
          gte: () => ({
            order: () => ({
              range: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' }, count: 0 }),
            }),
          }),
          or: () => ({
            order: () => ({
              range: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' }, count: 0 }),
            }),
          }),
          range: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' }, count: 0 }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        }),
      }),
    };
  }

  try {
    return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return mock client on error
    return {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase initialization failed' } }),
            order: () => ({
              range: () => Promise.resolve({ data: [], error: { message: 'Supabase initialization failed' }, count: 0 }),
            }),
          }),
          order: () => ({
            range: () => Promise.resolve({ data: [], error: { message: 'Supabase initialization failed' }, count: 0 }),
          }),
          range: () => Promise.resolve({ data: [], error: { message: 'Supabase initialization failed' }, count: 0 }),
        }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase initialization failed' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase initialization failed' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase initialization failed' } }),
      }),
    };
  }
}

const supabase = createSafeSupabaseClient();

export default supabase;