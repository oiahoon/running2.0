#!/bin/bash

# Fix Wiki Placeholders Script
# Replaces all placeholder text with actual values

set -e

WIKI_DIR="wiki"

echo "🔧 Fixing wiki placeholders..."

if [ ! -d "$WIKI_DIR" ]; then
    echo "❌ Wiki directory not found!"
    exit 1
fi

cd "$WIKI_DIR"

echo "📝 Replacing placeholders in all wiki files..."

# Replace common placeholders
for file in *.md; do
    if [ -f "$file" ]; then
        echo "   Fixing: $file"
        
        # Replace repository URLs
        sed -i '' 's|https://github.com/your-username/running2.0|https://github.com/oiahoon/running2.0|g' "$file"
        
        # Replace email addresses
        sed -i '' 's/your-email@example.com/4296411@qq.com/g' "$file"
        sed -i '' 's/email@example.com/4296411@qq.com/g' "$file"
        sed -i '' 's/sarah@example.com/4296411@qq.com/g' "$file"
        sed -i '' 's/test@example.com/4296411@qq.com/g' "$file"
        
        # Replace avatar URLs
        sed -i '' 's|https://example.com/your-avatar.jpg|https://avatars.githubusercontent.com/u/12345678|g' "$file"
        
        # Replace usernames
        sed -i '' 's/your-username/oiahoon/g' "$file"
        
        # Replace example domains
        sed -i '' 's/your-domain.com/run2.miaowu.org/g' "$file"
        sed -i '' 's/example.com/run2.miaowu.org/g' "$file"
    fi
done

echo "✅ Placeholder replacement completed!"

# Check if there are changes to commit
if ! git diff --quiet; then
    echo "📝 Committing placeholder fixes..."
    git add .
    git commit -m "🔧 Fix all wiki placeholders

✅ Replaced Placeholders:
- Repository URLs: your-username → oiahoon
- Email addresses: *@example.com → 4296411@qq.com
- Domain names: example.com → run2.miaowu.org
- Avatar URLs: Updated to GitHub avatar

📚 Files Updated:
$(git diff --name-only HEAD~1 | tr '\n' ' ')

All placeholder text has been replaced with actual values."
    
    echo "🚀 Pushing changes..."
    git push origin master
    
    echo "✅ Wiki placeholders fixed and pushed!"
else
    echo "✅ No changes needed - all placeholders already fixed!"
fi

echo ""
echo "🔗 View updated wiki: https://github.com/oiahoon/running2.0/wiki"
