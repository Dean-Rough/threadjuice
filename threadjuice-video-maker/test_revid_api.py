#!/usr/bin/env python
"""
Test script for Revid.ai API
"""

import requests
import json
import os
import sys
from pathlib import Path

# Add to path
sys.path.append(str(Path(__file__).parent))

# Load env vars
env_path = Path(__file__).parent.parent / '.env.local'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value.strip('"\'')

print("🧪 Testing Revid.ai API\n")

# API Configuration
API_KEY = "bc50a449-606c-47be-868c-032300550a77"

# Get ThreadJuice story for testing
from threadjuice.story_fetcher import ThreadJuiceFetcher

fetcher = ThreadJuiceFetcher()
story = fetcher.get_story_by_slug("when-free-comes-at-a-price-the-couchsurfing-horror-story")

if not story:
    print("❌ Story not found!")
    sys.exit(1)

print(f"📚 Testing with story: {story.title[:50]}...")

# Prepare content for API
content = f"""
{story.title}

{story.selftext[:500]}...

Visit ThreadJuice.com for more viral stories!
"""

print(f"📝 Content length: {len(content)} characters")

# Common API endpoints to try (based on typical video API patterns)
potential_endpoints = [
    "https://api.revid.ai/v1/create",
    "https://api.revid.ai/v1/generate", 
    "https://api.revid.ai/v1/video/create",
    "https://api.revid.ai/create-video",
    "https://revid.ai/api/v1/create",
    "https://app.revid.ai/api/create"
]

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

# Test payload
payload = {
    "text": content,
    "title": story.title,
    "format": "vertical",
    "duration": "short",
    "style": "viral",
    "voice": "default"
}

print("\n🔍 Testing potential API endpoints...")

for endpoint in potential_endpoints:
    print(f"\n📡 Testing: {endpoint}")
    
    try:
        # Try POST request
        response = requests.post(
            endpoint, 
            headers=headers, 
            json=payload,
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Success!")
            print(f"   Response: {response.json()}")
            break
        elif response.status_code == 404:
            print("   ❌ Endpoint not found")
        elif response.status_code == 401:
            print("   🔐 Authentication failed")
        elif response.status_code == 403:
            print("   🚫 Forbidden")
        else:
            print(f"   ⚠️  Error: {response.text[:200]}...")
            
    except requests.exceptions.ConnectionError:
        print("   🔌 Connection failed")
    except requests.exceptions.Timeout:
        print("   ⏰ Request timeout")
    except Exception as e:
        print(f"   💥 Error: {e}")

print("\n💡 Alternative approach:")
print("   Since Revid.ai might not have a public API,")
print("   consider using their web interface directly")
print("   or try other services like:")
print("   - Pictory.ai API")
print("   - FlexClip API") 
print("   - Custom solution with OpenAI + MoviePy")

# Test if it's actually a different service
print("\n🔬 Testing if API key works with other common patterns...")

# Test generic endpoints
test_endpoints = [
    "https://api.typeframes.com/v1/create",
    "https://app.typeframes.com/api/create"
]

for endpoint in test_endpoints:
    print(f"\n📡 Testing alternative: {endpoint}")
    try:
        response = requests.post(
            endpoint,
            headers=headers,
            json=payload,
            timeout=5
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Found working endpoint!")
            print(f"   Response: {response.json()}")
            break
    except:
        print("   ❌ No response")

print("\n📋 Summary:")
print("   If no endpoints worked, the API key might be for:")
print("   1. A different service")
print("   2. A private/beta API")
print("   3. Requires different authentication")
print("\n   Recommendation: Contact the service provider for API docs")