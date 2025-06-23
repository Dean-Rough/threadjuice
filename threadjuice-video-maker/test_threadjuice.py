#!/usr/bin/env python
"""
Quick test of ThreadJuice integration
"""

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

print("🧪 Testing ThreadJuice Video Maker Integration...\n")

# Test 1: Story Fetcher
print("1️⃣ Testing Story Fetcher...")
try:
    from threadjuice.story_fetcher import ThreadJuiceFetcher
    
    fetcher = ThreadJuiceFetcher()
    stories = fetcher.get_stories(limit=3)
    
    if stories:
        print(f"✅ Found {len(stories)} stories:")
        for i, story in enumerate(stories, 1):
            print(f"   {i}. {story.title[:50]}...")
            print(f"      Category: {story.data.get('category')}")
            print(f"      Upvotes: {story.score}")
    else:
        print("⚠️  No stories found in database")
except Exception as e:
    print(f"❌ Story fetcher error: {e}")

# Test 2: Pexels Videos
print("\n2️⃣ Testing Pexels Video Integration...")
try:
    from threadjuice.pexels_videos import PexelsVideoFetcher
    
    if os.getenv('PEXELS_API_KEY'):
        pexels = PexelsVideoFetcher()
        videos = pexels.search_videos("office", per_page=2)
        
        if videos:
            print(f"✅ Found {len(videos)} videos")
            for video in videos:
                print(f"   - {video.get('user', {}).get('name')} ({video.get('duration')}s)")
        else:
            print("⚠️  No videos found")
    else:
        print("⚠️  No PEXELS_API_KEY set - videos will use defaults")
except Exception as e:
    print(f"❌ Pexels error: {e}")

# Test 3: Environment Check
print("\n3️⃣ Checking Environment...")
required = {
    'NEXT_PUBLIC_SUPABASE_URL': '✅' if os.getenv('NEXT_PUBLIC_SUPABASE_URL') else '❌',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': '✅' if os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') else '❌',
    'PEXELS_API_KEY': '✅' if os.getenv('PEXELS_API_KEY') else '⚠️ ',
}

for var, status in required.items():
    print(f"   {status} {var}")

print("\n✨ Test complete!")
print("\nTo create your first video:")
print("   python threadjuice_main.py")