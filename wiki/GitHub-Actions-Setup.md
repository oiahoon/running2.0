# GitHub Actions Setup Guide ⚙️

Complete guide to setting up automated data synchronization and map generation using GitHub Actions.

## 📋 Table of Contents

- [Overview](#overview)
- [Understanding the Workflows](#understanding-the-workflows)
- [Configure Secrets](#configure-secrets)
- [Test the Workflows](#test-the-workflows)
- [Customize Sync Schedule](#customize-sync-schedule)
- [Monitor and Troubleshoot](#monitor-and-troubleshoot)
- [Advanced Configuration](#advanced-configuration)

## Overview

GitHub Actions automate your Running Page 2.0 with:
- 🔄 **Automatic Strava sync** every 6 hours
- 🗺️ **Static map generation** for new activities
- 📊 **Database updates** and optimization
- 🚀 **Automatic deployment** to Vercel
- 📈 **Sync reports** and statistics

**Zero maintenance required** after initial setup!

## Understanding the Workflows

### 1. Sync Strava Data (`sync-data.yml`)

**What it does:**
- Fetches new activities from Strava API
- Converts data to SQLite database
- Generates static maps for GPS activities
- Commits changes to repository
- Triggers Vercel deployment

**When it runs:**
- Every 6 hours automatically
- Manual trigger anytime
- On repository push (optional)

### 2. Test Mapbox Configuration (`test-mapbox.yml`)

**What it does:**
- Validates Mapbox token configuration
- Tests static map generation
- Provides debugging information
- Creates test map artifacts

**When to use:**
- Initial setup verification
- Troubleshooting map issues
- Token configuration testing

## Configure Secrets

### Required Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions**

#### 1. Strava Integration
```
STRAVA_CLIENT_ID
Value: Your Strava app client ID

STRAVA_CLIENT_SECRET  
Value: Your Strava app client secret

STRAVA_REFRESH_TOKEN
Value: Your Strava OAuth refresh token
```

#### 2. Mapbox Integration (Optional but Recommended)
```
MAPBOX_TOKEN
Value: Your Mapbox token WITHOUT URL restrictions
```

### Verify Secrets Setup

You should have these secrets configured:
- ✅ `STRAVA_CLIENT_ID`
- ✅ `STRAVA_CLIENT_SECRET` 
- ✅ `STRAVA_REFRESH_TOKEN`
- ✅ `MAPBOX_TOKEN` (optional)

## Test the Workflows

### Step 1: Test Mapbox Configuration (Optional)

1. **Go to Actions** tab in your repository
2. **Click "Test Mapbox Configuration"**
3. **Click "Run workflow"**
4. **Select "basic" test type**
5. **Click "Run workflow"**

**Expected results:**
- ✅ Token validation passes
- ✅ Static map generation works
- ✅ Test map artifact created

### Step 2: Run Initial Data Sync

1. **Go to Actions** tab
2. **Click "Sync Strava Data"**
3. **Click "Run workflow"**
4. **Configure options**:
   - ✅ Force full sync: `true` (for first run)
   - ✅ Regenerate maps: `true` (if Mapbox configured)
5. **Click "Run workflow"**

**This will take 5-15 minutes** depending on your activity count.

### Step 3: Monitor the Sync Process

**Watch the workflow progress:**
1. **Click on the running workflow**
2. **Expand each step** to see detailed logs
3. **Look for success indicators**:
   ```
   ✅ Strava API accessible
   ✅ Found 150 activities
   ✅ Synced 150 new activities
   ✅ Generated 120 static maps
   ✅ Database updated successfully
   ```

### Step 4: Verify Results

**Check your website:**
- Activities should appear on dashboard
- Statistics should show your data
- Maps should display for GPS activities

**Check repository:**
- New files in `apps/web/data/`
- Static maps in `apps/web/public/maps/`
- Sync report in commit message

## Customize Sync Schedule

### Default Schedule
```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
```

### Common Customizations

**Every 3 hours:**
```yaml
schedule:
  - cron: '0 */3 * * *'
```

**Twice daily (8 AM and 8 PM UTC):**
```yaml
schedule:
  - cron: '0 8,20 * * *'
```

**Daily at midnight UTC:**
```yaml
schedule:
  - cron: '0 0 * * *'
```

**Only on weekdays:**
```yaml
schedule:
  - cron: '0 */6 * * 1-5'
```

### How to Change Schedule

1. **Edit `.github/workflows/sync-data.yml`**
2. **Modify the cron expression**
3. **Commit and push changes**

**Cron Helper:** https://crontab.guru/

## Monitor and Troubleshoot

### Check Workflow Status

**Repository Actions tab shows:**
- ✅ **Green checkmark**: Successful run
- ❌ **Red X**: Failed run
- 🟡 **Yellow dot**: Running
- ⏸️ **Gray**: Cancelled/skipped

### Common Success Indicators

**Successful sync logs:**
```
✅ Strava data sync completed successfully
📊 Sync Report:
- Basic activities: 150
- Detailed activities: 150  
- Database records: 150
- Static maps: 120 files (45.2MB)
Last sync: 2024-01-15 10:30:00 UTC
```

### Common Issues and Solutions

#### 1. Strava API Errors
```
❌ Error: Invalid client credentials
```
**Solution:** Check `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET`

#### 2. Token Expired
```
❌ Error: Token has been revoked
```
**Solution:** Generate new refresh token following [Strava Integration](Strava-Integration) guide

#### 3. Rate Limiting
```
❌ Error: Rate limit exceeded
```
**Solution:** Wait 15 minutes, then retry. Consider reducing sync frequency.

#### 4. Mapbox Issues
```
❌ Error: 403 Forbidden (Mapbox)
```
**Solution:** Ensure `MAPBOX_TOKEN` has no URL restrictions

#### 5. Database Errors
```
❌ Error: Database locked
```
**Solution:** Usually resolves automatically on retry

### Debug Workflow Failures

1. **Click on failed workflow run**
2. **Expand failed step**
3. **Read error messages carefully**
4. **Check common solutions above**
5. **Re-run workflow after fixing**

### Manual Workflow Triggers

**Force full sync:**
- Use when you want to re-import all activities
- Helpful after changing data processing logic

**Regenerate all maps:**
- Use when you want to recreate all static maps
- Helpful after changing map styling

## Advanced Configuration

### Workflow Customization

#### Add Notifications
```yaml
- name: Notify on failure
  if: failure()
  run: |
    curl -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
      -d "chat_id=${{ secrets.TELEGRAM_CHAT_ID }}" \
      -d "text=Sync failed: ${{ github.repository }}"
```

#### Custom Data Processing
```yaml
- name: Custom processing
  run: |
    cd scripts
    python custom-data-processor.py
```

#### Conditional Execution
```yaml
- name: Generate maps
  if: env.MAPBOX_TOKEN != ''
  run: python generate-static-maps.py
```

### Environment Variables

Add to workflow file:
```yaml
env:
  CUSTOM_SETTING: "value"
  DEBUG_MODE: "true"
```

### Parallel Processing

```yaml
strategy:
  matrix:
    batch: [1, 2, 3, 4]
steps:
  - name: Process batch ${{ matrix.batch }}
    run: python process-batch.py ${{ matrix.batch }}
```

### Workflow Dependencies

```yaml
needs: [sync-data]
if: needs.sync-data.result == 'success'
```

## Monitoring and Maintenance

### Regular Checks

**Weekly:**
- ✅ Check workflow success rate
- ✅ Monitor API usage (Strava/Mapbox)
- ✅ Verify website data freshness

**Monthly:**
- ✅ Review sync statistics
- ✅ Check storage usage
- ✅ Update dependencies if needed

### Performance Optimization

**Reduce sync time:**
- Use incremental sync (default)
- Optimize database queries
- Parallel map generation

**Reduce API usage:**
- Cache API responses
- Skip unchanged activities
- Batch API requests

### Backup Strategy

**Automatic backups:**
- Repository contains all data
- Vercel has deployment history
- GitHub Actions logs preserved

**Manual backups:**
```bash
# Download database
curl -O https://your-site.com/running_page_2.db

# Clone repository
git clone https://github.com/your-username/running2.0.git
```

## 🎉 Success!

Your GitHub Actions are now configured for:
- ✅ Automatic data synchronization
- ✅ Static map generation
- ✅ Zero-maintenance operation
- ✅ Comprehensive error handling
- ✅ Detailed logging and reporting

Your running page will stay up-to-date automatically!

---

**Next Steps:**
- [Personalize your page](Personalization)
- [Monitor static map caching](Static-Map-Caching)
- [Customize themes and styling](Theme-Customization)
