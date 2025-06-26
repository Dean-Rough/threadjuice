#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error('❌ Please provide a migration file path');
    console.error('   Usage: npm run db:migrate <migration-file>');
    process.exit(1);
  }

  try {
    // Read the migration file
    const migrationPath = path.resolve(migrationFile);
    const sql = await fs.readFile(migrationPath, 'utf-8');
    
    console.log(`📄 Running migration: ${migrationFile}`);
    console.log('⏳ Executing SQL...\n');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try a direct query
      console.log('ℹ️  exec_sql not available, attempting direct execution...');
      
      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error: stmtError } = await supabase.rpc('query', { 
          query_string: statement 
        });
        
        if (stmtError) {
          throw stmtError;
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.details) {
      console.error('   Details:', error.details);
    }
    if (error.hint) {
      console.error('   Hint:', error.hint);
    }
    process.exit(1);
  }
}

// Add command to package.json
console.log('\n💡 To run this migration, use:');
console.log('   node scripts/run-migration.js database/migrations/001_add_author_to_posts.sql');
console.log('\n   Or add to package.json:');
console.log('   "db:migrate": "node scripts/run-migration.js"');

runMigration();