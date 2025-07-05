# Environment Configuration Guide

## 🔧 Environment Variables Setup

### Required Configuration Files

#### 1. Local Development (`.env.local`)
Create this file in `/apps/web/.env.local`:

```env
# User Configuration
NEXT_PUBLIC_USER_NAME="Your Full Name"
NEXT_PUBLIC_GITHUB_USERNAME="your-github-username"
NEXT_PUBLIC_USER_EMAIL="your-email@example.com"

# Optional: Custom avatar URL (if not set, will use GitHub avatar)
# NEXT_PUBLIC_USER_AVATAR="https://example.com/avatar.jpg"

# Database Configuration
DATABASE_PATH="./data/running_page_2.db"

# Mapbox (Optional - for interactive maps)
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"

# Development
NODE_ENV="development"
```

#### 2. Production/Vercel Environment Variables
Set these in your Vercel dashboard or deployment platform:

```env
NEXT_PUBLIC_USER_NAME="Your Full Name"
NEXT_PUBLIC_GITHUB_USERNAME="your-github-username"
NEXT_PUBLIC_USER_EMAIL="your-email@example.com"
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"
NODE_ENV="production"
```

#### 3. GitHub Actions Secrets
Set these in your GitHub repository settings > Secrets and variables > Actions:

```env
# Strava API (Required for data sync)
STRAVA_CLIENT_ID="your_strava_client_id"
STRAVA_CLIENT_SECRET="your_strava_client_secret"
STRAVA_REFRESH_TOKEN="your_strava_refresh_token"

# Mapbox (Required for static map generation)
MAPBOX_TOKEN="your_mapbox_token_without_url_restrictions"
```

## 🗺️ Mapbox Setup (Recommended)

### Why Mapbox?
- Interactive maps for activity visualization
- Route display with polylines
- **Static map generation for cost optimization**
- Automatic caching system

### Setup Steps:

#### For Frontend (Optional):
1. Go to [mapbox.com](https://www.mapbox.com/)
2. Create a free account
3. Navigate to "Access tokens" in your account
4. Copy your default public token
5. Add it to your environment variables as `NEXT_PUBLIC_MAPBOX_TOKEN`
6. **Configure URL restrictions** for security (add your domain)

#### For GitHub Actions (Required for Static Maps):
1. Create a **separate token** for GitHub Actions
2. **Name**: "GitHub-Actions-Static-Maps"
3. **URL Restrictions**: **Leave empty** (critical for GitHub Actions)
4. **Scopes**: Default scopes are sufficient
5. Add this token as `MAPBOX_TOKEN` in GitHub Secrets

### 🚀 Static Map Caching System

Our revolutionary caching system provides:
- **99%+ API cost reduction** - Maps generated once, cached forever
- **Lightning fast loading** - Instant display from static files
- **Automatic generation** - New activities get maps automatically
- **Smart fallback** - Live API when static maps unavailable

### Free Tier Limits:
- 50,000 map loads per month
- 50,000 static map requests per month
- **With caching**: Virtually unlimited usage for existing activities

## 🏃‍♂️ Strava Integration

### Setup Process:
1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Note down your Client ID and Client Secret
4. Follow the OAuth flow to get your refresh token

### Required Scopes:
- `read`: Read public profile info
- `activity:read`: Read activity data
- `activity:read_all`: Read private activities

## 🚀 Deployment Configuration

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Enable automatic deployments from main branch

### Environment Variables in Vercel:
```
NEXT_PUBLIC_USER_NAME = "Your Name"
NEXT_PUBLIC_GITHUB_USERNAME = "username"
NEXT_PUBLIC_USER_EMAIL = "email@example.com"
NEXT_PUBLIC_MAPBOX_TOKEN = "pk.ey..." (optional)
```

### Build Configuration
The project includes automatic database preparation for Vercel:
- Database is copied to `/public` directory during build
- Static files are served correctly
- **Static maps are automatically cached and served**

## 🔒 Security Best Practices

### What to Keep Secret:
- ❌ Strava Client Secret
- ❌ Strava Refresh Token
- ❌ Database files with personal data
- ❌ Mapbox token for GitHub Actions (no URL restrictions)

### What's Safe to Expose:
- ✅ Strava Client ID
- ✅ Mapbox Public Token (with URL restrictions)
- ✅ User display information
- ✅ GitHub username

### GitHub Actions Security:
- Use GitHub Secrets for sensitive data
- Never commit tokens to repository
- Regularly rotate access tokens
- **Use separate Mapbox tokens for different purposes**

## 🛠️ Development Setup

### 1. Clone and Install
```bash
git clone https://github.com/your-username/running2.0.git
cd running2.0/apps/web
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Verify Setup
Visit `http://localhost:3000/test-fixes` to verify all configurations.

## 🔍 Troubleshooting

### Common Issues:

#### 1. User Avatar Not Loading
- Check `NEXT_PUBLIC_GITHUB_USERNAME` is correct
- Verify GitHub username exists
- Check network connectivity

#### 2. Maps Not Working
- **Frontend**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set and has URL restrictions
- **Static Maps**: Check GitHub Actions logs for map generation errors
- **API Costs**: Monitor Mapbox usage - should be minimal with caching

#### 3. Static Map Generation Failing
- Verify `MAPBOX_TOKEN` in GitHub Secrets has **no URL restrictions**
- Check GitHub Actions logs for detailed error messages
- Run the test workflow: "Test Mapbox Configuration"

#### 4. Database Connection Issues
- Check `DATABASE_PATH` points to correct file
- Verify database file exists and is readable
- Check file permissions

#### 5. Build Failures
- Ensure all required environment variables are set
- Check for TypeScript errors
- Verify all dependencies are installed

### Debug Commands:
```bash
# Test Mapbox configuration
cd scripts && python test-mapbox-token.py

# Check environment variables
npm run dev 2>&1 | grep -i env

# Test database connection
node -e "console.log(require('./src/lib/database/connection').getDatabase())"

# Verify API endpoints
curl http://localhost:3000/api/stats
curl http://localhost:3000/api/activities
curl http://localhost:3000/api/cache/stats
```

## 📊 Feature Configuration

### User Profile:
- `NEXT_PUBLIC_USER_NAME`: Display name in UI
- `NEXT_PUBLIC_GITHUB_USERNAME`: Used for avatar and GitHub links
- `NEXT_PUBLIC_USER_EMAIL`: Contact information

### Maps:
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Enables interactive maps (optional)
- `MAPBOX_TOKEN` (GitHub Secret): Enables static map generation (recommended)
- **Without tokens**: Shows activity list with coordinates
- **With tokens**: Shows cached static maps + interactive fallback

### Data Sources:
- Currently supports Strava via GitHub Actions
- Future: Garmin, Polar, Nike Run Club integration

## 🎯 Optimization Tips

### Performance:
- **Static maps provide 99%+ faster loading**
- Use CDN for static assets
- Enable Vercel Edge Functions
- Implement proper caching headers

### Cost Optimization:
- **Static map caching eliminates recurring API costs**
- Monitor Mapbox usage via dashboard
- Use separate tokens for different purposes
- Regular cleanup of unused maps

### SEO:
- Set proper meta tags
- Add structured data for activities
- Implement sitemap generation

### Analytics:
- Add Vercel Analytics
- Implement custom event tracking
- Monitor Core Web Vitals
- **Track cache hit rates**

## 📝 Configuration Examples

### Minimal Setup (No Maps):
```env
NEXT_PUBLIC_USER_NAME="John Doe"
NEXT_PUBLIC_GITHUB_USERNAME="johndoe"
DATABASE_PATH="./data/running_page_2.db"
```

### Frontend Maps Only:
```env
NEXT_PUBLIC_USER_NAME="John Doe"
NEXT_PUBLIC_GITHUB_USERNAME="johndoe"
NEXT_PUBLIC_USER_EMAIL="john@example.com"
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"
DATABASE_PATH="./data/running_page_2.db"
```

### Full Setup (Static Maps + Interactive):
```env
# .env.local
NEXT_PUBLIC_USER_NAME="John Doe"
NEXT_PUBLIC_GITHUB_USERNAME="johndoe"
NEXT_PUBLIC_USER_EMAIL="john@example.com"
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"
DATABASE_PATH="./data/running_page_2.db"

# GitHub Secrets
STRAVA_CLIENT_ID="12345"
STRAVA_CLIENT_SECRET="secret123"
STRAVA_REFRESH_TOKEN="refresh123"
MAPBOX_TOKEN="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.no-restrictions"
```

### Custom Avatar:
```env
NEXT_PUBLIC_USER_NAME="John Doe"
NEXT_PUBLIC_USER_AVATAR="https://example.com/custom-avatar.jpg"
```

## 🔄 Updates and Maintenance

### Regular Tasks:
- Update Strava tokens when they expire
- Monitor API usage limits (should be minimal with caching)
- Update dependencies regularly
- Backup database files
- **Monitor static map cache size**

### Monitoring:
- Check GitHub Actions for sync failures
- Monitor Vercel deployment logs
- Track API response times
- **Monitor cache statistics via `/api/cache/stats`**
- Track Mapbox usage (should be very low)

### Cache Management:
- **Automatic**: Maps are generated and cleaned up automatically
- **Manual**: Use scripts in `/scripts/` directory for testing
- **Monitoring**: Check cache stats and file sizes regularly

This configuration guide ensures your Running Page 2.0 is properly set up with optimal performance and cost efficiency!
