#!/usr/bin/env python3
"""Exchange a Strava consent code and verify activity access locally."""

import getpass
import os
from urllib.parse import parse_qs, urlparse

import requests


DEFAULT_REDIRECT_URI = "http://localhost/"


def main():
    client_id = os.getenv("STRAVA_CLIENT_ID") or input("Strava Client ID: ").strip()
    client_secret = getpass.getpass("Strava Client Secret: ")
    redirect_uri = os.getenv("STRAVA_REDIRECT_URI", DEFAULT_REDIRECT_URI)
    redirected_url = input("Full URL after Strava approval: ").strip()
    parsed = urlparse(redirected_url)
    parameters = parse_qs(parsed.query)

    expected = urlparse(redirect_uri)
    if (parsed.scheme, parsed.netloc, parsed.path) != (expected.scheme, expected.netloc, expected.path):
        raise SystemExit("The redirect URL does not match the authorization URL")
    if "activity:read_all" not in parameters.get("scope", [""])[0].split(","):
        raise SystemExit("Strava did not grant activity:read_all; no token was exchanged")
    code = parameters.get("code", [None])[0]
    if not code or not client_id or not client_secret:
        raise SystemExit("Client ID, Client Secret, and authorization code are required")

    try:
        response = requests.post(
            "https://www.strava.com/oauth/token",
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
                "grant_type": "authorization_code",
            },
            timeout=30,
        )
        response.raise_for_status()
        token_data = response.json()
        access_token = token_data["access_token"]
        refresh_token = token_data["refresh_token"]
        verification = requests.get(
            "https://www.strava.com/api/v3/athlete/activities",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"page": 1, "per_page": 1},
            timeout=30,
        )
        verification.raise_for_status()
    except (requests.RequestException, KeyError, ValueError) as exc:
        status = getattr(getattr(exc, "response", None), "status_code", None)
        raise SystemExit(f"Authorization or activity access failed: HTTP {status}" if status else "Authorization or activity access failed") from exc

    print("Activity access verified. Set these GitHub Actions secrets:")
    print("STRAVA_CLIENT_SECRET: the current secret from Strava settings")
    print(f"STRAVA_REFRESH_TOKEN: {refresh_token}")
    print("Treat the displayed refresh token as private; clear the terminal when done.")


if __name__ == "__main__":
    main()
