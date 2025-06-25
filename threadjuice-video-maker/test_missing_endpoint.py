#!/usr/bin/env python
"""
Test the missing "Create TikTok Video" endpoint
"""

import requests
import json

API_KEY = "bc50a449-606c-47be-868c-032300550a77"
BASE_URL = "https://www.revid.ai/api/public/v2"

headers = {
    "key": API_KEY,
    "Content-Type": "application/json"
}

# Test story content
content = """
When 'Free' Comes at a Price: The Couchsurfing Horror Story

I found what seemed like the perfect place to stay for free through Couchsurfing. The host was friendly and the location was great. But when I arrived, things took a dark turn...

Visit ThreadJuice.com for more viral stories!
"""

print("🔍 Testing likely video creation endpoints...\n")

# Most likely endpoints based on API patterns
likely_endpoints = [
    "/projects",           # Since GET /projects works
    "/create-tiktok-video", # From the docs title
    "/videos",             # Standard REST pattern
    "/render",             # Common video API term
    "/generate-video",     # Descriptive name
]

# Test different payload structures
payloads = [
    # Simple
    {"text": content, "title": "ThreadJuice Test"},
    
    # Detailed
    {
        "script": content,
        "title": "ThreadJuice Test",
        "format": "vertical",
        "voice": "female",
        "template": "viral"
    },
    
    # Project-style (since /projects exists)
    {
        "name": "ThreadJuice Test",
        "content": content,
        "type": "tiktok",
        "settings": {
            "format": "vertical",
            "voice": "default"
        }
    }
]

for endpoint in likely_endpoints:
    print(f"📡 Testing: {BASE_URL}{endpoint}")
    
    for i, payload in enumerate(payloads):
        try:
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                headers=headers,
                json=payload,
                timeout=15
            )
            
            print(f"   Payload {i+1}: {response.status_code}")
            
            if response.status_code in [200, 201, 202]:
                print(f"   ✅ SUCCESS! Found the endpoint!")
                result = response.json()
                print(f"   📊 Response:")
                print(json.dumps(result, indent=2))
                
                # Save the working configuration
                with open("working_revid_config.json", "w") as f:
                    json.dump({
                        "endpoint": f"{BASE_URL}{endpoint}",
                        "payload": payload,
                        "response": result
                    }, f, indent=2)
                
                print(f"   💾 Saved working config to: working_revid_config.json")
                break
                
            elif response.status_code == 400:
                print(f"   ❌ Bad request - check payload format")
                print(f"      Error: {response.text[:150]}...")
            elif response.status_code == 422:
                print(f"   ❌ Validation error - wrong parameters")
                print(f"      Error: {response.text[:150]}...")
            else:
                print(f"   ⚠️  {response.status_code}: {response.text[:100]}...")
                
        except Exception as e:
            print(f"   💥 Error: {e}")
    
    print()

print("💡 If none worked, please:")
print("1. Go to https://www.revid.ai/create")
print("2. Click 'Get API Code' to see the exact endpoint")
print("3. Share the endpoint URL and payload structure")
print("\n🎯 We're very close - the API key works, just need the right endpoint!")