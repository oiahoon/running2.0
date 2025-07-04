#!/usr/bin/env python3
"""
Test the new refresh token locally
"""

import requests
import json

# Your new refresh token
REFRESH_TOKEN = "7934ffec4916947f399b3ea51ef3b2123f395874"

def test_token():
    """Test the new refresh token"""
    
    # You'll need to provide these
    client_id = input("Enter your Strava Client ID: ")
    client_secret = input("Enter your Strava Client Secret: ")
    
    print("🔄 Testing new refresh token...")
    
    # Step 1: Refresh access token
    print("\n1. Refreshing access token...")
    token_url = 'https://www.strava.com/oauth/token'
    token_data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'refresh_token': REFRESH_TOKEN,
        'grant_type': 'refresh_token'
    }
    
    try:
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_info = token_response.json()
        
        print("✅ Token refresh successful")
        print(f"   Response: {json.dumps(token_info, indent=2)}")
        
        access_token = token_info['access_token']
        scope = token_info.get('scope', 'NOT PRESENT')
        
        print(f"\n🔍 Scope analysis:")
        print(f"   - Scope field: {scope}")
        
        if 'activity:read_all' in str(scope):
            print("   ✅ Has activity:read_all permission")
        else:
            print("   ❌ Missing activity:read_all permission")
            print("   📝 This explains why the API calls are failing")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Token refresh failed: {e}")
        return False
    
    # Step 2: Test activities endpoint
    print("\n2. Testing activities endpoint...")
    activities_url = 'https://www.strava.com/api/v3/athlete/activities'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {'page': 1, 'per_page': 5}
    
    try:
        activities_response = requests.get(activities_url, headers=headers, params=params)
        print(f"   Status Code: {activities_response.status_code}")
        
        if activities_response.status_code == 200:
            activities = activities_response.json()
            print(f"   ✅ Success! Found {len(activities)} activities")
            if activities:
                print(f"   - Latest: {activities[0].get('name', 'Unnamed')}")
        else:
            print(f"   ❌ Failed: {activities_response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")

if __name__ == '__main__':
    test_token()
