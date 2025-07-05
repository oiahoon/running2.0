# Fork and Deploy Guide 🚀

Detailed step-by-step instructions for forking and deploying your Running Page 2.0.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Fork the Repository](#fork-the-repository)
- [Deploy to Vercel](#deploy-to-vercel)
- [Alternative Deployment Options](#alternative-deployment-options)
- [Verify Deployment](#verify-deployment)
- [Next Steps](#next-steps)

## Prerequisites

### Required Accounts
- ✅ **GitHub Account** - [Sign up here](https://github.com/join)
- ✅ **Vercel Account** - [Sign up here](https://vercel.com/signup)

### Optional Accounts
- 🗺️ **Mapbox Account** - [Sign up here](https://account.mapbox.com/auth/signup/) (for maps)
- 🏃‍♂️ **Strava Account** - [Sign up here](https://www.strava.com/register) (for data)

## Fork the Repository

### Step 1: Navigate to the Repository
1. **Visit**: https://github.com/your-username/running2.0
2. **Make sure you're signed in** to GitHub

### Step 2: Fork the Project
1. **Click the "Fork" button** in the top-right corner
   ![Fork Button](https://docs.github.com/assets/images/help/repository/fork_button.jpg)

2. **Choose the destination**:
   - Select your personal account
   - Keep the repository name as `running2.0`
   - ✅ Check "Copy the main branch only"

3. **Click "Create fork"**

### Step 3: Verify Your Fork
1. **You should now be at**: `https://github.com/YOUR_USERNAME/running2.0`
2. **You should see**: "forked from original-username/running2.0"

## Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. **Click this button** in your forked repository's README:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/running2.0)

2. **Sign in to Vercel** with GitHub

3. **Configure the project**:
   - **Project Name**: `running-page-2` (or your preference)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Click "Deploy"**

### Option 2: Manual Vercel Setup

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Click "New Project"**

3. **Import Git Repository**:
   - Find your forked repository
   - Click "Import"

4. **Configure Build Settings**:
   ```
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

5. **Environment Variables** (add these now or later):
   ```
   NEXT_PUBLIC_USER_NAME = "Your Full Name"
   NEXT_PUBLIC_GITHUB_USERNAME = "your-github-username"
   NEXT_PUBLIC_USER_EMAIL = "your-email@example.com"
   ```

6. **Click "Deploy"**

### Step 4: Wait for Deployment
- ⏱️ **First deployment**: 2-5 minutes
- 🔄 **Status**: Watch the build logs
- ✅ **Success**: You'll get a live URL

## Alternative Deployment Options

### Netlify
1. **Connect your GitHub repository**
2. **Build settings**:
   ```
   Base directory: apps/web
   Build command: npm run build
   Publish directory: apps/web/.next
   ```

### Railway
1. **Connect GitHub repository**
2. **Set root directory**: `apps/web`
3. **Railway will auto-detect** Next.js

### Self-Hosted
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/running2.0.git
cd running2.0/apps/web

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Verify Deployment

### Check Your Live Site
1. **Visit your Vercel URL**: `https://your-project.vercel.app`
2. **You should see**:
   - ✅ Running Page 2.0 interface
   - ⚠️ "No activities found" (normal before data sync)
   - ✅ Your name in the header (if configured)

### Test Key Pages
- **Dashboard**: `/dashboard` - Should load without errors
- **Activities**: `/activities` - Should show empty state
- **Statistics**: `/stats` - Should show zero stats
- **Test Page**: `/test-fixes` - Should show configuration status

## Common Deployment Issues

### Build Failures
```
Error: Cannot find module '@/lib/...'
```
**Solution**: Ensure root directory is set to `apps/web`

### Environment Variable Issues
```
Error: NEXT_PUBLIC_USER_NAME is not defined
```
**Solution**: Add environment variables in Vercel dashboard

### Database Issues
```
Error: Database file not found
```
**Solution**: This is normal before first data sync

## Next Steps

After successful deployment:

1. **[Configure Strava Integration](Strava-Integration)**
2. **[Set up GitHub Actions](GitHub-Actions-Setup)**
3. **[Add Mapbox for maps](Mapbox-Setup)**
4. **[Personalize your page](Personalization)**

## 🎉 Congratulations!

Your Running Page 2.0 is now deployed and accessible to the world!

**Your live URL**: `https://your-project.vercel.app`

---

**Need help?** Check our [Troubleshooting Guide](Common-Issues) or ask in [Discussions](https://github.com/your-username/running2.0/discussions).
