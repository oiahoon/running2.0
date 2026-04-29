#!/bin/bash

# Manual Homepage Deployment Script
# This script manually deploys the homepage to GitHub Pages

set -e

echo "Deploy Starting homepage deployment..."

# Check if we're in the right directory
if [ ! -d "homepage" ]; then
    echo "Error Error: homepage directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "Error Error: git is not installed!"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Location Current branch: $CURRENT_BRANCH"

# Stash any uncommitted changes
echo "Save Stashing any uncommitted changes..."
git stash push -m "Auto-stash before homepage deployment"

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Directory Using temporary directory: $TEMP_DIR"

# Copy homepage files to temp directory
echo "List Copying homepage files..."
cp -r homepage/* "$TEMP_DIR/"

# Generate sitemap
echo "Map Generating sitemap..."
cat > "$TEMP_DIR/sitemap.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://oiahoon.github.io/running2.0/</loc>
    <lastmod>$(date -u +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

# Generate robots.txt
echo "Bot Generating robots.txt..."
cat > "$TEMP_DIR/robots.txt" << EOF
User-agent: *
Allow: /

Sitemap: https://oiahoon.github.io/running2.0/sitemap.xml
EOF

# Add build timestamp
echo "⏰ Adding build timestamp..."
echo "<!-- Built on $(date -u) -->" >> "$TEMP_DIR/index.html"

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "Branch gh-pages branch exists, switching to it..."
    git checkout gh-pages
else
    echo "New Creating new gh-pages branch..."
    git checkout --orphan gh-pages
fi

# Remove all files from gh-pages branch
echo "Cleanup Cleaning gh-pages branch..."
git rm -rf . 2>/dev/null || true

# Copy files from temp directory
echo "Package Copying new files..."
cp -r "$TEMP_DIR"/* .

# Add all files
echo "Add Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️ No changes to deploy."
else
    # Commit changes
    echo "Save Committing changes..."
    git commit -m "Deploy homepage - $(date -u)"
    
    # Push to GitHub
    echo "Deploy Pushing to GitHub..."
    git push origin gh-pages
    
    echo "OK Homepage deployed successfully!"
fi

# Switch back to original branch
echo "Sync Switching back to $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH"

# Restore stashed changes
echo "Upload Restoring stashed changes..."
git stash pop 2>/dev/null || echo "No stashed changes to restore."

# Clean up temp directory
echo "Cleanup Cleaning up..."
rm -rf "$TEMP_DIR"

echo ""
echo "Done Deployment completed!"
echo "Web Your homepage should be available at:"
echo "   https://oiahoon.github.io/running2.0/"
echo ""
echo "List Next steps:"
echo "1. Go to https://github.com/oiahoon/running2.0/settings/pages"
echo "2. Set source to 'Deploy from a branch'"
echo "3. Select 'gh-pages' branch and '/ (root)' folder"
echo "4. Save settings"
echo "5. Wait 5-10 minutes for deployment"
echo ""
echo "Search Check deployment status at:"
echo "   https://github.com/oiahoon/running2.0/deployments"
