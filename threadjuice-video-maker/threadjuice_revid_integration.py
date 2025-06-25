#!/usr/bin/env python
"""
ThreadJuice + Revid.ai Integration
Ready to use once you upgrade to Growth plan
"""

import requests
import json
import time
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

class RevidVideoCreator:
    def __init__(self):
        self.api_key = "bc50a449-606c-47be-868c-032300550a77"
        self.base_url = "https://www.revid.ai/api/public/v2"
        self.headers = {
            "key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def create_video_from_story(self, story):
        """Create a TikTok video from ThreadJuice story"""
        
        # Format content for maximum viral potential
        content = f"""
{story.title}

{story.selftext[:400]}...

🔥 Read the full story at ThreadJuice.com
💬 What would you do in this situation?
👆 Follow @threadjuice for more viral stories

#threadjuice #viral #story #drama #reddit
"""
        
        payload = {
            "creationParams": {
                "inputText": content
            }
        }
        
        print(f"🎬 Creating video for: {story.title[:50]}...")
        print(f"📝 Content length: {len(content)} characters")
        
        try:
            # Create video
            response = requests.post(
                f"{self.base_url}/render",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            print(f"📊 API Response: {response.status_code}")
            
            if response.status_code in [200, 201, 202]:
                result = response.json()
                print("✅ Video creation started!")
                
                # Get project ID
                project_id = result.get('pid') or result.get('project_id') or result.get('id')
                
                if project_id:
                    print(f"🆔 Project ID: {project_id}")
                    return self.monitor_video_creation(project_id, story)
                else:
                    print("⚠️  No project ID returned")
                    return None
                    
            elif response.status_code == 402:
                print("💳 Insufficient credits - add more credits to your account")
                return None
                
            elif response.status_code == 500:
                error = response.json()
                if "No active subscription" in error.get('error', ''):
                    print("🔒 Please upgrade to Growth plan: https://www.revid.ai/pricing")
                else:
                    print(f"❌ Server error: {error}")
                return None
                
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            print(f"💥 Error: {e}")
            return None
    
    def monitor_video_creation(self, project_id, story):
        """Monitor video creation progress"""
        
        print(f"⏳ Monitoring video creation...")
        
        for attempt in range(30):  # 15 minutes max
            time.sleep(30)
            
            try:
                # Check all projects
                response = requests.get(
                    f"{self.base_url}/projects?limit=20",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    projects = response.json()
                    
                    for project in projects:
                        if str(project.get('id')) == str(project_id):
                            status = project.get('status', 'processing')
                            print(f"🔄 Attempt {attempt + 1}: {status}")
                            
                            # Check for completion
                            if project.get('video_url'):
                                video_url = project['video_url']
                                print(f"\n🎉 VIDEO READY!")
                                print(f"🎬 Video URL: {video_url}")
                                
                                # Save result
                                result = {
                                    "story_slug": story.data.get('slug'),
                                    "story_title": story.title,
                                    "video_url": video_url,
                                    "project_id": project_id,
                                    "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                                    "project_data": project
                                }
                                
                                results_dir = Path("results")
                                results_dir.mkdir(exist_ok=True)
                                
                                result_file = results_dir / f"revid_{story.data.get('slug')}.json"
                                with open(result_file, "w") as f:
                                    json.dump(result, f, indent=2)
                                
                                print(f"💾 Saved to: {result_file}")
                                return video_url
                            
                            elif status == 'failed':
                                print(f"❌ Video creation failed")
                                return None
                
            except Exception as e:
                print(f"⚠️  Monitoring error: {e}")
        
        print(f"⏰ Timeout - video may still be processing")
        return None
    
    def create_batch_videos(self, story_slugs):
        """Create videos for multiple stories"""
        
        from threadjuice.story_fetcher import ThreadJuiceFetcher
        fetcher = ThreadJuiceFetcher()
        
        results = []
        
        for slug in story_slugs:
            print(f"\n{'='*60}")
            story = fetcher.get_story_by_slug(slug)
            
            if story:
                video_url = self.create_video_from_story(story)
                results.append({
                    "slug": slug,
                    "title": story.title,
                    "video_url": video_url,
                    "success": video_url is not None
                })
                
                # Wait between videos to avoid rate limits
                if video_url:
                    print(f"⏳ Waiting 60 seconds before next video...")
                    time.sleep(60)
            else:
                print(f"❌ Story not found: {slug}")
        
        return results

def main():
    """Main function for testing"""
    
    creator = RevidVideoCreator()
    
    # Test with our story
    from threadjuice.story_fetcher import ThreadJuiceFetcher
    fetcher = ThreadJuiceFetcher()
    story = fetcher.get_story_by_slug("when-free-comes-at-a-price-the-couchsurfing-horror-story")
    
    if story:
        video_url = creator.create_video_from_story(story)
        
        if video_url:
            print(f"\n🎉 SUCCESS!")
            print(f"📱 Your ThreadJuice video is ready for TikTok/Reels!")
            print(f"🎬 Video: {video_url}")
        else:
            print(f"\n❌ Video creation failed")
            print(f"💡 Make sure you're on the Growth plan: https://www.revid.ai/pricing")
    else:
        print("❌ Test story not found")

if __name__ == "__main__":
    main()