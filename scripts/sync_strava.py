#!/usr/bin/env python3
"""
Strava Data Sync Script for GitHub Actions
Fetches activities from Strava API and saves to JSON files
"""

import os
import json
import requests
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

class StravaSync:
    def __init__(self):
        self.client_id = os.getenv('STRAVA_CLIENT_ID')
        self.client_secret = os.getenv('STRAVA_CLIENT_SECRET')
        self.refresh_token = os.getenv('STRAVA_REFRESH_TOKEN')
        
        if not all([self.client_id, self.client_secret, self.refresh_token]):
            print("⚠️  Missing Strava credentials, skipping sync")
            return
            
        self.access_token = None
        self.data_dir = Path('../apps/web/data')
        self.data_dir.mkdir(exist_ok=True)
        
    def refresh_access_token(self):
        """Refresh Strava access token"""
        url = 'https://www.strava.com/oauth/token'
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'refresh_token': self.refresh_token,
            'grant_type': 'refresh_token'
        }
        
        try:
            response = requests.post(url, data=data)
            response.raise_for_status()
            token_data = response.json()
            self.access_token = token_data['access_token']
            print("✅ Access token refreshed")
            return True
        except Exception as e:
            print(f"❌ Failed to refresh token: {e}")
            return False
    
    def get_activities(self, page=1, per_page=200):
        """Fetch activities from Strava API"""
        if not self.access_token:
            return []
            
        url = 'https://www.strava.com/api/v3/athlete/activities'
        headers = {'Authorization': f'Bearer {self.access_token}'}
        params = {
            'page': page,
            'per_page': per_page
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Failed to fetch activities: {e}")
            return []
    
    def get_activity_detail(self, activity_id):
        """Fetch detailed activity data"""
        if not self.access_token:
            return None
            
        url = f'https://www.strava.com/api/v3/activities/{activity_id}'
        headers = {'Authorization': f'Bearer {self.access_token}'}
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Failed to fetch activity {activity_id}: {e}")
            return None
    
    def sync_all_activities(self):
        """Sync all activities from Strava"""
        if not self.refresh_access_token():
            return False
            
        print("🔄 Starting Strava data sync...")
        
        all_activities = []
        page = 1
        
        while True:
            print(f"📄 Fetching page {page}...")
            activities = self.get_activities(page=page)
            
            if not activities:
                break
                
            all_activities.extend(activities)
            page += 1
            
            # Rate limiting
            time.sleep(0.5)
            
            # Strava API returns max 200 per page
            if len(activities) < 200:
                break
        
        print(f"📊 Found {len(all_activities)} activities")
        
        # Save activities summary
        activities_file = self.data_dir / 'strava_activities.json'
        with open(activities_file, 'w') as f:
            json.dump(all_activities, f, indent=2)
        
        print(f"💾 Saved activities to {activities_file}")
        
        # Fetch detailed data for recent activities (last 30 days)
        recent_activities = []
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)
        
        for activity in all_activities:
            activity_date = datetime.fromisoformat(activity['start_date'].replace('Z', '+00:00'))
            if activity_date > cutoff_date:
                print(f"📋 Fetching details for: {activity['name']}")
                detail = self.get_activity_detail(activity['id'])
                if detail:
                    recent_activities.append(detail)
                time.sleep(0.5)  # Rate limiting
        
        # Save detailed activities
        if recent_activities:
            detailed_file = self.data_dir / 'strava_detailed.json'
            with open(detailed_file, 'w') as f:
                json.dump(recent_activities, f, indent=2)
            print(f"💾 Saved {len(recent_activities)} detailed activities")
        
        return True

def main():
    sync = StravaSync()
    
    if not hasattr(sync, 'client_id') or not sync.client_id:
        print("⚠️  Strava credentials not configured, skipping sync")
        return
    
    success = sync.sync_all_activities()
    
    if success:
        print("✅ Strava sync completed successfully")
    else:
        print("❌ Strava sync failed")

if __name__ == '__main__':
    main()
