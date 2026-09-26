#!/usr/bin/env python3
"""Create a Strava consent URL for the scheduled sync account."""

import os
from urllib.parse import urlencode


DEFAULT_REDIRECT_URI = "http://localhost/"


def main():
    client_id = os.getenv("STRAVA_CLIENT_ID") or input("Strava Client ID: ").strip()
    if not client_id:
        raise SystemExit("Strava Client ID is required")
    redirect_uri = os.getenv("STRAVA_REDIRECT_URI", DEFAULT_REDIRECT_URI)
    parameters = urlencode({
        "client_id": client_id,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "approval_prompt": "force",
        "scope": "read,activity:read_all",
    })
    print(f"https://www.strava.com/oauth/authorize?{parameters}")
    print("After approval, localhost may show a connection error; copy the full URL from the address bar.")
    print("Run scripts/get-new-token.py locally to exchange that URL for a refresh token.")


if __name__ == "__main__":
    main()
