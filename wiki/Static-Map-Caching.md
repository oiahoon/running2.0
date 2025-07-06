# Static Map Caching System

Running Page 2.0 features a revolutionary static map caching system that provides **99%+ cost reduction** and **instant loading** for activity maps.

## 🚀 System Overview

### Architecture
```
Activity Request → Static Map Check → CDN/Local → Fallback to API
                     ↓
              [jsDelivr CDN] → [Local Files] → [Mapbox API]
```

### Key Benefits
- **💰 Zero Runtime Costs** - Pre-generated maps eliminate API calls
- **⚡ Instant Loading** - 0ms load time for cached maps
- **🌐 Global CDN** - jsDelivr provides worldwide fast delivery
- **🧠 Smart Preloading** - Adjacent activities preloaded automatically
- **🔄 Intelligent Fallback** - Seamless fallback when maps unavailable

## ⚙️ Configuration

### Environment Variables

```env
# Optional: Force CDN-first mode (recommended for production)
NEXT_PUBLIC_PREFER_CDN=true

# Optional: Prefer local maps (development only)
NEXT_PUBLIC_PREFER_LOCAL_MAPS=true
```

### Cache Behavior Settings

#### **Image Preload Cache**
```typescript
const IMAGE_CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
const imagePreloadCache = new Map<string, CacheEntry>()

// Automatic cleanup every 5 minutes
setInterval(cleanupImageCache, 5 * 60 * 1000)
```

#### **CDN Cache Strategy**
- **jsDelivr CDN**: 7-day cache with global distribution
- **Browser Cache**: 10-minute cache for instant switching
- **Preload Strategy**: ±2 adjacent activities preloaded
- **Fallback Chain**: CDN → Local → Mapbox API

## 🔧 Technical Implementation

### Cache Detection Logic
```typescript
// Automatic cache detection
const mapCheck = await checkStaticMapExists(activityId)
if (mapCheck.exists) {
  // Use CDN URL
  return `https://cdn.jsdelivr.net/gh/user/repo@master/apps/web/public/maps/${activityId}.png`
} else {
  // Fallback to Mapbox API
  return generateMapboxUrl(activity)
}
```

### Production Environment Detection
```typescript
const isProduction = process.env.NODE_ENV === 'production'
const preferCDN = process.env.NEXT_PUBLIC_PREFER_CDN === 'true' || isProduction

if (preferCDN || isProduction) {
  // Always try CDN first in production
  console.log(`🌐 Trying CDN first (production mode): ${cdnUrl}`)
}
```

### Intelligent Preloading
```typescript
// Preload adjacent activity maps for better UX
const preloadAdjacentMaps = async (activities: Activity[], currentIndex: number) => {
  // Preload previous and next 2 activities
  for (let i = Math.max(0, currentIndex - 2); i <= Math.min(activities.length - 1, currentIndex + 2); i++) {
    if (i === currentIndex) continue // Skip current activity
    
    const activity = activities[i]
    if (!activity.startLatitude || !activity.startLongitude) continue
    
    // Preload in background without blocking UI
    preloadMapInBackground(activity)
  }
}
```

## 📊 Performance Monitoring

### Cache Statistics API
```bash
# Check cache performance
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

### Browser Console Debugging
```javascript
// Expected logs for successful cache hit
🔍 Checking static map for activity 15002226211
📊 Static map check result: {exists: true, source: 'cdn'}
✅ Using cdn map: https://cdn.jsdelivr.net/gh/oiahoon/running2.0@master/apps/web/public/maps/15002226211.png
📦 Using cached map image (instant load)
```

### Performance Metrics
- **Cache Hit Rate**: 90%+ expected
- **Load Time**: 
  - Cached maps: 0-200ms
  - CDN maps: 200-1000ms
  - API fallback: 2000-5000ms
- **Cost Reduction**: 99%+ API calls eliminated

## 🗺️ Map Generation Process

### Automated Generation (GitHub Actions)
```yaml
# .github/workflows/sync-data.yml
- name: Generate Static Maps
  run: |
    cd scripts
    python generate-static-maps.py
    
- name: Commit Maps
  run: |
    git add apps/web/public/maps/
    git commit -m "🗺️ Update static maps"
    git push
```

### Manual Generation
```bash
# Generate maps for specific activity
cd scripts && node generate-maps-manual.js [activity_id]

# Generate all missing maps
cd scripts && python generate-static-maps.py

# Test map generation
cd scripts && python test-mapbox-token.py
```

### Map File Structure
```
apps/web/public/maps/
├── 15002226211.png    # Activity external_id as filename
├── 15002226156.png
├── 15002226174.png
└── ...
```

## 🔄 Cache Lifecycle

### 1. Map Request
```typescript
🗺️ Creating map URL for 1 activities
🎯 Single activity detected, trying static map first
```

### 2. CDN Check (Production)
```typescript
🔧 Environment: production, preferCDN: true, preferLocal: false
🌐 Trying CDN first (production mode): https://cdn.jsdelivr.net/gh/...
📡 CDN response: 200 OK
```

### 3. Cache Hit
```typescript
✅ Using cdn map for activity 15002226211: https://cdn.jsdelivr.net/gh/...
📦 Using cached map image (instant load)
```

### 4. Preloading
```typescript
🚀 Preloaded adjacent map: https://cdn.jsdelivr.net/gh/.../15002226156.png
🚀 Preloaded adjacent map: https://cdn.jsdelivr.net/gh/.../15002226174.png
```

## 🐛 Troubleshooting

### Common Issues

#### Maps Not Loading
**Symptoms**: All maps show Mapbox API URLs instead of CDN
**Debug**: Check browser console for:
```
⚠️ Static map check failed: ReferenceError: checkStaticMapExists is not defined
```
**Solution**: Ensure proper import in components:
```typescript
import { checkStaticMapExists } from '@/lib/utils/cdn'
```

#### CDN 404 Errors
**Symptoms**: CDN URLs return 404 Not Found
**Debug**: 
```
📡 CDN response: 404 Not Found
🔄 Falling back to Mapbox API
```
**Solutions**:
1. Wait for jsDelivr to sync (up to 24 hours)
2. Check if files exist in GitHub repository
3. Verify GitHub repository is public

#### Slow Loading
**Symptoms**: Maps take 2-5 seconds to load
**Debug**: Check Network tab for:
- CDN requests timing out
- Fallback to Mapbox API
**Solutions**:
1. Increase CDN timeout: `setTimeout(() => controller.abort(), 20000)`
2. Enable CDN-first mode: `NEXT_PUBLIC_PREFER_CDN=true`

### Debug Commands

#### Browser Console
```javascript
// Check cache status
localStorage.getItem('map-cache-stats')

// Clear cache
localStorage.clear()

// Monitor performance
performance.getEntriesByType('navigation')
```

#### API Testing
```bash
# Test specific map availability
curl -I "https://cdn.jsdelivr.net/gh/oiahoon/running2.0@master/apps/web/public/maps/15002226211.png"

# Check server-side files
curl "https://your-domain.com/api/check-maps?activityId=15002226211"

# Monitor cache statistics
curl "https://your-domain.com/api/cache/stats"
```

## 🎯 Best Practices

### Development
1. **Use local preference**: Set `NEXT_PUBLIC_PREFER_LOCAL_MAPS=true`
2. **Test CDN URLs manually** before deployment
3. **Monitor console logs** for cache behavior
4. **Clear browser cache** when testing changes

### Production
1. **Enable CDN-first mode**: `NEXT_PUBLIC_PREFER_CDN=true`
2. **Monitor cache hit rates** via `/api/cache/stats`
3. **Set up alerts** for high API usage (indicates cache misses)
4. **Regular map generation** via GitHub Actions

### Optimization
1. **Preload strategy**: Adjust preload range based on user behavior
2. **Cache duration**: Balance between freshness and performance
3. **CDN timeout**: Optimize based on your CDN performance
4. **Fallback strategy**: Ensure graceful degradation

## 📈 Expected Performance

### Before Static Caching
- **Map Load Time**: 2-5 seconds per map
- **API Calls**: 1 call per map view
- **Cost**: $X per 1000 map views
- **User Experience**: Loading states, delays

### After Static Caching
- **Map Load Time**: 0-200ms (cached), 200-1000ms (CDN)
- **API Calls**: <1% of original (99%+ reduction)
- **Cost**: Near zero for cached maps
- **User Experience**: Instant switching, smooth navigation

This caching system transforms the user experience from slow, costly map generation to instant, free map display! 🚀
