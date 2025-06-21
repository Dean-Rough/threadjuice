#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('🚀 Setting up ThreadJuice database schema...');
  
  try {
    // Load and execute schema
    const schema = readFileSync('database/schema.sql', 'utf8');
    
    // Note: We can't execute raw SQL with anon key
    // Instead, let's create the basic tables manually
    console.log('📊 Creating basic tables...');
    
    // Create personas table first
    const { error: personasError } = await supabase.rpc('create_personas_table', {});
    console.log('Personas table result:', personasError ? personasError.message : '✅ Success');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// For now, let's test the connection and see what we can do
async function testAndSetup() {
  console.log('🔍 Testing Supabase setup...');
  
  try {
    // Test if we can create a simple table using SQL
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql: 'SELECT version();' 
      });
    
    if (error) {
      console.log('❌ Cannot execute SQL directly:', error.message);
      console.log('💡 Schema needs to be set up via Supabase Dashboard');
      console.log('🔗 Go to: ' + supabaseUrl.replace('supabase.co', 'supabase.co/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/sql'));
      return;
    }
    
    console.log('✅ SQL execution available:', data);
    
  } catch (err) {
    console.log('📋 Manual setup required. Copy schema.sql to Supabase SQL Editor.');
    console.log('🔗 Dashboard: ' + supabaseUrl);
  }
}

testAndSetup();