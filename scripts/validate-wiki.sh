#!/bin/bash

# Wiki Validation Script
# Checks wiki pages for completeness and common issues

set -e

WIKI_DIR="wiki"
ISSUES_FOUND=0

echo "🔍 Validating wiki pages..."

if [ ! -d "$WIKI_DIR" ]; then
    echo "❌ Wiki directory not found!"
    exit 1
fi

cd "$WIKI_DIR"

echo ""
echo "📚 Wiki Pages Found:"
echo "===================="
for file in *.md; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        lines=$(wc -l < "$file")
        echo "📄 $file - ${size} bytes, ${lines} lines"
    fi
done

echo ""
echo "🔍 Checking for common issues..."
echo "================================"

# Check for placeholder text
echo "🔎 Checking for placeholders..."
if grep -r "your-username\|your-email\|example\.com\|TODO\|FIXME" *.md > /dev/null 2>&1; then
    echo "⚠️  Found placeholder text:"
    grep -n "your-username\|your-email\|example\.com\|TODO\|FIXME" *.md
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "✅ No placeholder text found"
fi

# Check for broken internal links
echo ""
echo "🔗 Checking internal links..."
BROKEN_LINKS=0
for file in *.md; do
    if [ -f "$file" ]; then
        # Extract markdown links [text](link)
        grep -o '\[.*\]([^)]*\.md[^)]*)' "$file" 2>/dev/null | while read -r link; do
            # Extract the link part
            link_target=$(echo "$link" | sed 's/.*(\([^)]*\)).*/\1/')
            # Remove anchors
            link_file=$(echo "$link_target" | cut -d'#' -f1)
            
            if [ -n "$link_file" ] && [ ! -f "$link_file" ]; then
                echo "❌ Broken link in $file: $link_target"
                BROKEN_LINKS=$((BROKEN_LINKS + 1))
            fi
        done
    fi
done

if [ $BROKEN_LINKS -eq 0 ]; then
    echo "✅ No broken internal links found"
fi

# Check for empty files
echo ""
echo "📝 Checking for empty or very small files..."
EMPTY_FILES=0
for file in *.md; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        if [ $size -lt 100 ]; then
            echo "⚠️  Very small file: $file (${size} bytes)"
            EMPTY_FILES=$((EMPTY_FILES + 1))
        fi
    fi
done

if [ $EMPTY_FILES -eq 0 ]; then
    echo "✅ No empty files found"
fi

# Check for required pages
echo ""
echo "📋 Checking for required pages..."
REQUIRED_PAGES=(
    "Home.md"
    "Quick-Setup-Guide-⚡.md"
    "Static-Map-Caching.md"
    "Strava-Integration-Guide-🏃‍♂️.md"
    "Fork-and-Deploy-Guide-🚀.md"
)

MISSING_PAGES=0
for page in "${REQUIRED_PAGES[@]}"; do
    if [ ! -f "$page" ]; then
        echo "❌ Missing required page: $page"
        MISSING_PAGES=$((MISSING_PAGES + 1))
    else
        echo "✅ Found: $page"
    fi
done

# Summary
echo ""
echo "📊 Validation Summary"
echo "===================="
if [ $ISSUES_FOUND -eq 0 ] && [ $BROKEN_LINKS -eq 0 ] && [ $EMPTY_FILES -eq 0 ] && [ $MISSING_PAGES -eq 0 ]; then
    echo "🎉 All wiki pages are valid!"
    echo "✅ No issues found"
else
    echo "⚠️  Issues found:"
    [ $ISSUES_FOUND -gt 0 ] && echo "   - $ISSUES_FOUND placeholder issues"
    [ $BROKEN_LINKS -gt 0 ] && echo "   - $BROKEN_LINKS broken links"
    [ $EMPTY_FILES -gt 0 ] && echo "   - $EMPTY_FILES empty/small files"
    [ $MISSING_PAGES -gt 0 ] && echo "   - $MISSING_PAGES missing required pages"
fi

echo ""
echo "🔗 Wiki URL: https://github.com/oiahoon/running2.0/wiki"
