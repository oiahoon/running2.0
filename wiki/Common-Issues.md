# Common Issues & Troubleshooting 🔧

Solutions to frequently encountered problems when setting up and running your Running Page 2.0.

## 📋 Table of Contents

- [Deployment Issues](#deployment-issues)
- [Strava Integration Problems](#strava-integration-problems)
- [Map and Mapbox Issues](#map-and-mapbox-issues)
- [GitHub Actions Failures](#github-actions-failures)
- [Data Sync Problems](#data-sync-problems)
- [Performance Issues](#performance-issues)
- [Environment Configuration](#environment-configuration)
- [Getting Help](#getting-help)

## Deployment Issues

### 1. Build Failures on Vercel

**Error**: `Module not found: Can't resolve '@/lib/...'`

**Solution**:
```bash
# Ensure root directory is set correctly
Root Directory: apps/web
Build Command: npm run build
Output Directory: .next
```

**Error**: `npm ERR! missing script: build`

**Solution**:
- Check `package.json` exists in `apps/web/`
- Verify build script is defined
- Try redeploying from Vercel dashboard

### 2. Environment Variables Not Working

**Error**: `NEXT_PUBLIC_USER_NAME is not defined`

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add missing variables:
   ```
   NEXT_PUBLIC_USER_NAME = "Your Name"
   NEXT_PUBLIC_GITHUB_USERNAME = "username"
   NEXT_PUBLIC_USER_EMAIL = "email@example.com"
   ```
3. Redeploy the application

### 3. 404 Errors on Deployed Site

**Error**: Pages return 404 after deployment

**Solution**:
- Check file structure matches Next.js App Router format
- Ensure pages are in `apps/web/src/app/` directory
- Verify `layout.tsx` exists in app directory
- Check for typos in file names

## Strava Integration Problems

### 1. Invalid Client Credentials

**Error**: `{"message":"Bad Request","errors":[{"resource":"Application","field":"client_id","code":"invalid"}]}`

**Solution**:
1. Verify `STRAVA_CLIENT_ID` in GitHub Secrets
2. Check Client ID from Strava API settings
3. Ensure no extra spaces or characters
4. Re-create Strava application if needed

### 2. Authorization Errors

**Error**: `invalid_grant` or `authorization_code expired`

**Solution**:
1. Get a fresh authorization code:
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all
   ```
2. Exchange for refresh token immediately
3. Update `STRAVA_REFRESH_TOKEN` in GitHub Secrets

### 3. No Activities Syncing

**Error**: Workflow succeeds but no activities appear

**Possible Causes & Solutions**:

**Private Activities**:
- Ensure scope includes `activity:read_all`
- Check Strava privacy settings

**Empty Strava Account**:
- Verify your Strava account has activities
- Check activity date ranges

**Database Issues**:
- Check GitHub Actions logs for database errors
- Verify database file is being created

### 4. Rate Limiting

**Error**: `Rate Limit Exceeded`

**Solution**:
- Wait 15 minutes before retrying
- Reduce sync frequency in workflow
- Check for multiple concurrent syncs

## Map and Mapbox Issues

### 1. Maps Not Loading

**Error**: Blank map areas or "Failed to load map"

**Solutions**:

**Missing Token**:
```bash
# Add to Vercel environment variables
NEXT_PUBLIC_MAPBOX_TOKEN = "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"
```

**Invalid Token**:
- Check token is valid at https://account.mapbox.com/access-tokens/
- Ensure token has correct permissions
- Verify URL restrictions match your domain

**Network Issues**:
- Check browser console for network errors
- Verify Mapbox API is accessible

### 2. Static Maps Not Generating

**Error**: `403 Forbidden` in GitHub Actions

**Solution**:
1. Create new Mapbox token **without URL restrictions**
2. Add to GitHub Secrets as `MAPBOX_TOKEN`
3. Run test workflow to verify:
   ```
   Actions → "Test Mapbox Configuration" → Run workflow
   ```

### 3. High Mapbox API Usage

**Problem**: Unexpected high API usage costs

**Solutions**:
- Verify static map caching is working
- Check `/api/cache/stats` for cache hit rates
- Look for API calls in browser Network tab
- Ensure static maps are being used instead of live API

### 4. Map Display Issues

**Error**: Maps show but with wrong styling or data

**Solutions**:
- Check map style URL in configuration
- Verify activity has GPS data (latitude/longitude)
- Check polyline data is valid
- Test with different activities

## GitHub Actions Failures

### 1. Workflow Permission Errors

**Error**: `Permission denied` or `403 Forbidden`

**Solution**:
1. Go to Repository Settings → Actions → General
2. Set "Workflow permissions" to "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"

### 2. Secret Access Issues

**Error**: `Secret STRAVA_CLIENT_ID not found`

**Solution**:
1. Verify secrets are set in repository (not organization)
2. Check secret names match exactly (case-sensitive)
3. Re-add secrets if necessary

### 3. Python/Node.js Errors

**Error**: `ModuleNotFoundError` or `npm ERR!`

**Solution**:
- Check workflow uses correct Python/Node versions
- Verify dependencies are installed
- Check for typos in script names

### 4. Database Lock Errors

**Error**: `database is locked`

**Solution**:
- Usually resolves on retry
- Check for concurrent workflow runs
- Cancel duplicate workflows

## Data Sync Problems

### 1. Partial Data Sync

**Problem**: Only some activities sync

**Solutions**:
- Check Strava API rate limits
- Verify activity privacy settings
- Look for errors in workflow logs
- Try force full sync option

### 2. Duplicate Activities

**Problem**: Same activities appear multiple times

**Solution**:
- Check database unique constraints
- Clear database and re-sync
- Verify external_id handling

### 3. Missing Activity Details

**Problem**: Activities sync but missing data (pace, elevation, etc.)

**Solutions**:
- Ensure detailed activity fetch is working
- Check Strava API permissions
- Verify data processing scripts

### 4. Old Data Not Updating

**Problem**: Changes in Strava don't reflect on site

**Solutions**:
- Check sync schedule is running
- Force manual sync
- Verify cache invalidation

## Performance Issues

### 1. Slow Page Loading

**Problem**: Pages take long to load

**Solutions**:
- Check database size and queries
- Verify static map caching is working
- Optimize image sizes
- Check network requests in dev tools

### 2. Large Database Size

**Problem**: Database file becomes very large

**Solutions**:
- Remove unnecessary data fields
- Implement data archiving
- Optimize database schema

### 3. Memory Issues

**Error**: Out of memory errors

**Solutions**:
- Reduce batch sizes in processing
- Implement pagination
- Optimize data structures

## Environment Configuration

### 1. Local Development Issues

**Error**: Environment variables not loading locally

**Solution**:
```bash
# Create .env.local in apps/web/
NEXT_PUBLIC_USER_NAME="Test User"
NEXT_PUBLIC_GITHUB_USERNAME="testuser"
DATABASE_PATH="./data/running_page_2.db"
```

### 2. Production vs Development Differences

**Problem**: Works locally but fails in production

**Solutions**:
- Check environment-specific configurations
- Verify all production environment variables are set
- Check file paths and case sensitivity
- Review build logs for differences

## Debug Tools and Commands

### Check Environment Variables
```bash
# In Vercel deployment logs
console.log('Environment check:', {
  userName: process.env.NEXT_PUBLIC_USER_NAME,
  githubUser: process.env.NEXT_PUBLIC_GITHUB_USERNAME,
  hasMapbox: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN
})
```

### Test API Endpoints
```bash
# Test your deployed APIs
curl https://your-site.vercel.app/api/activities
curl https://your-site.vercel.app/api/stats
curl https://your-site.vercel.app/api/cache/stats
```

### Check Database
```bash
# If you have database access
sqlite3 running_page_2.db "SELECT COUNT(*) FROM activities;"
sqlite3 running_page_2.db "SELECT * FROM activities LIMIT 5;"
```

### Verify Static Maps
```bash
# Check if static maps exist
curl -I https://your-site.vercel.app/maps/12345.png
```

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Review GitHub Actions logs** for specific error messages
3. **Test with minimal configuration** to isolate the issue
4. **Check browser console** for client-side errors
5. **Verify all prerequisites** are met

### Where to Get Help

**GitHub Issues** (for bugs):
- https://github.com/your-username/running2.0/issues
- Include error messages, logs, and steps to reproduce

**GitHub Discussions** (for questions):
- https://github.com/your-username/running2.0/discussions
- Great for configuration help and general questions

**Community Resources**:
- Strava API Documentation: https://developers.strava.com/
- Mapbox Documentation: https://docs.mapbox.com/
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs

### Information to Include When Asking for Help

1. **Error message** (exact text)
2. **Steps to reproduce** the issue
3. **Environment details** (Vercel, local, etc.)
4. **Configuration** (without sensitive data)
5. **Screenshots** if relevant
6. **GitHub Actions logs** (if applicable)

### Quick Diagnostic Checklist

- [ ] All required environment variables set
- [ ] GitHub Secrets configured correctly
- [ ] Strava app created and authorized
- [ ] Mapbox token created (if using maps)
- [ ] GitHub Actions have proper permissions
- [ ] Latest code deployed to Vercel
- [ ] No typos in configuration
- [ ] Browser console shows no errors

## 🔧 Still Having Issues?

Don't worry! Most issues have simple solutions. The community is here to help:

1. **Search existing issues** - someone might have had the same problem
2. **Provide detailed information** - helps us help you faster
3. **Be patient** - we're all volunteers helping each other
4. **Share your solution** - help others who might face the same issue

---

**Remember**: Every runner faces obstacles, and every developer faces bugs. The key is persistence and asking for help when needed! 🏃‍♂️💪
