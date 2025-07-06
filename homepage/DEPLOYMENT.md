# Homepage Deployment Guide

## 🚀 GitHub Pages Deployment

### Method 1: Enable GitHub Pages (Recommended)

1. **Go to Repository Settings**
   - Visit: https://github.com/oiahoon/running2.0/settings
   - Scroll down to "Pages" section

2. **Configure Pages Source**
   - Source: "Deploy from a branch"
   - Branch: "gh-pages" 
   - Folder: "/ (root)"
   - Click "Save"

3. **Enable GitHub Actions**
   - Go to Settings → Actions → General
   - Under "Workflow permissions":
     - Select "Read and write permissions"
     - Check "Allow GitHub Actions to create and approve pull requests"
   - Click "Save"

### Method 2: Manual Deployment

If automated deployment fails, you can deploy manually:

```bash
# Clone the repository
git clone https://github.com/oiahoon/running2.0.git
cd running2.0

# Create and switch to gh-pages branch
git checkout --orphan gh-pages

# Copy homepage files to root
cp homepage/* .

# Add and commit files
git add .
git commit -m "Deploy homepage"

# Push to GitHub
git push origin gh-pages
```

### Method 3: Vercel Deployment

For better performance, deploy to Vercel:

1. **Connect to Vercel**
   - Visit: https://vercel.com/new
   - Import your GitHub repository
   - Set root directory to "homepage"

2. **Configure Build Settings**
   - Build Command: `echo "Static site"`
   - Output Directory: `.`
   - Install Command: `npm install`

3. **Deploy**
   - Click "Deploy"
   - Get your custom URL

## 🔧 Troubleshooting

### Permission Errors
If you see "Permission denied" errors:

1. **Check Repository Permissions**
   - Go to Settings → Actions → General
   - Enable "Read and write permissions"

2. **Verify Branch Protection**
   - Go to Settings → Branches
   - Ensure gh-pages branch isn't protected

3. **Check Workflow Permissions**
   - In workflow file, add:
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```

### Build Failures
If builds fail:

1. **Check File Paths**
   - Ensure all files are in homepage/ directory
   - Verify image paths are correct

2. **Test Locally**
   ```bash
   cd homepage
   python3 -m http.server 3000
   # Visit http://localhost:3000
   ```

3. **Check Dependencies**
   - Ensure package.json is valid
   - Remove problematic dependencies

## 📊 Deployment Status

### Current Status
- ✅ Files prepared and committed
- ⏳ Waiting for GitHub Pages configuration
- 🔄 Automated deployment ready

### Expected URLs
- **GitHub Pages**: https://oiahoon.github.io/running2.0/
- **Test Page**: https://oiahoon.github.io/running2.0/test.html

### Performance Targets
- **Load Time**: < 2 seconds
- **Lighthouse Score**: 90+
- **Mobile Friendly**: ✅
- **SEO Optimized**: ✅

## 🎯 Next Steps

1. **Enable GitHub Pages** in repository settings
2. **Wait for deployment** (usually 5-10 minutes)
3. **Test the live site** at the GitHub Pages URL
4. **Configure custom domain** (optional)
5. **Set up analytics** (optional)

## 📞 Support

If you encounter issues:
- Check GitHub Actions logs
- Review this deployment guide
- Open an issue in the repository
- Contact: 4296411@qq.com

---

**The homepage is ready to deploy! Just enable GitHub Pages in your repository settings.** 🚀
