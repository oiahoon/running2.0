#!/bin/bash

# Sync Wiki Submodule
# This script manages the wiki submodule and pushes updates

set -e

WIKI_DIR="wiki"

echo "🔄 Syncing wiki submodule..."

# Check if wiki submodule exists
if [ ! -d "$WIKI_DIR" ]; then
    echo "❌ Wiki submodule not found! Initializing..."
    git submodule update --init --recursive
fi

# Navigate to wiki directory
cd "$WIKI_DIR"

# Pull latest changes from wiki repository
echo "📥 Pulling latest wiki changes..."
git pull origin master

# Check if there are local changes to commit
if ! git diff --quiet || ! git diff --staged --quiet; then
    echo "📝 Committing local wiki changes..."
    git add .
    git commit -m "📚 Update wiki documentation

Auto-synced from main repository at $(date)

- Updated documentation
- Improved technical details
- Enhanced troubleshooting guides"
    
    echo "🚀 Pushing wiki changes..."
    git push origin master
else
    echo "✅ No local changes to commit"
fi

# Go back to main repository
cd ..

# Update submodule reference in main repository
echo "🔗 Updating submodule reference in main repository..."
git add wiki
if ! git diff --staged --quiet; then
    git commit -m "📚 Update wiki submodule reference

Updated wiki documentation with latest changes"
    
    echo "🚀 Pushing main repository changes..."
    git push origin master
else
    echo "✅ No submodule reference changes"
fi

echo "✅ Wiki sync completed successfully!"
echo "🔗 View wiki at: https://github.com/oiahoon/running2.0/wiki"

# Display current submodule status
echo ""
echo "📊 Current submodule status:"
git submodule status
