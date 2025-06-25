#!/usr/bin/env python
"""
Test Revid.ai API V2 with correct endpoints
"""

import requests
import json
import os
import sys
import time
from pathlib import Path

print("🎬 Testing Revid.ai API V2\n")

# API Configuration
API_KEY = "bc50a449-606c-47be-868c-032300550a77"
BASE_URL = "https://www.revid.ai/api/public/v2"

headers = {
    "key": API_KEY,
    "Content-Type": "application/json"
}

# Load env and get story
sys.path.append(str(Path(__file__).parent))

env_path = Path(__file__).parent.parent / '.env.local'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value.strip('"\'')

from threadjuice.story_fetcher import ThreadJuiceFetcher

fetcher = ThreadJuiceFetcher()
story = fetcher.get_story_by_slug("when-free-comes-at-a-price-the-couchsurfing-horror-story")

if not story:
    print("❌ Story not found!")
    sys.exit(1)

print(f"📚 Story: {story.title[:60]}...")
print(f"📝 Content: {len(story.selftext)} characters")

# Test 1: Get Projects (check API access)
print("\n1️⃣ Testing API access...")

try:
    response = requests.get(f"{BASE_URL}/projects?limit=10", headers=headers)
    print(f"   Projects endpoint: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ API access working!")
        projects = response.json()
        print(f"   📊 Found {len(projects)} projects")
    elif response.status_code == 401:
        print("   🔐 Authentication failed - check API key")
        sys.exit(1)
    else:
        print(f"   ⚠️  Error: {response.text}")
        
except Exception as e:
    print(f"   💥 Error: {e}")
    sys.exit(1)

# Test 2: Try common video creation endpoints
print("\n2️⃣ Testing video creation endpoints...")

# Prepare content for video
video_content = f"""
{story.title}

{story.selftext[:400]}...

Visit ThreadJuice.com for more viral stories!
"""

# Common video creation payloads
test_payloads = [
    # Simple text payload
    {
        "text": video_content,
        "title": story.title
    },
    # More detailed payload
    {
        "script": video_content,
        "title": story.title,
        "template": "viral",
        "format": "vertical",
        "voice": "default"
    },
    # Revid-style payload (based on their patterns)
    {
        "content": video_content,
        "title": story.title,
        "type": "text",
        "format": "tiktok"
    }
]

# Test different endpoint patterns
video_endpoints = [
    "/create",
    "/videos",
    "/video/create", 
    "/create-video",
    "/generate",
    "/tiktok/create",
    "/projects/create"
]

for endpoint in video_endpoints:
    print(f"\n📡 Testing: {endpoint}")
    
    for i, payload in enumerate(test_payloads):
        try:
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            print(f"   Payload {i+1}: {response.status_code}")
            
            if response.status_code in [200, 201, 202]:
                print(f"   ✅ SUCCESS!")
                result = response.json()
                print(f"   📊 Response: {json.dumps(result, indent=2)}")
                
                # Check for important fields
                if 'video_url' in result:
                    print(f"   🎬 Video URL: {result['video_url']}")
                elif 'project_id' in result or 'pid' in result:
                    project_id = result.get('project_id') or result.get('pid')
                    print(f"   🆔 Project ID: {project_id}")
                    
                    # Monitor video generation
                    print(f"   ⏳ Monitoring video generation...")
                    for attempt in range(10):  # Check for 5 minutes
                        time.sleep(30)
                        status_response = requests.get(
                            f"{BASE_URL}/projects/{project_id}",
                            headers=headers
                        )
                        if status_response.status_code == 200:
                            status_data = status_response.json()
                            print(f"   📊 Status: {status_data}")
                            if 'video_url' in status_data:
                                print(f"   🎉 Video ready: {status_data['video_url']}")
                                break
                        
                break
                
            elif response.status_code == 400:
                print(f"   ❌ Bad request: {response.text[:100]}...")
            elif response.status_code == 402:
                print(f"   💳 Payment/credits required")
            elif response.status_code == 404:
                print(f"   🚫 Endpoint not found")
            else:
                print(f"   ⚠️  {response.text[:100]}...")
                
        except Exception as e:
            print(f"   💥 Error: {e}")

# Test 3: Check the "Get API Code" suggestion
print(f"\n3️⃣ Manual steps to get correct parameters:")
print(f"   1. Go to: https://www.revid.ai/create")
print(f"   2. Set up your video parameters")
print(f"   3. Click 'Get API Code' button")
print(f"   4. Copy the exact payload structure")

print(f"\n📋 Summary:")
print(f"   API Key: {API_KEY}")
print(f"   Base URL: {BASE_URL}")
print(f"   Auth Header: 'key': API_KEY")
print(f"   Story Title: {story.title}")
print(f"   Content Length: {len(video_content)} chars")