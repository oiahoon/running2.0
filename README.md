# Running Page 2.0 🏃‍♂️⚡

A **cyberpunk-styled**, feature-rich running data visualization platform built with Next.js 14, TypeScript, and modern web technologies. Inspired by the original [running_page](https://github.com/yihong0618/running_page) project by [@yihong0618](https://github.com/yihong0618).

![Running Page 2.0](https://img.shields.io/badge/Running%20Page-2.0-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)
![Cyberpunk](https://img.shields.io/badge/Style-Cyberpunk-ff00ff?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjZmYwMGZmIi8+Cjwvc3ZnPgo=)

## 🌟 **NEW: Cyberpunk Geek Style** 

**Complete visual transformation** with a futuristic cyberpunk aesthetic designed for tech enthusiasts and developers:

- **🔮 Neon Color Palette** - Electric cyan, hot pink, and vibrant green accents
- **⚡ Glitch Effects** - Subtle scan lines and digital artifacts
- **🖥️ Terminal Aesthetics** - Monospace fonts and command-line inspired UI
- **💎 Glass Morphism** - Translucent cards with backdrop blur effects
- **🌈 RGB Glow Effects** - Dynamic lighting and shadow effects
- **🎮 Gaming-Inspired** - UI elements that feel like a sci-fi interface

## ✨ Features

### 🎯 Core Functionality
- **📊 Interactive Dashboard** - Comprehensive overview with key metrics and recent activities
- **📋 Activity Management** - Paginated, filterable, and searchable activity list with **working pagination**
- **📈 Advanced Analytics** - Multi-dimensional statistics with beautiful visualizations
- **🗺️ Revolutionary Map System** - Static cached maps with intelligent fallback
- **🔄 Automated Data Sync** - GitHub Actions powered Strava integration
- **📱 Mobile Optimized** - Perfect experience across all devices

### 🎨 **Cyberpunk UI Components**
- **🔥 CyberCard** - Futuristic card components with glow effects
- **⚡ CyberButton** - Neon-styled interactive buttons
- **🎯 CyberBadge** - Activity type indicators with custom icons
- **🔍 CyberInput** - Terminal-style form inputs
- **📊 CyberLoading** - Animated loading states with scan lines
- **🌐 CyberNavigation** - Sleek breadcrumb and menu systems

### 🗺️ Revolutionary Static Map System
- **🚀 Zero-Cost Maps** - Pre-generated PNG maps eliminate API costs
- **⚡ Lightning Performance** - Instant map display with CDN delivery
- **🧠 Intelligent Caching** - Multi-layer cache system with smart preloading
- **🔄 Smart Fallback** - Automatic fallback to live API when needed
- **🌐 CDN Distribution** - jsDelivr CDN for global fast delivery
- **🧹 Auto Management** - Automatic cleanup and cache optimization

### 📊 Advanced Data Visualization
- **📈 Trend Analysis** - Monthly and yearly progress tracking
- **🎯 Activity Distribution** - Interactive pie and bar charts
- **🔥 GitHub-style Heatmap** - Daily activity calendar with intensity
- **🏆 Personal Records** - Automatic PB tracking and highlights
- **📊 Pace Analysis** - Detailed performance metrics and trends
- **🎨 Responsive Charts** - Beautiful visualizations on all screen sizes

### 🎨 Modern UI/UX
- **🌓 Dark/Light Mode** - Automatic theme switching with system preference
- **📱 Responsive Design** - Flawless experience on desktop, tablet, and mobile
- **🎭 Catalyst UI** - Professional, accessible component library
- **✨ Smooth Animations** - Framer Motion powered micro-interactions
- **⏳ Smart Loading** - Skeleton states and progressive loading
- **🎯 Optimized UX** - Eliminated redundant information and improved layouts

### 🔧 Technical Excellence
- **🔒 Type Safety** - Full TypeScript coverage throughout
- **🗄️ Modern Database** - SQLite with Better SQLite3 for performance
- **🌐 RESTful APIs** - Clean, documented API endpoints
- **🛡️ Error Handling** - Comprehensive error boundaries and recovery
- **⚡ Performance** - Code splitting, lazy loading, and intelligent caching
- **🔍 Monitoring** - Built-in cache statistics and health checks

### 🏃‍♂️ **Comprehensive Activity Support**
- **🏃 Running** - Distance, pace, elevation, heart rate tracking
- **🚴 Cycling** - Speed, power, route analysis
- **🏊 Swimming** - Pool and open water sessions
- **🚶 Walking** - Casual walks and hiking adventures
- **🥾 Hiking** - Trail exploration with elevation profiles
- **💪 Workouts** - Gym sessions and strength training
- **🏋️ Weight Training** - Resistance and strength exercises
- **🏃‍♀️ Elliptical** - Indoor cardio sessions
- **🚣 Rowing** - Water and machine rowing
- **🏄 Stand Up Paddling** - Water sports activities

### ⚡ **Performance Optimized**
- **🚀 Fast Loading** - Activities page: 7.13 kB, Dashboard: 4.26 kB
- **🧠 Smart Caching** - 5-minute React Query cache with 10-minute GC
- **🎬 Smooth Animations** - GPU-accelerated with optimized delays
- **📱 Mobile First** - 60fps animations on all devices
- **🔄 Efficient Pagination** - 10 items per page with working Next/Previous
- **🛡️ Error Recovery** - Defensive programming prevents crashes

## 🚀 Quick Start

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oiahoon/running2.0)

### Option 2: Manual Setup
```bash
git clone https://github.com/oiahoon/running2.0.git
cd running2.0/apps/web
npm install
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

## ⚙️ Configuration

### Required Environment Variables

Create `.env.local` in `/apps/web/`:

```env
# User Information
NEXT_PUBLIC_USER_NAME="Your Full Name"
NEXT_PUBLIC_GITHUB_USERNAME="your-github-username"
NEXT_PUBLIC_USER_EMAIL="your-email@example.com"

# Database
DATABASE_PATH="./data/running_page_2.db"

# Optional: Maps (for interactive features)
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"
```

### GitHub Actions Secrets

For automatic data sync and map generation, configure these secrets in your GitHub repository:

```env
# Strava API (Required)
STRAVA_CLIENT_ID="your_strava_client_id"
STRAVA_CLIENT_SECRET="your_strava_client_secret"
STRAVA_REFRESH_TOKEN="your_strava_refresh_token"

# Mapbox (Required for map generation)
MAPBOX_TOKEN="your_mapbox_token_without_url_restrictions"
```

### 🗺️ Map System Configuration

#### **Static Map Caching**
The system automatically uses static cached maps when available:

```env
# Optional: Force CDN-first mode (recommended for production)
NEXT_PUBLIC_PREFER_CDN=true

# Optional: Prefer local maps (development only)
NEXT_PUBLIC_PREFER_LOCAL_MAPS=true
```

#### **Cache Behavior**
- **Image Cache**: 10-minute browser cache for map switching
- **CDN Cache**: 7-day jsDelivr cache for static maps
- **Preloading**: Adjacent activities (±2) preloaded automatically
- **Fallback**: Automatic fallback to Mapbox API if static maps unavailable

#### **Mapbox Configuration**

**Important**: For GitHub Actions to work properly, create a **separate Mapbox token without URL restrictions**:

1. Visit [Mapbox Account](https://account.mapbox.com/access-tokens/)
2. Create a new token named "GitHub-Actions-Maps"
3. **Leave URL restrictions empty** (critical for GitHub Actions)
4. Add this token as `MAPBOX_TOKEN` in GitHub Secrets

## 🏗️ Architecture

### Project Structure
```
running2.0/
├── apps/web/                   # Next.js application
│   ├── src/
│   │   ├── app/               # App Router pages & API routes
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities, database, hooks
│   │   └── styles/           # Global styles
│   ├── data/                 # SQLite database & JSON files
│   └── public/
│       └── maps/             # 🆕 Static cached map images
├── scripts/                  # Data sync & map generation
├── .github/workflows/        # Automated CI/CD
└── docs/                     # Documentation
```

### 🔄 Data Flow

1. **Strava Sync** → Python scripts fetch activity data
2. **Data Processing** → JSON to SQLite migration
3. **Map Generation** → Static PNG creation for GPS activities
4. **CDN Distribution** → Files served via jsDelivr CDN
5. **Smart Loading** → Client-side intelligent cache system

## 🎯 Key Pages

### 📊 Dashboard (`/dashboard`)
- **Activity Overview** - Key metrics and recent activities
- **Smart Maps** - Cached route visualization with instant switching
- **Progress Tracking** - Monthly trends and heatmap
- **Quick Navigation** - Easy access to all features

### 📋 Activities (`/activities`)
- **Advanced Filtering** - Type, date, distance, search
- **Pagination** - Efficient handling of large datasets
- **Detailed Views** - Complete activity metrics
- **Export Options** - Data export capabilities

### 📈 Statistics (`/stats`)
- **Comprehensive Analytics** - Multi-dimensional insights
- **Interactive Charts** - Recharts powered visualizations
- **Time-based Analysis** - Monthly, yearly comparisons
- **Personal Records** - Automatic achievement tracking

### 🗺️ Maps (`/map`)
- **Route Visualization** - Interactive activity maps
- **Clustering** - Intelligent activity grouping
- **Performance Overlay** - Pace and elevation data
- **Location Analysis** - Geographic activity patterns

## 🔄 Automated Systems

### GitHub Actions Workflows

#### 1. **Data Sync & Map Generation** (`sync-data.yml`)
- **Schedule**: Every 6 hours
- **Features**: 
  - Strava data synchronization
  - Static map generation for new activities
  - Database migration and optimization
  - Automatic deployment to Vercel

#### 2. **Mapbox Testing** (`test-mapbox.yml`)
- **Purpose**: Validate Mapbox token configuration
- **Features**:
  - Token validity testing
  - URL restriction detection
  - Test map generation
  - Troubleshooting diagnostics

### 🗺️ Static Map System

Our revolutionary static map caching system provides:

#### **💰 Cost Benefits**
- **99%+ API Cost Reduction** - Eliminate repeated Mapbox API calls
- **Zero Runtime Costs** - Pre-generated maps served from CDN
- **Bandwidth Optimization** - Compressed PNG files vs dynamic generation

#### **⚡ Performance Benefits**
- **Instant Loading** - 0ms for cached maps vs 2-5s API generation
- **Smart Preloading** - Adjacent activities preloaded automatically
- **Intelligent Fallback** - Seamless fallback to API when needed
- **Browser Caching** - 10-minute cache for instant switching

#### **🔧 Technical Implementation**
```typescript
// Automatic cache detection
const mapCheck = await checkStaticMapExists(activityId)
if (mapCheck.exists) {
  // Use CDN URL: https://cdn.jsdelivr.net/gh/user/repo@master/apps/web/public/maps/123.png
  return mapCheck.url
} else {
  // Fallback to Mapbox API
  return generateMapboxUrl(activity)
}
```

## 📊 API Endpoints

### Core APIs
- `GET /api/activities` - Activity data with filtering
- `GET /api/stats` - Statistical analytics
- `GET /api/maps/{id}` - Static map availability
- `GET /api/cache/stats` - Cache statistics

### Response Format
```json
{
  "activities": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 739,
    "hasNext": true
  },
  "summary": {
    "totalActivities": 739,
    "typeDistribution": [...]
  }
}
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run type-check   # TypeScript validation
npm run lint         # Code linting
```

### Database Management
```bash
npm run db:init      # Initialize database
npm run migrate      # Data migration
npm run prepare-db   # Vercel deployment prep
```

### Map Generation (Manual)
```bash
# Test Mapbox configuration
cd scripts && python test-mapbox-token.py

# Generate maps for specific activity
cd scripts && node generate-maps-manual.js [activity_id]

# Generate all maps
cd scripts && python generate-static-maps.py
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository** - Link GitHub repo to Vercel
2. **Configure Environment** - Set environment variables
3. **Deploy** - Automatic deployment on push to main

### Manual Deployment
```bash
npm run build
npm run start
```

## 🎨 Customization

### Adding New Chart Types
1. Create component in `/src/components/charts/`
2. Add to statistics page
3. Update API for required data format

### Custom Activity Types
1. Update mapping in `/src/lib/database/models/Activity.ts`
2. Add icons and colors in chart components
3. Update filtering logic

### Theme Customization
1. Modify `tailwind.config.js`
2. Update CSS variables in `globals.css`
3. Customize Catalyst components

## 🔧 Cache System Configuration

### Image Preload Cache
```typescript
// Cache configuration
const IMAGE_CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
const imagePreloadCache = new Map<string, CacheEntry>()

// Automatic cleanup every 5 minutes
setInterval(cleanupImageCache, 5 * 60 * 1000)
```

### CDN Cache Strategy
- **jsDelivr CDN**: 7-day cache with global distribution
- **Browser Cache**: 10-minute cache for instant switching
- **Preload Strategy**: ±2 adjacent activities preloaded
- **Fallback Chain**: CDN → Local → Mapbox API

### Performance Monitoring
```bash
# Check cache statistics
curl https://your-domain.com/api/cache/stats

# Response
{
  "totalMaps": 423,
  "cacheHitRate": "94.2%",
  "avgLoadTime": "245ms",
  "cdnHits": 387,
  "localHits": 36,
  "apiFallbacks": 0
}
```

## 🐛 Troubleshooting

### Common Issues

**Maps not loading?**
- Check `NEXT_PUBLIC_MAPBOX_TOKEN` configuration
- Verify token permissions and URL restrictions
- Run `/api/cache/stats` to check static map availability
- Check browser console for CDN errors

**Activities not syncing?**
- Verify GitHub Secrets configuration
- Check GitHub Actions logs
- Ensure Strava tokens are valid

**Performance issues?**
- Check database size and indexing
- Monitor API response times
- Review cache hit rates
- Check CDN response times

### Debug Tools
- Check browser console for cache logs
- Monitor Network tab for CDN vs API requests
- Use GitHub Actions for sync status
- Check `/api/debug` for system information

### Cache Debugging
```javascript
// Browser console commands
localStorage.getItem('map-cache-stats')
performance.getEntriesByType('navigation')

// Expected logs
🔍 Checking static map for activity 123
📊 Static map check result: {exists: true, source: 'cdn'}
✅ Using cdn map: https://cdn.jsdelivr.net/gh/...
📦 Using cached map image (instant load)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

### Inspiration & Credits
- **[@yihong0618](https://github.com/yihong0618)** - Original [running_page](https://github.com/yihong0618/running_page) creator and inspiration
- **Strava API** - Activity data source and integration
- **Mapbox** - Interactive maps and static map generation
- **jsDelivr** - Fast, reliable CDN for static map distribution
- **Tailwind UI** - Beautiful, accessible UI components
- **Vercel** - Seamless hosting and deployment platform
- **Next.js Team** - Outstanding React framework

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Catalyst UI
- **Backend**: Node.js, SQLite, Better SQLite3
- **Visualization**: Recharts, D3.js, Mapbox GL JS
- **CDN**: jsDelivr for static map distribution
- **Deployment**: Vercel, GitHub Actions
- **Data**: Strava API, Python processing scripts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/oiahoon/running2.0/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/oiahoon/running2.0/discussions)
- 📧 **Email**: 4296411@qq.com

---

<div align="center">

**Built with ❤️ for runners by runners**

*Inspired by the original running_page project*

[🏃‍♂️ Live Demo](https://run2.miaowu.org) • [📚 Documentation](./docs/) • [🚀 Deploy Your Own](https://vercel.com/new/clone?repository-url=https://github.com/oiahoon/running2.0)

</div>
