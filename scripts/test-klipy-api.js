#!/usr/bin/env node

/**
 * Test Klipy API Connection
 * Run with: node scripts/test-klipy-api.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const API_KEY =
  process.env.NEXT_PUBLIC_KLIPY_API_KEY || process.env.KLIPY_API_KEY;
const BASE_URL = 'https://api.klipy.co/api/v1';
const CUSTOMER_ID = 'threadjuice-user-001';

console.log('🔧 Testing Klipy API Connection...');
console.log('API Key:', API_KEY ? `${API_KEY.slice(0, 10)}...` : 'NOT FOUND');
console.log('---');

async function testSearchAPI(searchTerm) {
  const url = `${BASE_URL}/${API_KEY}/gifs/search`;
  const params = new URLSearchParams({
    q: searchTerm,
    customer_id: CUSTOMER_ID,
    per_page: '5',
    content_filter: 'medium',
  });

  console.log(`\n🔍 Testing search for: "${searchTerm}"`);
  console.log(`URL: ${url}?${params.toString()}`);

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    console.log(
      `Response Headers:`,
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log(`Response Body:`, JSON.stringify(data, null, 2));

    if (data.result && data.data && data.data.length > 0) {
      console.log(`\n✅ Found ${data.data.length} GIFs:`);
      data.data.forEach((gif, i) => {
        console.log(`${i + 1}. ${gif.title || 'Untitled'}`);
        console.log(`   ID: ${gif.id}`);
        console.log(`   URL: ${gif.file?.gif || gif.url || 'No URL'}`);
        console.log(
          `   Size: ${gif.file?.width || '?'}x${gif.file?.height || '?'}`
        );
      });
    } else {
      console.log('❌ No GIFs found in response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

async function testTrendingAPI() {
  const url = `${BASE_URL}/${API_KEY}/gifs/trending`;
  const params = new URLSearchParams({
    customer_id: CUSTOMER_ID,
    per_page: '5',
  });

  console.log(`\n📈 Testing trending GIFs`);
  console.log(`URL: ${url}?${params.toString()}`);

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    console.log(`Response Body:`, JSON.stringify(data, null, 2));

    if (data.result && data.data && data.data.length > 0) {
      console.log(`\n✅ Found ${data.data.length} trending GIFs`);
    } else {
      console.log('❌ No trending GIFs found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function runTests() {
  if (!API_KEY) {
    console.error('❌ No Klipy API key found in environment variables!');
    console.error('Please set NEXT_PUBLIC_KLIPY_API_KEY in .env or .env.local');
    process.exit(1);
  }

  // Test different search terms
  const searchTerms = [
    'popcorn eating',
    'mind blown',
    'this is fine',
    'drama',
    'shocked',
  ];

  for (const term of searchTerms) {
    await testSearchAPI(term);
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test trending
  await testTrendingAPI();
}

runTests().catch(console.error);
