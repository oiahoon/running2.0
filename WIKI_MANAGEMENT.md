# Wiki Management Guide

This project uses Git submodules to manage the GitHub Wiki, allowing unified version control and easier maintenance.

## 🏗️ Setup

### Initial Clone
```bash
# Clone with submodules
git clone --recursive https://github.com/oiahoon/running2.0.git

# Or if already cloned, initialize submodules
git submodule update --init --recursive
```

### Submodule Structure
```
running2.0/
├── .gitmodules          # Submodule configuration
├── wiki/               # Wiki submodule (points to running2.0.wiki.git)
│   ├── Home.md
│   ├── Static-Map-Caching.md
│   └── ...
└── scripts/
    └── sync-wiki.sh    # Automated sync script
```

## 📝 Editing Wiki

### Method 1: Direct Editing (Recommended)
```bash
# Navigate to wiki directory
cd wiki

# Edit files directly
vim Static-Map-Caching.md

# Commit changes
git add .
git commit -m "Update documentation"
git push origin master

# Update main repository reference
cd ..
git add wiki
git commit -m "Update wiki submodule"
git push origin master
```

### Method 2: Automated Sync
```bash
# Use the sync script
./scripts/sync-wiki.sh

# This will:
# 1. Pull latest wiki changes
# 2. Commit any local changes
# 3. Push to wiki repository
# 4. Update submodule reference in main repo
```

## 🔄 Common Workflows

### Adding New Wiki Pages
```bash
cd wiki
echo "# New Page" > New-Feature.md
git add New-Feature.md
git commit -m "Add new feature documentation"
git push origin master

# Update main repository
cd ..
git add wiki
git commit -m "Add new wiki page"
git push origin master
```

### Updating Existing Pages
```bash
cd wiki
# Edit existing files
git add .
git commit -m "Update existing documentation"
git push origin master

# Sync with main repository
cd ..
./scripts/sync-wiki.sh
```

### Pulling Wiki Updates
```bash
# Pull updates from wiki repository
cd wiki
git pull origin master

# Update main repository reference
cd ..
git add wiki
git commit -m "Update wiki submodule reference"
git push origin master
```

## 🔧 Advanced Operations

### Reset Wiki Submodule
```bash
# If submodule gets out of sync
git submodule deinit wiki
git rm wiki
git submodule add git@github.com:oiahoon/running2.0.wiki.git wiki
```

### Check Submodule Status
```bash
# View submodule status
git submodule status

# View submodule summary
git submodule summary
```

### Update All Submodules
```bash
# Update all submodules to latest
git submodule update --remote --merge
```

## 🐛 Troubleshooting

### Authentication Issues
```bash
# Ensure SSH key is set up for GitHub
ssh -T git@github.com

# Change submodule URL to SSH
cd wiki
git remote set-url origin git@github.com:oiahoon/running2.0.wiki.git
```

### Submodule Not Initialized
```bash
# Initialize missing submodules
git submodule update --init --recursive
```

### Detached HEAD State
```bash
cd wiki
git checkout master
git pull origin master
```

### Merge Conflicts
```bash
cd wiki
# Resolve conflicts manually
git add .
git commit -m "Resolve merge conflicts"
git push origin master
```

## 📚 Best Practices

### 1. Always Sync After Wiki Changes
```bash
# After editing wiki files
./scripts/sync-wiki.sh
```

### 2. Use Descriptive Commit Messages
```bash
git commit -m "📚 Add troubleshooting guide for static maps

- Added common issues and solutions
- Included debug commands
- Enhanced performance tips"
```

### 3. Regular Updates
```bash
# Pull wiki updates regularly
cd wiki && git pull origin master
```

### 4. Test Documentation
- Preview Markdown files before committing
- Verify links and formatting
- Test code examples

## 🎯 Benefits of Submodule Approach

### ✅ Advantages
- **Unified Workflow** - Manage wiki with same Git workflow
- **Version Control** - Full history of documentation changes
- **Branching Support** - Create feature branches for documentation
- **Automated Sync** - Script handles complex operations
- **Consistency** - Same tools and processes for code and docs

### ⚠️ Considerations
- **Learning Curve** - Requires understanding of Git submodules
- **Two-Step Process** - Changes require commits in both repositories
- **Sync Complexity** - Need to keep main repo and submodule in sync

## 🚀 Automation

### GitHub Actions Integration
```yaml
# .github/workflows/sync-wiki.yml
name: Sync Wiki
on:
  push:
    paths:
      - 'wiki/**'
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      - name: Sync Wiki
        run: ./scripts/sync-wiki.sh
```

### Pre-commit Hooks
```bash
# .git/hooks/pre-commit
#!/bin/bash
if [ -d "wiki" ]; then
  cd wiki
  if ! git diff --quiet; then
    echo "Warning: Wiki has uncommitted changes"
    exit 1
  fi
fi
```

This submodule approach provides the best of both worlds: the convenience of managing documentation alongside code, while maintaining the GitHub Wiki's web interface and discoverability.
