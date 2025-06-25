#!/usr/bin/env python
"""
Test the /render endpoint with correct parameters
"""

import requests
import json
import time

API_KEY = "bc50a449-606c-47be-868c-032300550a77"
BASE_URL = "https://www.revid.ai/api/public/v2"

headers = {
    "key": API_KEY,
    "Content-Type": "application/json"
}

# ThreadJuice story content
content = """
When 'Free' Comes at a Price: The Couchsurfing Horror Story

I found what seemed like the perfect place to stay for free through Couchsurfing. The host was friendly and the location was great. But when I arrived, things took a dark turn that I never expected. What started as a simple housing arrangement became a nightmare that taught me to always trust my instincts.

Visit ThreadJuice.com for more viral stories like this!
"""

print("🎬 Testing /render endpoint with correct parameters...\n")

# Correct payload structure based on error message
payload = {
    "creationParams": {
        "inputText": content
    }
}

print(f"📝 Content: {content[:100]}...")
print(f"📊 Payload structure: creationParams.inputText")

try:
    print(f"\n📡 POST {BASE_URL}/render")
    
    response = requests.post(
        f"{BASE_URL}/render",
        headers=headers,
        json=payload,
        timeout=30
    )
    
    print(f"📊 Status: {response.status_code}")
    print(f"📊 Response: {response.text}")
    
    if response.status_code in [200, 201, 202]:
        print("🎉 SUCCESS! Video creation started!")
        result = response.json()
        print(json.dumps(result, indent=2))
        
        # Check for project ID or job ID
        if 'pid' in result or 'project_id' in result or 'job_id' in result:
            job_id = result.get('pid') or result.get('project_id') or result.get('job_id')
            print(f"\n⏳ Monitoring video generation (ID: {job_id})...")
            
            # Poll for completion
            for attempt in range(20):  # 10 minutes max
                time.sleep(30)
                
                # Check project status
                status_response = requests.get(
                    f"{BASE_URL}/projects?limit=10",
                    headers=headers
                )
                
                if status_response.status_code == 200:
                    projects = status_response.json()
                    for project in projects:
                        if str(project.get('id')) == str(job_id) or str(project.get('pid')) == str(job_id):
                            print(f"🔄 Attempt {attempt + 1}: {project.get('status', 'processing')}")
                            
                            if project.get('video_url') or project.get('url'):
                                video_url = project.get('video_url') or project.get('url')
                                print(f"\n🎉 VIDEO READY!")
                                print(f"🎬 Video URL: {video_url}")
                                
                                # Save success info
                                with open("threadjuice_revid_success.json", "w") as f:
                                    json.dump({
                                        "success": True,
                                        "video_url": video_url,
                                        "project": project,
                                        "original_content": content
                                    }, f, indent=2)
                                
                                print(f"💾 Saved to: threadjuice_revid_success.json")
                                exit()
                
                print(f"⏳ Still processing... (attempt {attempt + 1}/20)")
        
    elif response.status_code == 400:
        print("❌ Bad request - missing parameters:")
        error_data = response.json()
        print(json.dumps(error_data, indent=2))
        
    elif response.status_code == 402:
        print("💳 Payment required - check account credits")
        
    else:
        print(f"⚠️  Error {response.status_code}: {response.text}")

except Exception as e:
    print(f"💥 Error: {e}")

print(f"\n📋 Next steps if this works:")
print(f"1. ✅ We have the working endpoint: /render")
print(f"2. ✅ We have the correct payload structure")
print(f"3. 🚀 We can automate ThreadJuice video creation!")
print(f"4. 📱 Videos will be TikTok-ready automatically")