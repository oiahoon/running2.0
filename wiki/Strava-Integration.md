# Strava Integration Guide 🏃‍♂️

Complete guide to connecting your Strava account and syncing your running data.

## 📋 Table of Contents

- [Overview](#overview)
- [Create Strava Application](#create-strava-application)
- [Get Authorization Tokens](#get-authorization-tokens)
- [Configure GitHub Secrets](#configure-github-secrets)
- [Test the Integration](#test-the-integration)
- [Troubleshooting](#troubleshooting)

## Overview

Strava integration allows your Running Page to:
- ✅ **Automatically sync** your activities every 6 hours
- ✅ **Import historical data** from your Strava account
- ✅ **Display detailed metrics** like pace, elevation, heart rate
- ✅ **Show route maps** for GPS-enabled activities
- ✅ **Update in real-time** when you complete new runs

## Create Strava Application

### Step 1: Access Strava API Settings

1. **Sign in to Strava**: https://www.strava.com
2. **Go to API settings**: https://www.strava.com/settings/api
3. **Click "Create App"** or "My API Application"

### Step 2: Fill Application Details

**Required Information:**
```
Application Name: My Running Page
Category: Data Importer
Club: (leave empty)
Website: https://your-project.vercel.app
Authorization Callback Domain: your-project.vercel.app
```

**Important Notes:**
- ✅ Use your actual Vercel domain
- ✅ Don't include `https://` in callback domain
- ✅ Make sure the domain matches exactly

### Step 3: Save Your Credentials

After creating the app, you'll see:
- **Client ID**: `12345` (example)
- **Client Secret**: `abcdef123456` (example)

**⚠️ Keep these secure!** You'll need them for the next steps.

## Get Authorization Tokens

### Step 1: Get Authorization Code

1. **Replace YOUR_CLIENT_ID** in this URL:
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all
   ```

2. **Visit the URL** in your browser
3. **Click "Authorize"** to grant permissions
4. **You'll be redirected** to a localhost URL that won't load
5. **Copy the code** from the URL: `http://localhost/?state=&code=COPY_THIS_CODE&scope=read,activity:read_all`

### Step 2: Exchange Code for Tokens

**Option A: Using curl (Terminal/Command Prompt)**
```bash
curl -X POST https://www.strava.com/oauth/token \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F code=YOUR_CODE_FROM_STEP_1 \
  -F grant_type=authorization_code
```

**Option B: Using Postman**
- **Method**: POST
- **URL**: `https://www.strava.com/oauth/token`
- **Body** (form-data):
  - `client_id`: Your Client ID
  - `client_secret`: Your Client Secret
  - `code`: The code from Step 1
  - `grant_type`: `authorization_code`

**Option C: Using Online Tool**
Visit: https://developers.strava.com/playground/ and follow the OAuth flow.

### Step 3: Save the Refresh Token

The response will look like:
```json
{
  "token_type": "Bearer",
  "expires_at": 1568775134,
  "expires_in": 21600,
  "refresh_token": "SAVE_THIS_REFRESH_TOKEN",
  "access_token": "temporary_access_token",
  "athlete": {...}
}
```

**⚠️ Important**: Save the `refresh_token` - this is what you need for GitHub Secrets!

## Configure GitHub Secrets

### Step 1: Access Repository Secrets

1. **Go to your forked repository** on GitHub
2. **Click "Settings"** tab
3. **Click "Secrets and variables"** → **"Actions"**

### Step 2: Add Required Secrets

Click **"New repository secret"** for each:

**STRAVA_CLIENT_ID**
```
Name: STRAVA_CLIENT_ID
Secret: 12345
```

**STRAVA_CLIENT_SECRET**
```
Name: STRAVA_CLIENT_SECRET
Secret: abcdef123456789
```

**STRAVA_REFRESH_TOKEN**
```
Name: STRAVA_REFRESH_TOKEN
Secret: your_refresh_token_from_step_3
```

### Step 3: Verify Secrets

You should now have 3 secrets:
- ✅ `STRAVA_CLIENT_ID`
- ✅ `STRAVA_CLIENT_SECRET`
- ✅ `STRAVA_REFRESH_TOKEN`

## Test the Integration

### Step 1: Trigger Manual Sync

1. **Go to your repository** → **"Actions"** tab
2. **Click "Sync Strava Data"** workflow
3. **Click "Run workflow"** button
4. **Click the green "Run workflow"** button
5. **Wait for completion** (2-5 minutes)

### Step 2: Check the Results

**If successful, you should see:**
- ✅ Green checkmark on the workflow
- ✅ Activities appear on your website
- ✅ Maps display for GPS activities
- ✅ Statistics update with your data

**Workflow logs should show:**
```
✅ Strava API accessible
✅ Found X activities
✅ Synced X new activities
✅ Generated X static maps
```

### Step 3: Verify Your Website

Visit your deployed site and check:
- **Dashboard**: Shows recent activities
- **Activities page**: Lists all your runs
- **Statistics**: Displays your running metrics
- **Maps**: Shows route visualizations

## Troubleshooting

### Common Issues

#### 1. "Invalid Client" Error
```
Error: invalid_client
```
**Solution**: Check your Client ID and Client Secret are correct

#### 2. "Invalid Grant" Error
```
Error: invalid_grant
```
**Solution**: Your authorization code expired. Get a new one (Step 1 of token process)

#### 3. "Scope Error"
```
Error: scope issue
```
**Solution**: Make sure you included `read,activity:read_all` in the authorization URL

#### 4. No Activities Syncing
**Possible causes:**
- ✅ Check GitHub Secrets are set correctly
- ✅ Verify your Strava account has activities
- ✅ Check GitHub Actions logs for errors
- ✅ Ensure activities are public or you have correct permissions

#### 5. "Rate Limited" Error
```
Error: Rate limit exceeded
```
**Solution**: Wait 15 minutes and try again. Strava has API limits.

### Debug Steps

1. **Check GitHub Actions logs**:
   - Go to Actions → Latest workflow run
   - Click on failed step to see error details

2. **Test your tokens manually**:
   ```bash
   curl -X GET "https://www.strava.com/api/v3/athlete" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

3. **Verify Strava app settings**:
   - Callback domain matches your deployment
   - App has correct permissions

## Advanced Configuration

### Custom Sync Schedule

Edit `.github/workflows/sync-data.yml`:
```yaml
schedule:
  # Run every 3 hours instead of 6
  - cron: '0 */3 * * *'
```

### Selective Activity Import

The system imports all activities by default. To filter:
1. Edit `scripts/sync_strava.py`
2. Add activity type filters
3. Commit and push changes

### Privacy Settings

- **Private activities**: Require `activity:read_all` scope
- **Public only**: Use `activity:read` scope
- **Specific sports**: Filter in sync script

## 🎉 Success!

Once configured, your Strava data will automatically sync every 6 hours, keeping your running page up-to-date with your latest activities!

---

**Next Steps:**
- [Set up Mapbox for enhanced maps](Mapbox-Setup)
- [Configure static map caching](Static-Map-Caching)
- [Personalize your page](Personalization)
