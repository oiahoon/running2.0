"""FIT decoding, cross-source deduplication, and Dropbox paging checks."""

import sqlite3
import unittest
from datetime import datetime, timezone
from unittest.mock import Mock

from garmin_fit_sdk import Encoder, Profile

from sync_healthfit import HealthFitSyncError, dropbox_files, import_activities, parse_fit


def fit_activity(start, distance, with_gps):
    encoder = Encoder()
    encoder.on_mesg(Profile["mesg_num"]["FILE_ID"], {
        "manufacturer": "development", "product": 1, "time_created": start, "type": "activity",
    })
    first = {"timestamp": start, "heart_rate": 140}
    second = {"timestamp": start, "heart_rate": 145}
    if with_gps:
        first.update({"position_lat": round(30 * 2**31 / 180), "position_long": round(104 * 2**31 / 180)})
        second.update({"position_lat": round(30.001 * 2**31 / 180), "position_long": round(104.001 * 2**31 / 180)})
    encoder.on_mesg(Profile["mesg_num"]["RECORD"], first)
    encoder.on_mesg(Profile["mesg_num"]["RECORD"], second)
    encoder.on_mesg(Profile["mesg_num"]["SESSION"], {
        "timestamp": start, "start_time": start, "sport": "running",
        "total_distance": distance, "total_timer_time": 1000,
        "total_elapsed_time": 1000, "avg_heart_rate": 142,
    })
    encoder.on_mesg(Profile["mesg_num"]["ACTIVITY"], {
        "timestamp": start, "total_timer_time": 1000, "num_sessions": 1, "type": "manual",
    })
    return bytes(encoder.close())


def database():
    db = sqlite3.connect(":memory:")
    db.row_factory = sqlite3.Row
    db.executescript("""
        CREATE TABLE activities (
            id INTEGER PRIMARY KEY, external_id TEXT UNIQUE NOT NULL, source TEXT NOT NULL,
            name TEXT NOT NULL, type TEXT NOT NULL, sport_type TEXT, start_date TEXT NOT NULL,
            start_date_local TEXT, distance REAL, moving_time INTEGER, elapsed_time INTEGER,
            total_elevation_gain REAL, average_speed REAL, max_speed REAL,
            start_latitude REAL, start_longitude REAL, end_latitude REAL, end_longitude REAL,
            summary_polyline TEXT, average_heartrate REAL, max_heartrate REAL, calories INTEGER,
            average_cadence REAL, average_power REAL, weighted_average_power REAL,
            updated_at TEXT, synced_at TEXT
        );
        CREATE TABLE sync_logs (
            id INTEGER PRIMARY KEY, user_id INTEGER, source TEXT, sync_type TEXT,
            status TEXT, activities_processed INTEGER, activities_created INTEGER,
            activities_updated INTEGER, activities_skipped INTEGER, started_at TEXT, completed_at TEXT
        );
        CREATE TABLE data_source_settings (
            id INTEGER PRIMARY KEY, user_id INTEGER, source TEXT,
            auto_sync INTEGER, sync_frequency TEXT, last_sync_at TEXT,
            is_active INTEGER, connection_status TEXT, created_at TEXT, updated_at TEXT,
            UNIQUE(user_id, source)
        );
    """)
    return db


class HealthFitSyncTests(unittest.TestCase):
    def test_identical_historical_strava_rows_are_one_logical_match(self):
        db = database()
        self.addCleanup(db.close)
        start = datetime(2023, 11, 6, 10, 24, 14, tzinfo=timezone.utc)
        for activity_id in (41, 42):
            db.execute("""
                INSERT INTO activities (id, external_id, source, name, type, start_date, distance, moving_time)
                VALUES (?, ?, 'strava', 'Run', 'Run', '2023-11-06T10:24:14Z', 10094.7, 1000)
            """, (activity_id, f"strava-{activity_id}"))
        result = import_activities(db, [("key", "1", "run.fit", fit_activity(start, 10094.7, False))])
        self.assertEqual((result["created"], result["matched"]), (0, 1))
        self.assertEqual(db.execute("SELECT COUNT(*) FROM activities").fetchone()[0], 2)

    def test_distinct_plausible_matches_still_fail_closed(self):
        db = database()
        self.addCleanup(db.close)
        start = datetime(2023, 11, 6, 10, 24, 14, tzinfo=timezone.utc)
        for activity_id, distance in ((41, 10094.7), (42, 10100.0)):
            db.execute("""
                INSERT INTO activities (id, external_id, source, name, type, start_date, distance, moving_time)
                VALUES (?, ?, 'strava', 'Run', 'Run', '2023-11-06T10:24:14Z', ?, 1000)
            """, (activity_id, f"strava-{activity_id}", distance))
        with self.assertRaises(HealthFitSyncError):
            import_activities(db, [("key", "1", "run.fit", fit_activity(start, 10094.7, False))])
        self.assertEqual(db.execute("SELECT COUNT(*) FROM activities WHERE source = 'healthfit'").fetchone()[0], 0)

    def test_unique_exact_start_wins_over_nearby_workout(self):
        db = database()
        self.addCleanup(db.close)
        start = datetime(2022, 11, 15, 12, 1, 50, tzinfo=timezone.utc)
        for activity_id, start_date, distance, moving_time in (
            (41, "2022-11-15T12:00:25Z", 9700.0, 970),
            (42, "2022-11-15T12:01:50Z", 10000.0, 1000),
        ):
            db.execute("""
                INSERT INTO activities (id, external_id, source, name, type, start_date, distance, moving_time)
                VALUES (?, ?, 'strava', 'Run', 'Run', ?, ?, ?)
            """, (activity_id, f"strava-{activity_id}", start_date, distance, moving_time))
        result = import_activities(db, [("key", "1", "run.fit", fit_activity(start, 10000.0, False))])
        self.assertEqual((result["created"], result["matched"]), (0, 1))
        self.assertEqual(db.execute("SELECT COUNT(*) FROM activities").fetchone()[0], 2)

    def test_one_second_clock_difference_wins_over_nearby_workout(self):
        db = database()
        self.addCleanup(db.close)
        start = datetime(2022, 11, 15, 12, 0, 24, tzinfo=timezone.utc)
        for activity_id, start_date, distance, moving_time in (
            (41, "2022-11-15T12:00:25Z", 10000.0, 1000),
            (42, "2022-11-15T12:01:50Z", 10100.0, 1010),
        ):
            db.execute("""
                INSERT INTO activities (id, external_id, source, name, type, start_date, distance, moving_time)
                VALUES (?, ?, 'strava', 'Run', 'Run', ?, ?, ?)
            """, (activity_id, f"strava-{activity_id}", start_date, distance, moving_time))
        result = import_activities(db, [("key", "1", "run.fit", fit_activity(start, 10000.0, False))])
        self.assertEqual((result["created"], result["matched"]), (0, 1))
        self.assertEqual(db.execute("SELECT COUNT(*) FROM activities").fetchone()[0], 2)

    def test_fit_gps_and_indoor_routes(self):
        start = datetime(2026, 9, 10, 11, 17, 54, tzinfo=timezone.utc)
        gps = parse_fit(fit_activity(start, 7000, True), "2026-09-10-191754-Outdoor Running-Apple Watch.fit")[0]
        indoor = parse_fit(fit_activity(start, 3000, False), "indoor.fit")[0]
        self.assertEqual(gps["type"], "Run")
        self.assertEqual(gps["distance"], 7000)
        self.assertEqual(gps["start_date_local"], "2026-09-10T19:17:54")
        self.assertIsNotNone(gps["summary_polyline"])
        self.assertIsNone(indoor["summary_polyline"])

    def test_existing_strava_match_and_new_activity_are_idempotent(self):
        db = database()
        self.addCleanup(db.close)
        old_start = datetime(2019, 4, 1, 9, 25, 22, tzinfo=timezone.utc)
        new_start = datetime(2026, 9, 10, 11, 17, 54, tzinfo=timezone.utc)
        db.execute("""
            INSERT INTO activities (id, external_id, source, name, type, start_date, distance, moving_time)
            VALUES (42, 'strava-42', 'strava', 'Run', 'Run', '2019-04-01T09:25:22Z', 3042, 1000)
        """)
        files = [
            ("old-key", "1", "old.fit", fit_activity(old_start, 3042, False)),
            ("new-key", "1", "new.fit", fit_activity(new_start, 7000, True)),
        ]
        result = import_activities(db, files)
        self.assertEqual((result["created"], result["matched"]), (1, 1))
        self.assertEqual(db.execute("SELECT COUNT(*) FROM activities").fetchone()[0], 2)
        self.assertEqual(db.execute("SELECT source FROM activities WHERE id = 42").fetchone()[0], "strava")
        self.assertIsNotNone(db.execute("SELECT summary_polyline FROM activities WHERE source = 'healthfit'").fetchone()[0])
        self.assertEqual(import_activities(db, files)["files"], 0)
        self.assertEqual(db.execute("SELECT COUNT(*) FROM activities").fetchone()[0], 2)
        revised = [("new-key", "2", "new.fit", fit_activity(new_start, 7100, True))]
        self.assertEqual(import_activities(db, revised)["updated"], 1)
        self.assertEqual(db.execute("SELECT COUNT(*) FROM activities").fetchone()[0], 2)
        self.assertEqual(db.execute("SELECT distance FROM activities WHERE source = 'healthfit'").fetchone()[0], 7100)

    def test_dropbox_pagination_filters_fit_files(self):
        first = Mock()
        first.json.return_value = {
            "entries": [{".tag": "file", "name": "run.fit"}, {".tag": "file", "name": "notes.txt"}],
            "has_more": True, "cursor": "next",
        }
        second = Mock()
        second.json.return_value = {
            "entries": [{".tag": "file", "name": "ride.FIT"}], "has_more": False,
        }
        session = Mock()
        session.post.side_effect = [first, second]
        found = dropbox_files(session, "test-token", "/Apps/HealthFitExporter")
        self.assertEqual([item["name"] for item in found], ["run.fit", "ride.FIT"])
        self.assertEqual(session.post.call_args_list[1].kwargs["json"], {"cursor": "next"})


if __name__ == "__main__":
    unittest.main()
