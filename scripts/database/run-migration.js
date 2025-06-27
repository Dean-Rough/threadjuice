#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error('Usage: node run-migration.js <migration-file>');
    console.error('Example: node run-migration.js database/migrations/001_add_vote_columns.sql');
    process.exit(1);
  }

  try {
    const migrationPath = path.resolve(migrationFile);
    const sql = await fs.readFile(migrationPath, 'utf8');
    
    console.log(`Running migration: ${migrationFile}`);
    console.log('SQL:', sql);
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct approach
      console.error('RPC method not available, executing SQL directly is not supported via Supabase client');
      console.error('Please run this migration directly in the Supabase SQL Editor:');
      console.error('https://app.supabase.com/project/[your-project-id]/editor');
      console.error('\nMigration SQL:');
      console.error(sql);
      throw error;
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();