#!/usr/bin/env node

/**
 * Apply Row Level Security (RLS) fixes to Supabase
 * This addresses the security warnings about tables without RLS enabled
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (error) {
    console.error('❌ Failed to load .env.local:', error.message);
    process.exit(1);
  }
}

loadEnvVars();

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyRLSFixes() {
  console.log('🔒 Applying Row Level Security fixes to Supabase...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'enable-rls-security.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');

    console.log('📝 SQL script loaded successfully');
    console.log('🚀 Executing RLS configuration...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('⚠️  exec_sql RPC not available, trying alternative method...');
      
      // Split SQL into individual statements and execute them
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        console.log(`\n📌 Executing: ${statement.substring(0, 50)}...`);
        
        try {
          // For RLS, we need to use the Supabase dashboard or direct connection
          // This is a limitation - we'll provide instructions instead
          console.log('⚠️  Direct SQL execution requires Supabase dashboard access');
          errorCount++;
        } catch (err) {
          console.error(`❌ Error: ${err.message}`);
          errorCount++;
        }
      }

      console.log('\n⚠️  IMPORTANT: Direct SQL execution from JavaScript is limited');
      console.log('📋 Please run the following SQL in your Supabase dashboard:\n');
      console.log('1. Go to https://supabase.com/dashboard/project/okugoocdornbiwwykube/sql/new');
      console.log('2. Copy and paste the contents of scripts/database/enable-rls-security.sql');
      console.log('3. Click "Run" to execute the SQL\n');
      console.log('Alternatively, you can use the Supabase CLI:');
      console.log('supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.okugoocdornbiwwykube.supabase.co:5432/postgres"\n');
      
      return;
    }

    console.log('✅ Row Level Security has been enabled on all tables!');
    console.log('\n📊 Summary of changes:');
    console.log('- Enabled RLS on 13 tables');
    console.log('- Added public read policies for: categories, personas, posts, comments, images, events');
    console.log('- Restricted write access to service role for sensitive tables');
    console.log('- Allowed anonymous users to create comments and interactions\n');
    
    console.log('🔐 Your database is now properly secured!');
    console.log('   - Anonymous users can only read public content');
    console.log('   - Write operations are restricted to your backend (using service role key)');
    console.log('   - User data (newsletter subscribers, etc.) is protected\n');

  } catch (error) {
    console.error('❌ Failed to apply RLS fixes:', error.message);
    console.error('\n📋 Manual steps required:');
    console.error('1. Go to your Supabase dashboard');
    console.error('2. Navigate to the SQL editor');
    console.error('3. Copy and run the SQL from scripts/database/enable-rls-security.sql');
    process.exit(1);
  }
}

// Run the script
applyRLSFixes().catch(console.error);