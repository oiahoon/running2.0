#!/bin/bash

# Sync Wiki to GitHub
# This script clones the GitHub wiki repository and syncs local wiki files

set -e

REPO_URL="https://github.com/oiahoon/running2.0.wiki.git"
WIKI_DIR="wiki"
TEMP_WIKI_DIR="temp-wiki"

echo "🔄 Syncing wiki to GitHub..."

# Check if wiki directory exists
if [ ! -d "$WIKI_DIR" ]; then
    echo "❌ Wiki directory not found!"
    exit 1
fi

# Clone wiki repository to temp directory
echo "📥 Cloning wiki repository..."
if [ -d "$TEMP_WIKI_DIR" ]; then
    rm -rf "$TEMP_WIKI_DIR"
fi

git clone "$REPO_URL" "$TEMP_WIKI_DIR"

# Copy local wiki files to temp directory
echo "📋 Copying wiki files..."
cp -r "$WIKI_DIR"/* "$TEMP_WIKI_DIR"/

# Navigate to temp wiki directory
cd "$TEMP_WIKI_DIR"

# Check if there are changes
if git diff --quiet && git diff --staged --quiet; then
    echo "✅ No changes to sync"
    cd ..
    rm -rf "$TEMP_WIKI_DIR"
    exit 0
fi

# Add and commit changes
echo "📝 Committing changes..."
git add .
git commit -m "📚 Update wiki documentation

- Updated Static Map Caching documentation
- Added latest cache configuration
- Improved troubleshooting guide
- Added performance monitoring section

Auto-synced from main repository"

# Push changes
echo "🚀 Pushing to GitHub wiki..."
git push origin master

# Cleanup
cd ..
rm -rf "$TEMP_WIKI_DIR"

echo "✅ Wiki synced successfully!"
echo "🔗 View at: https://github.com/oiahoon/running2.0/wiki"
