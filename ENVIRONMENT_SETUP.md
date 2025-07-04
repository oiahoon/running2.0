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
STRAVA_CLIENT_ID="your_strava_client_id"
STRAVA_CLIENT_SECRET="your_strava_client_secret"
STRAVA_REFRESH_TOKEN="your_strava_refresh_token"
```

## 🗺️ Mapbox Setup (Optional)

### Why Mapbox?
- Interactive maps for activity visualization
- Route display with polylines
- Static map generation for activity locations

### Setup Steps:
1. Go to [mapbox.com](https://www.mapbox.com/)
2. Create a free account
3. Navigate to "Access tokens" in your account
4. Copy your default public token
5. Add it to your environment variables as `NEXT_PUBLIC_MAPBOX_TOKEN`

### Free Tier Limits:
- 50,000 map loads per month
- 50,000 static map requests per month
- Perfect for personal running pages

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
NEXT_PUBLIC_MAPBOX_TOKEN = "pk.ey..."
```

### Build Configuration
The project includes automatic database preparation for Vercel:
- Database is copied to `/public` directory during build
- Static files are served correctly
- No additional configuration needed

## 🔒 Security Best Practices

### What to Keep Secret:
- ❌ Strava Client Secret
- ❌ Strava Refresh Token
- ❌ Database files with personal data

### What's Safe to Expose:
- ✅ Strava Client ID
- ✅ Mapbox Public Token
- ✅ User display information
- ✅ GitHub username

### GitHub Actions Security:
- Use GitHub Secrets for sensitive data
- Never commit tokens to repository
- Regularly rotate access tokens

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
- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Check token is valid and not expired
- Ensure token has correct permissions

#### 3. Database Connection Issues
- Check `DATABASE_PATH` points to correct file
- Verify database file exists and is readable
- Check file permissions

#### 4. Build Failures
- Ensure all required environment variables are set
- Check for TypeScript errors
- Verify all dependencies are installed

### Debug Commands:
```bash
# Check environment variables
npm run dev 2>&1 | grep -i env

# Test database connection
node -e "console.log(require('./src/lib/database/connection').getDatabase())"

# Verify API endpoints
curl http://localhost:3000/api/stats
curl http://localhost:3000/api/activities
```

## 📊 Feature Configuration

### User Profile:
- `NEXT_PUBLIC_USER_NAME`: Display name in UI
- `NEXT_PUBLIC_GITHUB_USERNAME`: Used for avatar and GitHub links
- `NEXT_PUBLIC_USER_EMAIL`: Contact information

### Maps:
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Enables interactive maps
- Without token: Shows activity list with coordinates
- With token: Shows interactive maps with routes

### Data Sources:
- Currently supports Strava via GitHub Actions
- Future: Garmin, Polar, Nike Run Club integration

## 🎯 Optimization Tips

### Performance:
- Use CDN for static assets
- Enable Vercel Edge Functions
- Implement proper caching headers

### SEO:
- Set proper meta tags
- Add structured data for activities
- Implement sitemap generation

### Analytics:
- Add Vercel Analytics
- Implement custom event tracking
- Monitor Core Web Vitals

## 📝 Configuration Examples

### Minimal Setup (No Maps):
```env
NEXT_PUBLIC_USER_NAME="John Doe"
NEXT_PUBLIC_GITHUB_USERNAME="johndoe"
DATABASE_PATH="./data/running_page_2.db"
```

### Full Setup (With Maps):
```env
NEXT_PUBLIC_USER_NAME="John Doe"
NEXT_PUBLIC_GITHUB_USERNAME="johndoe"
NEXT_PUBLIC_USER_EMAIL="john@example.com"
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"
DATABASE_PATH="./data/running_page_2.db"
```

### Custom Avatar:
```env
NEXT_PUBLIC_USER_NAME="John Doe"
NEXT_PUBLIC_USER_AVATAR="https://example.com/custom-avatar.jpg"
```

## 🔄 Updates and Maintenance

### Regular Tasks:
- Update Strava tokens when they expire
- Monitor API usage limits
- Update dependencies regularly
- Backup database files

### Monitoring:
- Check GitHub Actions for sync failures
- Monitor Vercel deployment logs
- Track API response times
- Monitor storage usage

This configuration guide ensures your Running Page 2.0 is properly set up and optimized for your needs!
