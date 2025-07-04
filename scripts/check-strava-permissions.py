#!/usr/bin/env python3
"""
Check Strava API permissions and token validity
"""

import os
import requests
import json

def check_strava_permissions():
    """Check Strava API permissions and token validity"""
    
    client_id = os.getenv('STRAVA_CLIENT_ID')
    client_secret = os.getenv('STRAVA_CLIENT_SECRET')
    refresh_token = os.getenv('STRAVA_REFRESH_TOKEN')
    
    if not all([client_id, client_secret, refresh_token]):
        print("❌ Missing Strava credentials")
        return False
    
    print("🔍 Checking Strava API permissions...")
    
    # Step 1: Refresh access token
    print("\n1. Refreshing access token...")
    token_url = 'https://www.strava.com/oauth/token'
    token_data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token'
    }
    
    try:
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_info = token_response.json()
        access_token = token_info['access_token']
        
        print("✅ Access token refreshed successfully")
        print(f"   - Token type: {token_info.get('token_type', 'N/A')}")
        print(f"   - Expires at: {token_info.get('expires_at', 'N/A')}")
        
        # Check scope (but don't fail if missing)
        scope = token_info.get('scope', '')
        print(f"   - Scope: {scope if scope else 'NOT PRESENT (will test API directly)'}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to refresh token: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return False
    
    # Step 2: Test athlete endpoint
    print("\n2. Testing athlete endpoint...")
    athlete_url = 'https://www.strava.com/api/v3/athlete'
    headers = {'Authorization': f'Bearer {access_token}'}
    
    try:
        athlete_response = requests.get(athlete_url, headers=headers)
        athlete_response.raise_for_status()
        athlete_info = athlete_response.json()
        
        print("✅ Athlete endpoint accessible")
        print(f"   - Name: {athlete_info.get('firstname', '')} {athlete_info.get('lastname', '')}")
        print(f"   - ID: {athlete_info.get('id', 'N/A')}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to access athlete endpoint: {e}")
        return False
    
    # Step 3: Test activities endpoint (THE REAL TEST)
    print("\n3. Testing activities endpoint...")
    activities_url = 'https://www.strava.com/api/v3/athlete/activities'
    params = {'page': 1, 'per_page': 5}
    
    try:
        activities_response = requests.get(activities_url, headers=headers, params=params)
        print(f"   - Status Code: {activities_response.status_code}")
        
        if activities_response.status_code == 200:
            activities = activities_response.json()
            print(f"   ✅ SUCCESS! Activities endpoint accessible")
            print(f"   - Found {len(activities)} activities")
            
            if activities:
                latest = activities[0]
                print(f"   - Latest activity: {latest.get('name', 'Unnamed')}")
                print(f"   - Type: {latest.get('type', 'Unknown')}")
                print(f"   - Date: {latest.get('start_date', 'N/A')}")
            
            print("\n🎉 CONCLUSION: Your token HAS activity:read_all permissions!")
            print("   The API test confirms the token works correctly.")
            return True
            
        elif activities_response.status_code == 401:
            print("   ❌ FAILED: 401 Unauthorized")
            print("   Your token does NOT have activity:read_all permissions")
            print(f"   Response: {activities_response.text}")
            
            print("\n🔧 SOLUTION:")
            print("   You need to re-authorize your app with the 'activity:read_all' scope.")
            print("   Follow the setup guide in scripts/setup-strava-secrets.md")
            return False
        else:
            print(f"   ❌ Unexpected status code: {activities_response.status_code}")
            print(f"   Response: {activities_response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Failed to access activities endpoint: {e}")
        return False

if __name__ == '__main__':
    success = check_strava_permissions()
    if not success:
        exit(1)
