#!/usr/bin/env python
"""
Test Typeframes API (common video generation service)
"""

import requests
import json
import os
import sys
from pathlib import Path

print("🎬 Testing Typeframes API\n")

API_KEY = "bc50a449-606c-47be-868c-032300550a77"

# Get ThreadJuice story
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

if story:
    print(f"📚 Story: {story.title[:50]}...")
    
    # Typeframes API patterns
    typeframes_endpoints = [
        "https://api.typeframes.com/v1/videos",
        "https://api.typeframes.com/videos", 
        "https://typeframes.com/api/v1/videos",
        "https://app.typeframes.com/api/videos"
    ]
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    # Typeframes-style payload
    payload = {
        "script": story.selftext[:500] + "...",
        "title": story.title,
        "template": "viral",
        "format": "vertical",
        "voice": "default",
        "background": "relevant"
    }
    
    print("🔍 Testing Typeframes endpoints...")
    
    for endpoint in typeframes_endpoints:
        print(f"\n📡 Testing: {endpoint}")
        
        try:
            response = requests.post(
                endpoint,
                headers=headers,
                json=payload,
                timeout=15
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ Success!")
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)}")
                
                # Check for video URL or job ID
                if 'video_url' in result:
                    print(f"   🎬 Video URL: {result['video_url']}")
                elif 'job_id' in result:
                    print(f"   ⏳ Job ID: {result['job_id']} (processing)")
                    
                break
                
            elif response.status_code == 401:
                print("   🔐 Authentication failed - check API key")
            elif response.status_code == 402:
                print("   💳 Payment required - check account credits")
            elif response.status_code == 404:
                print("   ❌ Endpoint not found")
            else:
                print(f"   ⚠️  Error: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print("   🔌 Connection failed")
        except Exception as e:
            print(f"   💥 Error: {e}")
    
    print("\n" + "="*50)
    print("💡 Alternative Services to Try:")
    print("="*50)
    
    services = [
        ("Pictory.ai", "https://app.pictory.ai/api/"),
        ("Lumen5", "https://api.lumen5.com/"),
        ("InVideo", "https://api.invideo.io/"),
        ("Synthesia", "https://api.synthesia.io/"),
        ("Fliki", "https://api.fliki.ai/")
    ]
    
    for name, base_url in services:
        try:
            test_url = f"{base_url}v1/videos"
            response = requests.post(
                test_url,
                headers=headers,
                json={"test": True},
                timeout=5
            )
            print(f"✅ {name}: {response.status_code}")
        except:
            print(f"❌ {name}: No response")

else:
    print("❌ No story found for testing")

print("\n📋 Next Steps:")
print("1. Check the exact Postman documentation URL")
print("2. Look for base URL in the docs")
print("3. Try the web interface for now: https://www.revid.ai/")
print("4. Consider Typeframes or Pictory alternatives")