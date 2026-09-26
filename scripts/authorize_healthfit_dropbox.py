#!/usr/bin/env python3
"""Grant read-only Dropbox access for the HealthFit GitHub Actions workflow."""

import getpass
import json
import shutil
import subprocess
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


REPOSITORY = "oiahoon/running2.0"
SCOPES = "files.metadata.read files.content.read"


def main():
    print("Create a Dropbox API app with Full Dropbox access and read-only file scopes.")
    print("A dedicated Dropbox Basic account limits what the app can see.")
    app_key = input("Dropbox App key: ").strip()
    app_secret = getpass.getpass("Dropbox App secret: ")
    if not app_key or not app_secret:
        raise SystemExit("App key and secret are required")
    authorization_url = "https://www.dropbox.com/oauth2/authorize?" + urlencode({
        "client_id": app_key,
        "response_type": "code",
        "token_access_type": "offline",
        "scope": SCOPES,
    })
    print("Open this URL and allow read-only access:")
    print(authorization_url)
    code = getpass.getpass("Authorization code shown by Dropbox: ").strip()
    if not code:
        raise SystemExit("Authorization code is required")
    try:
        request = Request(
            "https://api.dropbox.com/oauth2/token",
            data=urlencode({
                "code": code,
                "grant_type": "authorization_code",
                "client_id": app_key,
                "client_secret": app_secret,
            }).encode(),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        with urlopen(request, timeout=30) as response:
            token = json.load(response)["refresh_token"]
    except (HTTPError, URLError, KeyError, ValueError) as exc:
        raise SystemExit("Dropbox authorization failed; no credentials were saved") from exc

    print("Dropbox read access authorized.")
    github_ready = bool(shutil.which("gh")) and subprocess.run(
        ["gh", "auth", "status"], capture_output=True, check=False
    ).returncode == 0
    if github_ready and input(f"Save credentials to GitHub Actions Secrets in {REPOSITORY}? [y/N] ").lower() == "y":
        for name, value in (
            ("DROPBOX_APP_KEY", app_key),
            ("DROPBOX_APP_SECRET", app_secret),
            ("DROPBOX_REFRESH_TOKEN", token),
        ):
            subprocess.run(
                ["gh", "secret", "set", name, "-R", REPOSITORY],
                input=value,
                text=True,
                check=True,
                stdout=subprocess.DEVNULL,
            )
        print("Dropbox credentials saved to GitHub Actions Secrets.")
    else:
        if not github_ready:
            print("GitHub CLI is not signed in. Run 'gh auth login' to enable direct secret setup.")
        print(f"DROPBOX_APP_KEY: {app_key}")
        print("DROPBOX_APP_SECRET: the secret you entered")
        print(f"DROPBOX_REFRESH_TOKEN: {token}")
        print("Do not commit or send these values in chat. Clear the terminal after saving them.")


if __name__ == "__main__":
    main()
