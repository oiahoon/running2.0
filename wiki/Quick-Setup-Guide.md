# Quick Setup Guide ⚡

Get your Running Page 2.0 up and running in just 15 minutes!

## 🎯 Overview

This guide will help you:
- Fork and deploy the project
- Connect your Strava account
- Set up automatic data sync
- Enable map visualization

## ⏱️ Time Required: ~15 minutes

## 📋 Prerequisites

- GitHub account
- Strava account with activities
- Vercel account (free)
- Mapbox account (optional, free tier available)

## 🚀 Step-by-Step Setup

### Step 1: Fork the Repository (2 minutes)

1. **Go to the repository**: https://github.com/your-username/running2.0
2. **Click "Fork"** in the top-right corner
3. **Choose your account** as the destination
4. **Wait for the fork** to complete

### Step 2: Deploy to Vercel (3 minutes)

1. **Visit Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "New Project"**
4. **Import** your forked repository
5. **Click "Deploy"** (use default settings)
6. **Wait for deployment** to complete
7. **Note your URL**: `https://your-project.vercel.app`

### Step 3: Create Strava App (5 minutes)

1. **Go to Strava API**: https://www.strava.com/settings/api
2. **Create a new application**:
   - **Application Name**: "My Running Page"
   - **Category**: "Data Importer"
   - **Club**: Leave empty
   - **Website**: Your Vercel URL
   - **Authorization Callback Domain**: Your Vercel domain
3. **Save** and note your:
   - Client ID
   - Client Secret

### Step 4: Get Strava Tokens (3 minutes)

1. **Visit this URL** (replace YOUR_CLIENT_ID):
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all
   ```

2. **Authorize the app** and copy the `code` from the URL

3. **Get your refresh token** using curl or Postman:
   ```bash
   curl -X POST https://www.strava.com/oauth/token \
     -F client_id=YOUR_CLIENT_ID \
     -F client_secret=YOUR_CLIENT_SECRET \
     -F code=YOUR_CODE \
     -F grant_type=authorization_code
   ```

4. **Save the `refresh_token`** from the response

### Step 5: Configure GitHub Secrets (2 minutes)

1. **Go to your forked repository**
2. **Settings** → **Secrets and variables** → **Actions**
3. **Add these secrets**:
   - `STRAVA_CLIENT_ID`: Your Strava Client ID
   - `STRAVA_CLIENT_SECRET`: Your Strava Client Secret
   - `STRAVA_REFRESH_TOKEN`: Your refresh token

### Step 6: Configure Environment Variables

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings** → **Environment Variables**
4. **Add these variables**:
   ```
   NEXT_PUBLIC_USER_NAME = "Your Name"
   NEXT_PUBLIC_GITHUB_USERNAME = "your-github-username"
   NEXT_PUBLIC_USER_EMAIL = "your-email@example.com"
   ```

## 🎉 You're Done!

Your running page should now be live at your Vercel URL!

## 🔄 First Data Sync

1. **Go to your repository** → **Actions**
2. **Click "Sync Strava Data"**
3. **Click "Run workflow"**
4. **Wait for completion** (2-5 minutes)
5. **Check your website** - you should see your activities!

## 🗺️ Optional: Enable Maps

For map visualization, see the [Mapbox Setup Guide](Mapbox-Setup).

## ❓ Having Issues?

- Check the [Common Issues](Common-Issues) page
- Review [GitHub Actions logs](Debug-Guide#github-actions-logs)
- Ask for help in [Discussions](https://github.com/your-username/running2.0/discussions)

## 🎯 Next Steps

- [Personalize your page](Personalization)
- [Set up map caching](Static-Map-Caching)
- [Customize the theme](Theme-Customization)

---

**🎊 Congratulations! You now have your own running page!**
