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
        
        # Check scope
        scope = token_info.get('scope', '')
        print(f"   - Scope: {scope}")
        
        if 'activity:read_all' in scope:
            print("   ✅ Has activity:read_all permission")
        else:
            print("   ❌ Missing activity:read_all permission")
            print("   📝 You need to re-authorize with activity:read_all scope")
            return False
            
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
    
    # Step 3: Test activities endpoint
    print("\n3. Testing activities endpoint...")
    activities_url = 'https://www.strava.com/api/v3/athlete/activities'
    params = {'page': 1, 'per_page': 1}
    
    try:
        activities_response = requests.get(activities_url, headers=headers, params=params)
        activities_response.raise_for_status()
        activities = activities_response.json()
        
        print("✅ Activities endpoint accessible")
        print(f"   - Response: {len(activities)} activities returned")
        
        if activities:
            latest = activities[0]
            print(f"   - Latest activity: {latest.get('name', 'Unnamed')}")
            print(f"   - Type: {latest.get('type', 'Unknown')}")
            print(f"   - Date: {latest.get('start_date', 'N/A')}")
        else:
            print("   - No activities found (this might be normal if you have no activities)")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to access activities endpoint: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Status Code: {e.response.status_code}")
            print(f"   Response: {e.response.text}")
            
            if e.response.status_code == 401:
                print("\n🔧 SOLUTION:")
                print("   The 401 Unauthorized error means your refresh token doesn't have")
                print("   the required permissions. You need to re-authorize your app with")
                print("   the 'activity:read_all' scope.")
                print("\n   Follow these steps:")
                print("   1. Visit this URL (replace YOUR_CLIENT_ID):")
                print(f"      https://www.strava.com/oauth/authorize?client_id={client_id}&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all")
                print("   2. Authorize the app")
                print("   3. Get the new authorization code from the redirect URL")
                print("   4. Exchange it for a new refresh token")
                print("   5. Update your GitHub Secrets with the new refresh token")
        return False
    
    print("\n🎉 All permission checks passed!")
    return True

if __name__ == '__main__':
    check_strava_permissions()
