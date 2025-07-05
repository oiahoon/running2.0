#!/usr/bin/env python3
"""
Generate static maps for activities with GPS data
This script runs as part of GitHub Actions to pre-generate all activity maps
"""

import os
import json
import requests
import time
from pathlib import Path
from urllib.parse import quote

class StaticMapGenerator:
    def __init__(self):
        self.mapbox_token = os.getenv('MAPBOX_TOKEN')
        if not self.mapbox_token:
            print("⚠️  No MAPBOX_TOKEN found, skipping map generation")
            return
            
        self.data_dir = Path('../apps/web/data')
        self.maps_dir = Path('../apps/web/public/maps')
        self.maps_dir.mkdir(exist_ok=True)
        
        # Rate limiting
        self.request_delay = 0.1  # 100ms between requests
        self.generated_count = 0
        self.skipped_count = 0
        self.error_count = 0
        
    def load_activities(self):
        """Load activities from JSON file"""
        activities_file = self.data_dir / 'strava_activities.json'
        if not activities_file.exists():
            print("❌ No activities file found")
            return []
            
        with open(activities_file, 'r') as f:
            activities = json.load(f)
            
        print(f"📊 Loaded {len(activities)} activities")
        return activities
    
    def has_gps_data(self, activity):
        """Check if activity has GPS data"""
        return (
            activity.get('start_latlng') and 
            len(activity.get('start_latlng', [])) == 2 and
            activity.get('map', {}).get('summary_polyline')
        )
    
    def calculate_bounds(self, polyline_points):
        """Calculate bounds from polyline points"""
        if not polyline_points:
            return None
            
        lats = [point[0] for point in polyline_points]
        lngs = [point[1] for point in polyline_points]
        
        min_lat, max_lat = min(lats), max(lats)
        min_lng, max_lng = min(lngs), max(lngs)
        
        # Add padding
        lat_padding = (max_lat - min_lat) * 0.1
        lng_padding = (max_lng - min_lng) * 0.1
        
        return {
            'min_lat': min_lat - lat_padding,
            'max_lat': max_lat + lat_padding,
            'min_lng': min_lng - lng_padding,
            'max_lng': max_lng + lng_padding
        }
    
    def decode_polyline(self, encoded):
        """Decode Google polyline to coordinates"""
        if not encoded:
            return []
            
        points = []
        index = 0
        lat = 0
        lng = 0
        
        while index < len(encoded):
            # Decode latitude
            b = 0
            shift = 0
            result = 0
            while True:
                b = ord(encoded[index]) - 63
                index += 1
                result |= (b & 0x1f) << shift
                shift += 5
                if b < 0x20:
                    break
            dlat = ~(result >> 1) if result & 1 else result >> 1
            lat += dlat
            
            # Decode longitude
            b = 0
            shift = 0
            result = 0
            while True:
                b = ord(encoded[index]) - 63
                index += 1
                result |= (b & 0x1f) << shift
                shift += 5
                if b < 0x20:
                    break
            dlng = ~(result >> 1) if result & 1 else result >> 1
            lng += dlng
            
            points.append([lat / 1e5, lng / 1e5])
            
        return points
    
    def calculate_zoom(self, bounds):
        """Calculate appropriate zoom level"""
        lat_diff = bounds['max_lat'] - bounds['min_lat']
        lng_diff = bounds['max_lng'] - bounds['min_lng']
        max_diff = max(lat_diff, lng_diff)
        
        if max_diff < 0.01:
            return 14
        elif max_diff < 0.05:
            return 12
        elif max_diff < 0.1:
            return 11
        elif max_diff < 0.5:
            return 9
        elif max_diff < 1:
            return 8
        else:
            return 7
    
    def generate_map_url(self, activity, width=400, height=300):
        """Generate Mapbox static map URL"""
        polyline = activity.get('map', {}).get('summary_polyline', '')
        if not polyline:
            return None
            
        start_lat, start_lng = activity['start_latlng']
        end_latlng = activity.get('end_latlng')
        
        # Decode polyline for bounds calculation
        points = self.decode_polyline(polyline)
        bounds = self.calculate_bounds(points)
        
        if not bounds:
            return None
            
        center_lat = (bounds['min_lat'] + bounds['max_lat']) / 2
        center_lng = (bounds['min_lng'] + bounds['max_lng']) / 2
        zoom = self.calculate_zoom(bounds)
        
        # Build URL components
        base_url = "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/"
        
        # Polyline overlay
        polyline_overlay = f"path-4+ff0000-1.0({quote(polyline)})"
        
        # Start marker
        start_marker = f"pin-s-s+ff0000({start_lng},{start_lat})"
        
        # End marker (if different from start)
        end_marker = ""
        if end_latlng and len(end_latlng) == 2:
            end_lat, end_lng = end_latlng
            if abs(end_lat - start_lat) > 0.001 or abs(end_lng - start_lng) > 0.001:
                end_marker = f"pin-s-f+00ff00({end_lng},{end_lat})"
        
        # Combine overlays
        overlays = [polyline_overlay, start_marker]
        if end_marker:
            overlays.append(end_marker)
        
        overlays_str = ",".join(overlays)
        
        # Final URL
        url = f"{base_url}{overlays_str}/{center_lng},{center_lat},{zoom},0/{width}x{height}@2x?access_token={self.mapbox_token}"
        
        return url if len(url) < 2000 else None
    
    def download_map(self, url, file_path):
        """Download map image from URL"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
                
            return True
        except Exception as e:
            print(f"❌ Error downloading map: {e}")
            return False
    
    def generate_maps(self):
        """Generate static maps for all GPS activities"""
        if not self.mapbox_token:
            return
            
        activities = self.load_activities()
        gps_activities = [a for a in activities if self.has_gps_data(a)]
        
        print(f"🗺️  Found {len(gps_activities)} activities with GPS data")
        
        for i, activity in enumerate(gps_activities):
            activity_id = activity['id']
            
            # Check if map already exists
            map_file = self.maps_dir / f"{activity_id}.png"
            if map_file.exists():
                print(f"⏭️  Map for activity {activity_id} already exists")
                self.skipped_count += 1
                continue
            
            # Generate map URL
            map_url = self.generate_map_url(activity)
            if not map_url:
                print(f"⚠️  Could not generate URL for activity {activity_id}")
                self.error_count += 1
                continue
            
            # Download map
            print(f"📥 Generating map for activity {activity_id} ({i+1}/{len(gps_activities)})")
            if self.download_map(map_url, map_file):
                self.generated_count += 1
                print(f"✅ Generated: {map_file.name}")
            else:
                self.error_count += 1
            
            # Rate limiting
            time.sleep(self.request_delay)
        
        # Summary
        print(f"\n📊 Map Generation Summary:")
        print(f"✅ Generated: {self.generated_count}")
        print(f"⏭️  Skipped: {self.skipped_count}")
        print(f"❌ Errors: {self.error_count}")
        print(f"📁 Total files: {len(list(self.maps_dir.glob('*.png')))}")
    
    def cleanup_orphaned_maps(self):
        """Remove maps for activities that no longer exist"""
        activities = self.load_activities()
        activity_ids = {str(a['id']) for a in activities}
        
        removed_count = 0
        for map_file in self.maps_dir.glob('*.png'):
            activity_id = map_file.stem
            if activity_id not in activity_ids:
                print(f"🗑️  Removing orphaned map: {map_file.name}")
                map_file.unlink()
                removed_count += 1
        
        if removed_count > 0:
            print(f"🧹 Cleaned up {removed_count} orphaned maps")

def main():
    generator = StaticMapGenerator()
    
    print("🚀 Starting static map generation...")
    generator.generate_maps()
    generator.cleanup_orphaned_maps()
    print("✅ Static map generation completed!")

if __name__ == "__main__":
    main()
