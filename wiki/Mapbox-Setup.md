# Mapbox Setup Guide 🗺️

Complete guide to setting up Mapbox for interactive maps and cost-effective static map caching.

## 📋 Table of Contents

- [Overview](#overview)
- [Create Mapbox Account](#create-mapbox-account)
- [Frontend Maps Setup](#frontend-maps-setup)
- [Static Map Caching Setup](#static-map-caching-setup)
- [Cost Optimization](#cost-optimization)
- [Testing and Verification](#testing-and-verification)
- [Troubleshooting](#troubleshooting)

## Overview

Mapbox integration provides:
- 🗺️ **Interactive route maps** on your running page
- 📍 **Activity location visualization** with markers
- 💰 **Static map caching** for 99% cost reduction
- ⚡ **Fast loading** with pre-generated map images
- 🎨 **Customizable map styles** and themes

**Cost Impact**: With static caching, you'll use ~$5 one-time vs $100s monthly!

## Create Mapbox Account

### Step 1: Sign Up

1. **Visit Mapbox**: https://account.mapbox.com/auth/signup/
2. **Create account** with email or GitHub
3. **Verify your email** address
4. **Complete profile** setup

### Step 2: Understand Pricing

**Free Tier Includes:**
- 50,000 map loads per month
- 50,000 static map requests per month
- Perfect for personal running pages

**With Static Caching:**
- One-time generation cost only
- Virtually unlimited usage after caching
- 99%+ cost reduction

## Frontend Maps Setup

### Step 1: Create Public Token

1. **Go to Access Tokens**: https://account.mapbox.com/access-tokens/
2. **Copy your "Default public token"** or create a new one
3. **Configure URL restrictions** (recommended for security):
   ```
   https://your-project.vercel.app/*
   https://*.vercel.app/*
   http://localhost:3000/*
   ```

### Step 2: Add to Vercel Environment

1. **Go to Vercel Dashboard** → Your project
2. **Settings** → **Environment Variables**
3. **Add new variable**:
   ```
   Name: NEXT_PUBLIC_MAPBOX_TOKEN
   Value: pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example
   ```
4. **Redeploy** your application

### Step 3: Test Frontend Maps

Visit your site and check:
- ✅ **Dashboard**: Maps should appear for GPS activities
- ✅ **Activities page**: Route maps display correctly
- ✅ **Interactive features**: Zoom, pan work properly

## Static Map Caching Setup

### Step 1: Create GitHub Actions Token

**⚠️ Critical**: This token must have **NO URL restrictions** for GitHub Actions to work.

1. **Create new token**: https://account.mapbox.com/access-tokens/
2. **Token settings**:
   ```
   Name: GitHub-Actions-Static-Maps
   URL restrictions: (leave completely empty)
   Scopes: Default (all enabled)
   ```
3. **Save the token**

### Step 2: Add GitHub Secret

1. **Go to your repository** → **Settings** → **Secrets and variables** → **Actions**
2. **Add new secret**:
   ```
   Name: MAPBOX_TOKEN
   Value: pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.no-restrictions
   ```

### Step 3: Test Token Configuration

1. **Go to Actions** → **"Test Mapbox Configuration"**
2. **Run workflow** → **"basic"** test
3. **Check results**:
   - ✅ Token validation passes
   - ✅ Static map generation works
   - ✅ Test map artifact created

## Cost Optimization

### Understanding the Savings

**Without Static Caching:**
- Every page visit = API calls
- 500 activities × 10 views/day = 5,000 API calls/day
- Monthly cost: $50-200+

**With Static Caching:**
- One-time generation: 500 API calls total
- Daily usage: 0 API calls (static files)
- Monthly cost: ~$0.50 one-time

### Automatic Cache Management

The system automatically:
- ✅ **Generates maps** for new activities
- ✅ **Skips existing** maps to avoid duplicate costs
- ✅ **Cleans up** orphaned maps
- ✅ **Monitors usage** and provides statistics

### Monitor Your Usage

1. **Mapbox Dashboard**: https://account.mapbox.com/
2. **Check "Usage"** section regularly
3. **Set up billing alerts** for peace of mind
4. **Review cache statistics**: `/api/cache/stats`

## Testing and Verification

### Test Static Map Generation

1. **Manual trigger**:
   ```bash
   # In your repository Actions
   Workflow: "Sync Strava Data"
   Options: ✅ "Regenerate all static maps"
   ```

2. **Check results**:
   - Maps appear in `/public/maps/` directory
   - File names match Strava activity IDs
   - File sizes are reasonable (50-200KB each)

### Verify Cache Usage

1. **Visit test page**: `https://your-site.com/test-maps`
2. **Check cache statistics**: `https://your-site.com/api/cache/stats`
3. **Browser dev tools**:
   - Network tab should show `/maps/12345.png` requests
   - NOT `api.mapbox.com` requests for cached activities

### Performance Testing

**Before caching** (first visit):
- Map loading: 500-2000ms
- Multiple API calls visible

**After caching** (subsequent visits):
- Map loading: 50-100ms
- Static file requests only

## Troubleshooting

### Common Issues

#### 1. Maps Not Loading
```
Error: Failed to load map
```
**Solutions:**
- ✅ Check `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- ✅ Verify token has correct URL restrictions
- ✅ Check browser console for errors

#### 2. Static Maps Not Generating
```
Error: 403 Forbidden
```
**Solutions:**
- ✅ Ensure GitHub Actions token has NO URL restrictions
- ✅ Check `MAPBOX_TOKEN` secret is set correctly
- ✅ Run the test workflow to verify

#### 3. High API Usage
```
Warning: Approaching usage limits
```
**Solutions:**
- ✅ Verify static caching is working
- ✅ Check cache hit rates in statistics
- ✅ Look for API calls in browser network tab

#### 4. Token Errors
```
Error: Invalid token
```
**Solutions:**
- ✅ Regenerate tokens if expired
- ✅ Check for typos in environment variables
- ✅ Verify token permissions and scopes

### Debug Commands

**Test token locally:**
```bash
curl "https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=YOUR_TOKEN"
```

**Check static map generation:**
```bash
curl "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-l+ff0000(-122.4194,37.7749)/-122.4194,37.7749,12,0/400x300@2x?access_token=YOUR_TOKEN"
```

**Monitor cache statistics:**
```bash
curl "https://your-site.com/api/cache/stats"
```

### GitHub Actions Debugging

1. **Check workflow logs**:
   - Actions → Latest run → "Generate static maps"
   - Look for error messages and API responses

2. **Common log messages**:
   ```
   ✅ "Generated map for activity 12345"
   ⏭️ "Map for activity 12345 already exists"
   ❌ "Could not generate URL for activity 12345"
   ```

## Advanced Configuration

### Custom Map Styles

Edit `scripts/generate-static-maps.py`:
```python
# Change map style
base_url = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/"
# Options: streets-v11, outdoors-v11, light-v10, dark-v10, satellite-v9
```

### Map Size Optimization

Adjust dimensions in generation script:
```python
# Smaller files, faster loading
width, height = 300, 200  # Default: 400, 300

# Higher quality, larger files
width, height = 600, 400
```

### Batch Processing

For large activity counts:
```python
# Add rate limiting
time.sleep(0.2)  # 200ms between requests

# Process in batches
batch_size = 50
```

## 🎉 Success!

Your Mapbox integration is now complete with:
- ✅ Interactive maps on your website
- ✅ Cost-effective static map caching
- ✅ Automatic map generation for new activities
- ✅ 99%+ reduction in ongoing API costs

---

**Next Steps:**
- [Set up GitHub Actions automation](GitHub-Actions-Setup)
- [Monitor your cache statistics](Static-Map-Caching)
- [Customize your page appearance](Personalization)
