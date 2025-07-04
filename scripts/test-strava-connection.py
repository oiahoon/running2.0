#!/usr/bin/env python3
"""
Test Strava API connection
Run this script locally to test your Strava API credentials
"""

import os
import requests
import json

def test_strava_connection():
    """Test Strava API connection with provided credentials"""
    
    # Get credentials from environment or prompt user
    client_id = os.getenv('STRAVA_CLIENT_ID') or input("Enter your Strava Client ID: ")
    client_secret = os.getenv('STRAVA_CLIENT_SECRET') or input("Enter your Strava Client Secret: ")
    refresh_token = os.getenv('STRAVA_REFRESH_TOKEN') or input("Enter your Strava Refresh Token: ")
    
    if not all([client_id, client_secret, refresh_token]):
        print("❌ Missing required credentials")
        return False
    
    print("🔄 Testing Strava API connection...")
    
    # Step 1: Refresh access token
    print("1. Refreshing access token...")
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
        
        # Print token info (without sensitive data)
        print(f"   - Token type: {token_info.get('token_type', 'N/A')}")
        print(f"   - Expires at: {token_info.get('expires_at', 'N/A')}")
        print(f"   - Scope: {token_info.get('scope', 'N/A')}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to refresh token: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return False
    
    # Step 2: Test API access
    print("\n2. Testing API access...")
    api_url = 'https://www.strava.com/api/v3/athlete'
    headers = {'Authorization': f'Bearer {access_token}'}
    
    try:
        api_response = requests.get(api_url, headers=headers)
        api_response.raise_for_status()
        athlete_info = api_response.json()
        print("✅ API access successful")
        print(f"   - Athlete: {athlete_info.get('firstname', '')} {athlete_info.get('lastname', '')}")
        print(f"   - ID: {athlete_info.get('id', 'N/A')}")
        print(f"   - Country: {athlete_info.get('country', 'N/A')}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to access API: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return False
    
    # Step 3: Test activities endpoint
    print("\n3. Testing activities endpoint...")
    activities_url = 'https://www.strava.com/api/v3/athlete/activities'
    params = {'page': 1, 'per_page': 5}
    
    try:
        activities_response = requests.get(activities_url, headers=headers, params=params)
        activities_response.raise_for_status()
        activities = activities_response.json()
        print(f"✅ Activities endpoint accessible")
        print(f"   - Found {len(activities)} recent activities")
        
        if activities:
            latest = activities[0]
            print(f"   - Latest: {latest.get('name', 'Unnamed')} ({latest.get('type', 'Unknown')})")
            print(f"   - Date: {latest.get('start_date', 'N/A')}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to access activities: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return False
    
    print("\n🎉 All tests passed! Your Strava API configuration is working correctly.")
    print("\nNext steps:")
    print("1. Add these credentials to your GitHub repository secrets:")
    print(f"   - STRAVA_CLIENT_ID: {client_id}")
    print(f"   - STRAVA_CLIENT_SECRET: {client_secret[:8]}...")
    print(f"   - STRAVA_REFRESH_TOKEN: {refresh_token[:8]}...")
    print("2. Trigger the GitHub Actions workflow to sync your data")
    
    return True

if __name__ == '__main__':
    test_strava_connection()
