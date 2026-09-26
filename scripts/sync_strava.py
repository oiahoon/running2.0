#!/usr/bin/env python3
"""Fetch Strava activities for the scheduled data pipeline."""

import json
import os
import sqlite3
import sys
import tempfile
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests


class StravaSyncError(Exception):
    """A sync failure that must stop the downstream data pipeline."""


def api_error(response):
    """Keep useful Strava diagnostics without logging credentials or headers."""
    parts = [f"HTTP {response.status_code}"]
    try:
        payload = response.json()
    except ValueError:
        return " ".join(parts)
    if isinstance(payload, dict):
        message = payload.get("message")
        if isinstance(message, str):
            parts.append(message[:200])
        errors = payload.get("errors")
        if isinstance(errors, list):
            for error in errors[:3]:
                if isinstance(error, dict):
                    detail = "/".join(
                        str(error[key])[:80]
                        for key in ("resource", "field", "code")
                        if key in error
                    )
                    if detail:
                        parts.append(detail)
    return ": ".join(parts)


class StravaSync:
    def __init__(self, data_dir=None):
        self.client_id = os.getenv("STRAVA_CLIENT_ID")
        self.client_secret = os.getenv("STRAVA_CLIENT_SECRET")
        self.refresh_token = os.getenv("STRAVA_REFRESH_TOKEN")
        if not all((self.client_id, self.client_secret, self.refresh_token)):
            raise StravaSyncError("Missing Strava credentials")

        self.access_token = None
        self.data_dir = Path(data_dir or Path(__file__).resolve().parents[1] / "apps/web/data").resolve()

    def fetch_json(self, method, url, **kwargs):
        try:
            response = method(url, timeout=30, **kwargs)
        except requests.RequestException as exc:
            raise StravaSyncError(f"Strava request failed: {type(exc).__name__}") from exc
        if not response.ok:
            raise StravaSyncError(f"Strava request failed: {api_error(response)}")
        try:
            return response.json()
        except ValueError as exc:
            raise StravaSyncError("Strava returned invalid JSON") from exc

    def refresh_access_token(self):
        token_data = self.fetch_json(
            requests.post,
            "https://www.strava.com/oauth/token",
            data={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": self.refresh_token,
                "grant_type": "refresh_token",
            },
        )
        if not isinstance(token_data, dict) or not isinstance(token_data.get("access_token"), str):
            raise StravaSyncError("Strava token response has no access token")
        self.access_token = token_data["access_token"]
        if token_data.get("refresh_token") and token_data["refresh_token"] != self.refresh_token:
            print("Warning Strava returned a new refresh token; update the GitHub secret if required")
        print("OK Access token refreshed")

    def get_activities(self, page, per_page=200):
        activities = self.fetch_json(
            requests.get,
            "https://www.strava.com/api/v3/athlete/activities",
            headers={"Authorization": f"Bearer {self.access_token}"},
            params={"page": page, "per_page": per_page},
        )
        if not isinstance(activities, list) or any(not isinstance(item, dict) for item in activities):
            raise StravaSyncError(f"Strava activities page {page} has an invalid format")
        return activities

    def get_activity_detail(self, activity_id):
        detail = self.fetch_json(
            requests.get,
            f"https://www.strava.com/api/v3/activities/{activity_id}",
            headers={"Authorization": f"Bearer {self.access_token}"},
        )
        if not isinstance(detail, dict) or detail.get("id") != activity_id:
            raise StravaSyncError(f"Strava activity {activity_id} has an invalid detail response")
        return detail

    def has_existing_activities(self):
        activities_file = self.data_dir / "strava_activities.json"
        if activities_file.exists():
            try:
                existing = json.loads(activities_file.read_text())
            except (OSError, ValueError) as exc:
                raise StravaSyncError("Existing activities file cannot be read") from exc
            if not isinstance(existing, list):
                raise StravaSyncError("Existing activities file has an invalid format")
            if existing:
                return True

        database_file = self.data_dir / "running_page_2.db"
        if database_file.exists():
            try:
                with sqlite3.connect(f"{database_file.as_uri()}?mode=ro", uri=True) as db:
                    return db.execute("SELECT EXISTS(SELECT 1 FROM activities)").fetchone()[0] == 1
            except sqlite3.Error as exc:
                raise StravaSyncError("Existing activity database cannot be checked") from exc
        return False

    def save_json(self, name, items):
        self.data_dir.mkdir(parents=True, exist_ok=True)
        path = self.data_dir / name
        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile("w", dir=self.data_dir, prefix=f".{name}.", delete=False) as file:
                temporary_path = Path(file.name)
                json.dump(items, file, indent=2)
                file.flush()
                os.fsync(file.fileno())
            os.replace(temporary_path, path)
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)
        print(f"Save Saved {len(items)} activities to {path}")

    def sync_all_activities(self):
        self.refresh_access_token()
        print("Sync Starting Strava data sync...")

        all_activities = []
        page = 1
        while True:
            print(f"File Fetching page {page}...")
            activities = self.get_activities(page)
            all_activities.extend(activities)
            if len(activities) < 200:
                break
            page += 1
            time.sleep(0.5)

        print(f"Stats Found {len(all_activities)} activities")
        if not all_activities and self.has_existing_activities():
            raise StravaSyncError("Strava returned zero activities while historical activities exist; keeping existing data")

        recent_activities = []
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)
        for activity in all_activities:
            try:
                activity_id = activity["id"]
                activity_date = datetime.fromisoformat(activity["start_date"].replace("Z", "+00:00"))
            except (KeyError, AttributeError, TypeError, ValueError) as exc:
                raise StravaSyncError("Strava activity is missing a valid id or start date") from exc
            if activity_date > cutoff_date:
                print(f"List Fetching details for activity {activity_id}")
                recent_activities.append(self.get_activity_detail(activity_id))
                time.sleep(0.5)

        # Only publish fetched data after every required API call succeeds.
        self.save_json("strava_activities.json", all_activities)
        self.save_json("strava_detailed.json", recent_activities)
        print("OK Strava sync completed successfully")


def main():
    try:
        StravaSync().sync_all_activities()
    except (StravaSyncError, OSError) as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
