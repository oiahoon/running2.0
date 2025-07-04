#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test current refresh token directly
"""

import requests
import json

def test_current_token():
    """Test the current refresh token"""
    
    # Your current credentials
    client_id = "97755"
    client_secret = "fc6a4e6680d78ddf2d2795f112776b4b54e1acc7"
    refresh_token = "7934ffec4916947f399b3ea51ef3b2123f395874"
    
    print("Testing current refresh token...")
    
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
        
        print("Access token refreshed successfully")
        print("Response: " + json.dumps(token_info, indent=2))
        
        access_token = token_info['access_token']
        
    except requests.exceptions.RequestException as e:
        print("Token refresh failed: " + str(e))
        return False
    
    # Step 2: Test activities endpoint directly
    print("\n2. Testing activities endpoint...")
    activities_url = 'https://www.strava.com/api/v3/athlete/activities'
    headers = {'Authorization': 'Bearer ' + access_token}
    params = {'page': 1, 'per_page': 5}
    
    try:
        activities_response = requests.get(activities_url, headers=headers, params=params)
        print("Status Code: " + str(activities_response.status_code))
        
        if activities_response.status_code == 200:
            activities = activities_response.json()
            print("SUCCESS! Found " + str(len(activities)) + " activities")
            
            if activities:
                print("\nLatest activities:")
                for i, activity in enumerate(activities[:3]):
                    name = activity.get('name', 'Unnamed')
                    activity_type = activity.get('type', 'Unknown')
                    date = activity.get('start_date', 'N/A')
                    distance = activity.get('distance', 0) / 1000
                    
                    print("  " + str(i+1) + ". " + name + " (" + activity_type + ")")
                    print("     Date: " + date)
                    print("     Distance: " + str(round(distance, 2)) + " km")
            else:
                print("No activities found (this might be normal if you have no activities)")
                
            print("\nCONCLUSION: Your token HAS the required permissions!")
            print("The missing 'scope' field in the response is not a problem.")
            return True
            
        elif activities_response.status_code == 401:
            print("FAILED: 401 Unauthorized")
            print("Your token does NOT have the required permissions")
            print("Response: " + activities_response.text)
            return False
        else:
            print("Unexpected status code: " + str(activities_response.status_code))
            print("Response: " + activities_response.text)
            return False
            
    except requests.exceptions.RequestException as e:
        print("Request failed: " + str(e))
        return False

if __name__ == '__main__':
    success = test_current_token()
    if success:
        print("\n=== NEXT STEPS ===")
        print("1. Your current refresh token works!")
        print("2. Update GitHub Secrets with: 7934ffec4916947f399b3ea51ef3b2123f395874")
        print("3. Run the full sync workflow")
    else:
        print("\n=== NEXT STEPS ===")
        print("1. Need to get a new authorization code")
        print("2. Exchange it for a working refresh token")
