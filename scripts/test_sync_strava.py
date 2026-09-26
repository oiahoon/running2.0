"""Data integrity checks for the GitHub Actions Strava sync."""

import json
import os
import sqlite3
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import Mock, patch

from sync_strava import StravaSync, StravaSyncError


class StravaSyncTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.data_dir = Path(self.temp_dir.name)
        credentials = {
            "STRAVA_CLIENT_ID": "test-client",
            "STRAVA_CLIENT_SECRET": "test-secret",
            "STRAVA_REFRESH_TOKEN": "test-refresh",
        }
        env = patch.dict(os.environ, credentials)
        env.start()
        self.addCleanup(env.stop)
        self.sync = StravaSync(self.data_dir)
        self.existing = [{"id": 1, "start_date": "2025-01-01T00:00:00Z"}]
        (self.data_dir / "strava_activities.json").write_text(json.dumps(self.existing))
        (self.data_dir / "strava_detailed.json").write_text(json.dumps(self.existing))

    def response(self, status, payload):
        result = Mock()
        result.ok = status < 400
        result.status_code = status
        result.json.return_value = payload
        return result

    def assert_existing_unchanged(self):
        for name in ("strava_activities.json", "strava_detailed.json"):
            self.assertEqual(json.loads((self.data_dir / name).read_text()), self.existing)

    @patch("sync_strava.requests.get")
    @patch("sync_strava.requests.post")
    def test_403_fails_without_overwriting_data(self, post, get):
        post.return_value = self.response(200, {"access_token": "test-access"})
        get.return_value = self.response(403, {"message": "Authorization Error", "errors": [{"resource": "AccessToken", "field": "activity:read_all", "code": "missing"}]})

        with self.assertRaisesRegex(StravaSyncError, "HTTP 403.*activity:read_all"):
            self.sync.sync_all_activities()
        self.assert_existing_unchanged()

    @patch("sync_strava.requests.get")
    @patch("sync_strava.requests.post")
    def test_zero_activities_with_historical_database_fails(self, post, get):
        (self.data_dir / "strava_activities.json").write_text("[]")
        with sqlite3.connect(self.data_dir / "running_page_2.db") as db:
            db.execute("CREATE TABLE activities (id INTEGER)")
            db.execute("INSERT INTO activities VALUES (1)")
        post.return_value = self.response(200, {"access_token": "test-access"})
        get.return_value = self.response(200, [])

        with self.assertRaisesRegex(StravaSyncError, "historical activities exist"):
            self.sync.sync_all_activities()
        self.assertEqual((self.data_dir / "strava_activities.json").read_text(), "[]")
        self.assertEqual(json.loads((self.data_dir / "strava_detailed.json").read_text()), self.existing)

    @patch("sync_strava.requests.get")
    @patch("sync_strava.requests.post")
    def test_detail_failure_does_not_publish_partial_data(self, post, get):
        activity = {"id": 42, "start_date": datetime.now(timezone.utc).isoformat()}
        post.return_value = self.response(200, {"access_token": "test-access"})
        get.side_effect = [self.response(200, [activity]), self.response(403, {"message": "Authorization Error"})]

        with self.assertRaisesRegex(StravaSyncError, "HTTP 403"):
            self.sync.sync_all_activities()
        self.assert_existing_unchanged()

    @patch("sync_strava.time.sleep")
    @patch("sync_strava.requests.get")
    @patch("sync_strava.requests.post")
    def test_success_replaces_both_files_after_fetch(self, post, get, _sleep):
        activity = {"id": 42, "start_date": datetime.now(timezone.utc).isoformat(), "name": "Morning run"}
        post.return_value = self.response(200, {"access_token": "test-access"})
        get.side_effect = [self.response(200, [activity]), self.response(200, {"id": 42, "distance": 5000})]

        self.sync.sync_all_activities()

        self.assertEqual(json.loads((self.data_dir / "strava_activities.json").read_text()), [activity])
        self.assertEqual(json.loads((self.data_dir / "strava_detailed.json").read_text()), [{"id": 42, "distance": 5000}])


if __name__ == "__main__":
    unittest.main()
