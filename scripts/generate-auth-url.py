#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate Strava authorization URL with correct permissions
"""

import os

def generate_auth_url():
    """Generate Strava authorization URL"""
    
    client_id = os.getenv('STRAVA_CLIENT_ID') or input("Enter your Strava Client ID: ")
    
    if not client_id:
        print("Client ID is required")
        return
    
    # Generate authorization URL with correct scope
    base_url = "https://www.strava.com/oauth/authorize"
    params = [
        f"client_id={client_id}",
        "response_type=code",
        "redirect_uri=http://localhost",
        "approval_prompt=force",
        "scope=read,activity:read_all"
    ]
    
    auth_url = base_url + "?" + "&".join(params)
    
    print("Strava Authorization URL:")
    print("=" * 60)
    print(auth_url)
    print("=" * 60)
    print()
    print("Steps to follow:")
    print("1. Copy the URL above and open it in your browser")
    print("2. Log in to your Strava account")
    print("3. Make sure you see 'Read all of your activity data' permission")
    print("4. Click 'Authorize'")
    print("5. Copy the 'code' parameter from the redirect URL")
    print("6. Use the code to get a new refresh token")
    print()
    print("After authorization, look for a URL like:")
    print("http://localhost/?state=&code=AUTHORIZATION_CODE&scope=read,activity:read_all")
    print()
    print("Important: The scope parameter should include 'activity:read_all'")

if __name__ == '__main__':
    generate_auth_url()
