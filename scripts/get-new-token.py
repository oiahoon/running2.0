#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Get new refresh token with the authorization code
"""

import requests
import json

def get_new_token():
    """Get new refresh token using authorization code"""
    
    # Your authorization code from the redirect URL
    auth_code = "faa3a8a7109c532bfea6bb552217a1e3572aeb14"
    
    # Get credentials
    client_id = input("Enter your Strava Client ID: ")
    client_secret = input("Enter your Strava Client Secret: ")
    
    print("Exchanging authorization code for tokens...")
    
    # Exchange authorization code for tokens
    token_url = 'https://www.strava.com/oauth/token'
    token_data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': auth_code,
        'grant_type': 'authorization_code'
    }
    
    try:
        response = requests.post(token_url, data=token_data)
        response.raise_for_status()
        token_info = response.json()
        
        print("Token exchange successful!")
        print("\nToken Information:")
        print("=" * 50)
        print(json.dumps(token_info, indent=2))
        print("=" * 50)
        
        # Extract important information
        refresh_token = token_info.get('refresh_token')
        scope = token_info.get('scope', 'NOT PRESENT')
        
        print(f"\nYour new refresh token:")
        print(f"   {refresh_token}")
        
        print(f"\nScope verification:")
        print(f"   - Scope: {scope}")
        
        if 'activity:read_all' in str(scope):
            print("   Has activity:read_all permission - Perfect!")
        else:
            print("   Missing activity:read_all permission")
        
        print(f"\nNext steps:")
        print(f"   1. Update your GitHub Secret STRAVA_REFRESH_TOKEN with:")
        print(f"      {refresh_token}")
        print(f"   2. Test the permissions again")
        
        return token_info
        
    except requests.exceptions.RequestException as e:
        print(f"Token exchange failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        return None

if __name__ == '__main__':
    get_new_token()
