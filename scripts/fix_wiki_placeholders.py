#!/usr/bin/env python3

import os
import glob
import re

def fix_placeholders():
    """Fix all placeholder text in wiki files"""
    
    wiki_dir = "wiki"
    if not os.path.exists(wiki_dir):
        print("❌ Wiki directory not found!")
        return False
    
    print("🔧 Fixing wiki placeholders...")
    
    # Define replacements
    replacements = {
        # Repository URLs
        r'https://github\.com/your-username/running2\.0': 'https://github.com/oiahoon/running2.0',
        r'your-username': 'oiahoon',
        
        # Email addresses
        r'your-email@example\.com': '4296411@qq.com',
        r'email@example\.com': '4296411@qq.com',
        r'sarah@example\.com': '4296411@qq.com',
        r'test@example\.com': '4296411@qq.com',
        
        # Domain names
        r'your-domain\.com': 'run2.miaowu.org',
        r'(?<!@)example\.com': 'run2.miaowu.org',
        
        # Avatar URLs
        r'https://example\.com/your-avatar\.jpg': 'https://avatars.githubusercontent.com/u/12345678',
    }
    
    # Process all markdown files
    md_files = glob.glob(os.path.join(wiki_dir, "*.md"))
    files_changed = []
    
    for file_path in md_files:
        print(f"   Processing: {os.path.basename(file_path)}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Apply all replacements
            for pattern, replacement in replacements.items():
                content = re.sub(pattern, replacement, content)
            
            # Write back if changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                files_changed.append(os.path.basename(file_path))
                print(f"   ✅ Updated: {os.path.basename(file_path)}")
            else:
                print(f"   ✅ No changes needed: {os.path.basename(file_path)}")
                
        except Exception as e:
            print(f"   ❌ Error processing {file_path}: {e}")
    
    if files_changed:
        print(f"\n📝 Files updated: {', '.join(files_changed)}")
        print("✅ Placeholder replacement completed!")
        return True
    else:
        print("\n✅ No changes needed - all placeholders already fixed!")
        return False

if __name__ == "__main__":
    fix_placeholders()
