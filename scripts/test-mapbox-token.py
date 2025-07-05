#!/usr/bin/env python3
"""
Test Mapbox token accessibility in GitHub Actions environment
"""

import os
import requests
import sys

def test_mapbox_token():
    token = os.getenv('MAPBOX_TOKEN')
    
    if not token:
        print("❌ MAPBOX_TOKEN environment variable not found")
        return False
    
    print(f"✅ MAPBOX_TOKEN found: {token[:20]}...")
    
    # Test 1: Simple API call to verify token
    test_url = f"https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token={token}"
    
    try:
        print("🧪 Testing Mapbox API accessibility...")
        response = requests.get(test_url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Mapbox API accessible - Token is valid")
            return True
        elif response.status_code == 401:
            print("❌ Mapbox API returned 401 - Token invalid or expired")
            print(f"Response: {response.text}")
            return False
        elif response.status_code == 403:
            print("❌ Mapbox API returned 403 - Token valid but access forbidden")
            print("This likely means URL restrictions are blocking GitHub Actions")
            print(f"Response: {response.text}")
            return False
        else:
            print(f"⚠️  Mapbox API returned {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error accessing Mapbox API: {e}")
        return False

def test_static_map_generation():
    token = os.getenv('MAPBOX_TOKEN')
    
    if not token:
        return False
    
    # Test 2: Generate a simple static map
    print("\n🗺️  Testing static map generation...")
    
    # Simple map of San Francisco
    map_url = f"https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-l+ff0000(-122.4194,37.7749)/-122.4194,37.7749,12,0/400x300@2x?access_token={token}"
    
    try:
        response = requests.get(map_url, timeout=30)
        
        if response.status_code == 200:
            print("✅ Static map generation successful")
            print(f"📊 Response size: {len(response.content)} bytes")
            
            # Check if it's actually an image
            if response.content.startswith(b'\x89PNG'):
                print("✅ Response is a valid PNG image")
                return True
            else:
                print("⚠️  Response is not a PNG image")
                print(f"Content type: {response.headers.get('content-type')}")
                return False
                
        elif response.status_code == 401:
            print("❌ Static map API returned 401 - Token invalid")
            return False
        elif response.status_code == 403:
            print("❌ Static map API returned 403 - URL restrictions blocking access")
            print("💡 Solution: Remove URL restrictions from your Mapbox token")
            return False
        else:
            print(f"❌ Static map API returned {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error generating static map: {e}")
        return False

def main():
    print("🚀 Testing Mapbox Token Configuration for GitHub Actions")
    print("=" * 60)
    
    # Test basic token validity
    token_valid = test_mapbox_token()
    
    if not token_valid:
        print("\n❌ Basic token test failed. Please check your MAPBOX_TOKEN.")
        sys.exit(1)
    
    # Test static map generation
    map_generation_works = test_static_map_generation()
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"Token Valid: {'✅' if token_valid else '❌'}")
    print(f"Static Maps: {'✅' if map_generation_works else '❌'}")
    
    if token_valid and map_generation_works:
        print("\n🎉 All tests passed! Mapbox token is properly configured.")
        sys.exit(0)
    elif token_valid and not map_generation_works:
        print("\n⚠️  Token is valid but static map generation failed.")
        print("💡 This is likely due to URL restrictions on your Mapbox token.")
        print("🔧 Recommended solution:")
        print("   1. Go to https://account.mapbox.com/access-tokens/")
        print("   2. Create a new token without URL restrictions for GitHub Actions")
        print("   3. Update the MAPBOX_TOKEN secret in your GitHub repository")
        sys.exit(1)
    else:
        print("\n❌ Token configuration has issues. Please check your setup.")
        sys.exit(1)

if __name__ == "__main__":
    main()
