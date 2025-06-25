#!/usr/bin/env python
"""
API Discovery Script - Test common endpoints with the provided API key
"""

import requests
import json
import os
import sys
from pathlib import Path

print("🔍 API Discovery for Video Generation\n")

API_KEY = "bc50a449-606c-47be-868c-032300550a77"

# Test different base URLs and common endpoints
test_configs = [
    # Typeframes (common video API)
    {
        "base": "https://api.typeframes.com",
        "endpoints": ["/v1/video", "/v1/create", "/video/create", "/create"],
        "headers": {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    },
    # Revid alternatives
    {
        "base": "https://api.revid.ai", 
        "endpoints": ["/v1/video", "/v1/create", "/create", "/generate"],
        "headers": {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    },
    # Another common pattern
    {
        "base": "https://app.revid.ai/api",
        "endpoints": ["/v1/video", "/create", "/generate"],
        "headers": {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    },
    # Direct domain patterns
    {
        "base": "https://revid.ai/api",
        "endpoints": ["/v1/create", "/create", "/video"],
        "headers": {"Authorization": API_KEY, "Content-Type": "application/json"}
    }
]

# Test payload
payload = {
    "text": "This is a test story from ThreadJuice about viral content creation.",
    "title": "Test ThreadJuice Story",
    "format": "vertical",
    "style": "viral"
}

print("📡 Testing API endpoints with discovery...\n")

for config in test_configs:
    base_url = config["base"]
    print(f"🌐 Testing base: {base_url}")
    
    for endpoint in config["endpoints"]:
        full_url = base_url + endpoint
        headers = config["headers"]
        
        print(f"  📍 {endpoint}")
        
        try:
            # Test GET first (for API info)
            get_response = requests.get(full_url, headers=headers, timeout=5)
            print(f"    GET {get_response.status_code}: {get_response.text[:100]}...")
            
            # Test POST with payload
            post_response = requests.post(full_url, headers=headers, json=payload, timeout=10)
            print(f"    POST {post_response.status_code}: {post_response.text[:100]}...")
            
            if post_response.status_code in [200, 201, 202]:
                print(f"    ✅ SUCCESS! Working endpoint found:")
                print(f"    URL: {full_url}")
                print(f"    Headers: {headers}")
                print(f"    Response: {post_response.json()}")
                break
                
        except requests.exceptions.RequestException as e:
            print(f"    ❌ {str(e)[:50]}...")
            
    print()

# Test OPTIONS for CORS/API discovery
print("🔍 Testing OPTIONS requests for API discovery...")
for config in test_configs:
    try:
        response = requests.options(config["base"], timeout=5)
        if response.status_code < 400:
            print(f"✅ {config['base']} responds to OPTIONS")
            if "allow" in response.headers:
                print(f"   Allowed methods: {response.headers['allow']}")
    except:
        pass

print("\n💡 Manual Testing Steps:")
print("1. Check the Postman docs URL in a browser")
print("2. Look for 'Base URL' or 'Environment' section")
print("3. Find the exact endpoint paths")
print("4. Check authentication method (Bearer vs X-API-Key)")
print("\n📧 If still no luck, try:")
print("- Contact the API provider for correct base URL")
print("- Check if it's a different service (Typeframes, etc.)")
print("- Verify the API key is active")