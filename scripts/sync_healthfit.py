#!/usr/bin/env python3
"""Import HealthFit FIT exports from Dropbox without replacing existing activities."""

import argparse
import hashlib
import io
import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
from garmin_fit_sdk import Decoder, Stream


DATA_DIR = Path(__file__).resolve().parents[1] / "apps/web/data"
DB_PATH = DATA_DIR / "running_page_2.db"
FIT_SUFFIX = ".fit"


class HealthFitSyncError(Exception):
    """An import failure that must stop the workflow before committing data."""


def utc_datetime(value):
    if not isinstance(value, datetime):
        raise HealthFitSyncError("FIT session has no valid start time")
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def coordinates(value):
    if value is None or not isinstance(value, (float, int)):
        return None
    # The FIT SDK returns positions in semicircles. Accept degree values too.
    result = value * 180 / (2 ** 31) if abs(value) > 180 else value
    return result if -180 <= result <= 180 else None


def encode_polyline(points):
    encoded = []
    previous = (0, 0)
    for latitude, longitude in points:
        current = (round(latitude * 100000), round(longitude * 100000))
        for index in (0, 1):
            delta = current[index] - previous[index]
            value = ~(delta << 1) if delta < 0 else delta << 1
            while value >= 0x20:
                encoded.append(chr((0x20 | (value & 0x1F)) + 63))
                value >>= 5
            encoded.append(chr(value + 63))
        previous = current
    return "".join(encoded)


def route_summary(points, max_length=1200):
    if len(points) < 2:
        return None
    # Keep start/end and distribute the remaining points across the route.
    for target_count in (240, 160, 100, 60, 40, 20):
        if len(points) <= target_count:
            sampled = points
        else:
            sampled = [points[round(index * (len(points) - 1) / (target_count - 1))] for index in range(target_count)]
        result = encode_polyline(sampled)
        if len(result) <= max_length:
            return result
    raise HealthFitSyncError("FIT route cannot be represented within map URL limits")


def sport_type(session):
    sport = str(session.get("sport") or "").lower()
    sub_sport = str(session.get("sub_sport") or "").lower()
    if sport == "running":
        return ("Run", "TrailRun" if "trail" in sub_sport else "Treadmill" if "treadmill" in sub_sport else "RoadRun")
    if sport == "cycling":
        return ("Ride", "IndoorBike" if "indoor" in sub_sport else "RoadBike")
    if sport == "swimming":
        return ("Swim", "OpenWaterSwim" if "open" in sub_sport else "PoolSwim")
    if sport in ("walking", "hiking"):
        return ("Hike" if sport == "hiking" else "Walk", None)
    if sport in ("training", "fitness_equipment", "strength_training"):
        return ("WeightTraining", None)
    return ("Other", None)


def local_start_from_filename(name):
    match = re.match(r"^(\d{4}-\d{2}-\d{2})-(\d{6})-", name)
    if not match:
        return None
    try:
        return datetime.strptime("".join(match.groups()), "%Y-%m-%d%H%M%S").isoformat()
    except ValueError:
        return None


def activity_name(name, activity_type):
    match = re.match(r"^\d{4}-\d{2}-\d{2}-\d{6}-(.+?)(?:-[^-]+)?\.fit$", name, re.IGNORECASE)
    return match.group(1) if match else activity_type


def parse_fit(content, filename):
    try:
        messages, errors = Decoder(Stream.from_bytes_io(io.BytesIO(content))).read()
    except Exception as exc:
        raise HealthFitSyncError("Cannot decode a HealthFit FIT file") from exc
    if errors:
        raise HealthFitSyncError("A HealthFit FIT file has decoding errors")
    sessions = messages.get("session_mesgs") or []
    if not sessions:
        raise HealthFitSyncError("A HealthFit FIT file has no activity session")
    records = messages.get("record_mesgs") or []
    activities = []
    for index, session in enumerate(sessions):
        start = utc_datetime(session.get("start_time"))
        elapsed = float(session.get("total_elapsed_time") or session.get("total_timer_time") or 0)
        end = start + timedelta(seconds=elapsed)
        session_records = [
            record for record in records
            if isinstance(record.get("timestamp"), datetime)
            and start - timedelta(seconds=2) <= utc_datetime(record["timestamp"]) <= end + timedelta(seconds=2)
        ]
        points = []
        for record in session_records:
            latitude = coordinates(record.get("position_lat"))
            longitude = coordinates(record.get("position_long"))
            if latitude is not None and longitude is not None and -90 <= latitude <= 90:
                point = (latitude, longitude)
                if not points or point != points[-1]:
                    points.append(point)
        activity_type, sub_type = sport_type(session)
        start_iso = start.isoformat().replace("+00:00", "Z")
        external_id = f"healthfit:{start_iso}:{index}"
        distance = float(session.get("total_distance") or 0)
        moving_time = round(float(session.get("total_timer_time") or elapsed))
        activities.append({
            "external_id": external_id,
            "source": "healthfit",
            "name": activity_name(filename, activity_type),
            "type": activity_type,
            "sport_type": sub_type,
            "start_date": start_iso,
            "start_date_local": local_start_from_filename(filename) or start_iso,
            "distance": distance,
            "moving_time": moving_time,
            "elapsed_time": round(elapsed),
            "total_elevation_gain": session.get("total_ascent"),
            "average_speed": session.get("enhanced_avg_speed") or session.get("avg_speed"),
            "max_speed": session.get("enhanced_max_speed") or session.get("max_speed"),
            "start_latitude": points[0][0] if points else None,
            "start_longitude": points[0][1] if points else None,
            "end_latitude": points[-1][0] if points else None,
            "end_longitude": points[-1][1] if points else None,
            "summary_polyline": route_summary(points),
            "average_heartrate": session.get("avg_heart_rate"),
            "max_heartrate": session.get("max_heart_rate"),
            "calories": session.get("total_calories"),
            "average_cadence": session.get("avg_cadence"),
            "average_power": session.get("avg_power"),
            "weighted_average_power": session.get("normalized_power"),
        })
    return activities


def dropbox_access_token(session):
    required = ("DROPBOX_APP_KEY", "DROPBOX_APP_SECRET", "DROPBOX_REFRESH_TOKEN")
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise HealthFitSyncError("Missing Dropbox credentials: " + ", ".join(missing))
    try:
        response = session.post(
            "https://api.dropbox.com/oauth2/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": os.environ["DROPBOX_REFRESH_TOKEN"],
                "client_id": os.environ["DROPBOX_APP_KEY"],
                "client_secret": os.environ["DROPBOX_APP_SECRET"],
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["access_token"]
    except (requests.RequestException, KeyError, ValueError) as exc:
        raise HealthFitSyncError("Dropbox authorization failed") from exc


def dropbox_files(session, token, folder):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = "https://api.dropboxapi.com/2/files/list_folder"
    payload = {"path": folder, "recursive": True, "include_deleted": False}
    found = []
    while True:
        try:
            response = session.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            batch = response.json()
        except (requests.RequestException, ValueError) as exc:
            raise HealthFitSyncError("Cannot list HealthFit Dropbox folder") from exc
        found.extend(
            entry for entry in batch.get("entries", [])
            if entry.get(".tag") == "file" and entry.get("name", "").lower().endswith(FIT_SUFFIX)
        )
        if not batch.get("has_more"):
            break
        url = "https://api.dropboxapi.com/2/files/list_folder/continue"
        payload = {"cursor": batch["cursor"]}
    return found


def download_dropbox_file(session, token, metadata):
    try:
        response = session.post(
            "https://content.dropboxapi.com/2/files/download",
            headers={
                "Authorization": f"Bearer {token}",
                "Dropbox-API-Arg": json.dumps({"path": metadata["id"]}),
            },
            timeout=60,
        )
        response.raise_for_status()
        return response.content
    except (requests.RequestException, KeyError) as exc:
        raise HealthFitSyncError("Cannot download HealthFit FIT file") from exc


def ensure_import_table(db):
    db.execute("""
        CREATE TABLE IF NOT EXISTS healthfit_imports (
            file_key TEXT PRIMARY KEY,
            revision TEXT NOT NULL,
            activity_count INTEGER NOT NULL,
            imported_at TEXT NOT NULL
        )
    """)


def is_duplicate(db, activity):
    start = utc_datetime(datetime.fromisoformat(activity["start_date"].replace("Z", "+00:00")))
    earliest = (start - timedelta(seconds=120)).isoformat().replace("+00:00", "Z")
    latest = (start + timedelta(seconds=120)).isoformat().replace("+00:00", "Z")
    candidates = db.execute(
        "SELECT id, source, type, start_date, distance, moving_time, summary_polyline FROM activities WHERE start_date BETWEEN ? AND ?",
        (earliest, latest),
    ).fetchall()
    matches = []
    for row in candidates:
        if row["type"] != activity["type"]:
            continue
        if abs((row["distance"] or 0) - activity["distance"]) > max(50, activity["distance"] * 0.05):
            continue
        if abs((row["moving_time"] or 0) - activity["moving_time"]) > max(90, activity["moving_time"] * 0.10):
            continue
        matches.append(row)
    if len(matches) > 1:
        # Historical Strava imports can contain two IDs for the same workout.
        # They are one logical match only when all identifying metrics agree.
        identity = lambda row: (row["start_date"], row["type"], row["distance"], row["moving_time"])
        if all(identity(row) == identity(matches[0]) for row in matches[1:]):
            return min(matches, key=lambda row: row["id"])
        raise HealthFitSyncError(f"Ambiguous existing activity match near {activity['start_date']}")
    return matches[0] if matches else None


def import_activities(db, files):
    """files contains (file_key, revision, file_name, FIT bytes) tuples."""
    ensure_import_table(db)
    pending = []
    for file_key, revision, filename, content in files:
        current = db.execute("SELECT revision FROM healthfit_imports WHERE file_key = ?", (file_key,)).fetchone()
        if current and current[0] == revision:
            continue
        pending.append((file_key, revision, filename, parse_fit(content, filename)))

    counts = {"files": len(pending), "created": 0, "updated": 0, "matched": 0, "enriched": 0}
    now = datetime.now(timezone.utc).isoformat()
    with db:
        for file_key, revision, filename, activities in pending:
            for activity in activities:
                existing = db.execute("SELECT id, source, type, distance, moving_time, summary_polyline FROM activities WHERE external_id = ?", (activity["external_id"],)).fetchone()
                if existing and existing["source"] == "healthfit":
                    fields = [field for field in activity if field not in ("external_id", "source")]
                    db.execute(
                        f"UPDATE activities SET {', '.join(f'{field} = ?' for field in fields)}, updated_at = ?, synced_at = ? WHERE id = ?",
                        [activity[field] for field in fields] + [now, now, existing["id"]],
                    )
                    counts["updated"] += 1
                    continue
                if existing is None:
                    existing = is_duplicate(db, activity)
                if existing:
                    counts["matched"] += 1
                    if not existing["summary_polyline"] and activity["summary_polyline"]:
                        db.execute("""
                            UPDATE activities SET summary_polyline = ?, start_latitude = ?, start_longitude = ?,
                            end_latitude = ?, end_longitude = ?, updated_at = ? WHERE id = ?
                        """, (
                            activity["summary_polyline"], activity["start_latitude"], activity["start_longitude"],
                            activity["end_latitude"], activity["end_longitude"], now, existing["id"],
                        ))
                        counts["enriched"] += 1
                    continue
                fields = list(activity)
                db.execute(
                    f"INSERT INTO activities ({', '.join(fields)}, synced_at) VALUES ({', '.join('?' for _ in fields)}, ?)",
                    [activity[field] for field in fields] + [now],
                )
                counts["created"] += 1
            db.execute("""
                INSERT INTO healthfit_imports (file_key, revision, activity_count, imported_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(file_key) DO UPDATE SET revision = excluded.revision,
                activity_count = excluded.activity_count,
                imported_at = excluded.imported_at
            """, (file_key, revision, len(activities), now))
        if pending:
            db.execute("""
                INSERT INTO sync_logs (user_id, source, sync_type, status, activities_processed,
                activities_created, activities_updated, activities_skipped, started_at, completed_at)
                VALUES (1, 'healthfit', 'scheduled', 'success', ?, ?, ?, ?, ?, ?)
            """, (counts["created"] + counts["updated"] + counts["matched"], counts["created"], counts["updated"], counts["matched"], now, now))
            db.execute("""
                INSERT INTO data_source_settings (user_id, source, auto_sync, sync_frequency,
                last_sync_at, is_active, connection_status, created_at, updated_at)
                VALUES (1, 'healthfit', 1, 'daily', ?, 1, 'connected', ?, ?)
                ON CONFLICT(user_id, source) DO UPDATE SET last_sync_at = excluded.last_sync_at,
                is_active = 1, connection_status = 'connected', updated_at = excluded.updated_at
            """, (now, now, now))
    return counts


def local_files(folder):
    paths = sorted(Path(folder).rglob("*.fit"))
    files = []
    for path in paths:
        content = path.read_bytes()
        digest = hashlib.sha256(content).hexdigest()
        files.append((digest, digest, path.name, content))
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local-dir", help="Import a local FIT export folder instead of Dropbox")
    parser.add_argument("--database", type=Path, default=DB_PATH)
    args = parser.parse_args()
    if not args.database.exists():
        raise HealthFitSyncError(f"Activity database does not exist: {args.database}")
    with sqlite3.connect(args.database) as db:
        db.row_factory = sqlite3.Row
        ensure_import_table(db)
        if args.local_dir:
            files = local_files(args.local_dir)
        else:
            folder = os.getenv("HEALTHFIT_DROPBOX_FOLDER")
            if not folder or not folder.startswith("/"):
                raise HealthFitSyncError("HEALTHFIT_DROPBOX_FOLDER must be an absolute Dropbox folder path")
            session = requests.Session()
            token = dropbox_access_token(session)
            metadata = dropbox_files(session, token, folder)
            files = []
            for item in metadata:
                file_key = hashlib.sha256(item["id"].encode()).hexdigest()
                current = db.execute("SELECT revision FROM healthfit_imports WHERE file_key = ?", (file_key,)).fetchone()
                if current and current[0] == item["rev"]:
                    continue
                files.append((file_key, item["rev"], item["name"], download_dropbox_file(session, token, item)))
        if not files and db.execute("SELECT COUNT(*) FROM healthfit_imports").fetchone()[0] == 0:
            raise HealthFitSyncError("No FIT files found; check HealthFit export and Dropbox folder")
        counts = import_activities(db, files)
    print("HealthFit sync:", json.dumps(counts, sort_keys=True))


if __name__ == "__main__":
    try:
        main()
    except (HealthFitSyncError, OSError, sqlite3.Error) as exc:
        print(f"::error::{exc}", file=sys.stderr)
        sys.exit(1)
