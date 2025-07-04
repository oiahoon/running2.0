# Data Sources Integration Plan

## 📊 Original Project Analysis

Based on the original running_page project, we need to integrate **24 Python scripts** that handle data synchronization from various sources.

### 🔍 Complete Script Inventory

#### Core Sync Scripts (8 platforms)
1. **`strava_sync.py`** - Strava API integration (most popular)
2. **`garmin_sync.py`** - Garmin Connect (global version)
3. **`nike_sync.py`** - Nike Run Club integration
4. **`keep_sync.py`** - Keep app (Chinese fitness platform)
5. **`codoon_sync.py`** - Codoon (Chinese running app)
6. **`joyrun_sync.py`** - JoyRun social running platform
7. **`tulipsport_sync.py`** - Tulipsport fitness tracking
8. **`endomondo_sync.py`** - Endomondo (legacy platform)

#### File Format Processors (3 types)
9. **`gpx_sync.py`** - GPX file processing
10. **`tcx_sync.py`** - TCX file processing  
11. **`fit_sync.py`** - FIT file processing

#### Cross-Platform Sync (6 scripts)
12. **`nike_to_strava_sync.py`** - Nike → Strava backup
13. **`garmin_to_strava_sync.py`** - Garmin → Strava backup
14. **`strava_to_garmin_sync.py`** - Strava → Garmin backup
15. **`gpx_to_strava_sync.py`** - GPX → Strava upload
16. **`tcx_to_strava_sync.py`** - TCX → Strava upload
17. **`garmin_sync_cn_global.py`** - Garmin CN → Global sync

#### Utility Scripts (7 scripts)
18. **`get_garmin_secret.py`** - Garmin authentication helper
19. **`garmin_device_adaptor.py`** - Device compatibility layer
20. **`gen_svg.py`** - GitHub profile SVG generation
21. **`polyline_processor.py`** - Route polyline processing
22. **`data_to_csv.py`** - Data export functionality
23. **`synced_data_file_logger.py`** - Sync logging system
24. **`utils.py`** - Common utility functions
25. **`config.py`** - Configuration management

## 🎯 Integration Strategy for Running Page 2.0

### Phase 1: Core Data Sources (Week 1-2)
**Priority: HIGH** - These cover 80% of users

#### 1. Strava Integration
```python
# Original: run_page/strava_sync.py
# New: apps/web/src/lib/sync/strava.ts + API route
```
- OAuth 2.0 authentication
- Activity data sync
- Rate limiting handling
- Webhook support for real-time updates

#### 2. Garmin Integration  
```python
# Original: run_page/garmin_sync.py + get_garmin_secret.py
# New: apps/web/src/lib/sync/garmin.ts + API route
```
- Secret string authentication
- Global and China versions
- Device data processing
- TCX/FIT file handling

#### 3. File Upload System
```python
# Original: gpx_sync.py, tcx_sync.py, fit_sync.py
# New: apps/web/src/lib/sync/files.ts + upload API
```
- Drag & drop file upload
- Batch processing
- Format validation
- Metadata extraction

### Phase 2: Popular Platforms (Week 3-4)
**Priority: MEDIUM** - Regional and specialized platforms

#### 4. Nike Run Club
```python
# Original: run_page/nike_sync.py
# New: apps/web/src/lib/sync/nike.ts
```
- Refresh token authentication
- Activity data parsing
- Nike-specific metrics

#### 5. Keep Integration (Chinese Market)
```python
# Original: run_page/keep_sync.py  
# New: apps/web/src/lib/sync/keep.ts
```
- Mobile app authentication
- Chinese fitness data
- Social features integration

### Phase 3: Additional Sources (Week 5-6)
**Priority: LOW** - Niche platforms and legacy support

#### 6. Codoon, JoyRun, Tulipsport
```python
# Original: codoon_sync.py, joyrun_sync.py, tulipsport_sync.py
# New: Individual TypeScript modules
```

### Phase 4: Cross-Platform Sync (Week 7-8)
**Priority: LOW** - Advanced features for power users

#### 7. Platform-to-Platform Sync
- Backup strategies
- Data migration tools
- Sync conflict resolution

## 🔧 Technical Implementation Plan

### 1. Data Layer Architecture
```typescript
// apps/web/src/lib/database/
├── models/
│   ├── Activity.ts          // Core activity model
│   ├── User.ts             // User preferences
│   └── SyncLog.ts          // Sync history tracking
├── repositories/
│   ├── ActivityRepository.ts
│   └── SyncRepository.ts
└── migrations/
    └── initial.sql         // Database schema
```

### 2. Sync Service Architecture
```typescript
// apps/web/src/lib/sync/
├── base/
│   ├── SyncProvider.ts     // Abstract base class
│   ├── AuthProvider.ts     // Authentication handling
│   └── RateLimiter.ts      // API rate limiting
├── providers/
│   ├── StravaProvider.ts   // Strava implementation
│   ├── GarminProvider.ts   // Garmin implementation
│   └── FileProvider.ts     // File upload handling
└── SyncManager.ts          // Orchestrates all providers
```

### 3. API Routes Structure
```typescript
// apps/web/src/app/api/
├── sync/
│   ├── strava/
│   │   ├── auth/route.ts   // OAuth flow
│   │   └── sync/route.ts   // Data sync
│   ├── garmin/
│   │   └── sync/route.ts
│   └── files/
│       └── upload/route.ts
├── activities/
│   ├── route.ts            // CRUD operations
│   └── [id]/route.ts       // Individual activity
└── stats/
    └── route.ts            // Statistics API
```

### 4. Background Job System
```typescript
// apps/web/src/lib/jobs/
├── SyncScheduler.ts        // Cron job management
├── QueueManager.ts         // Job queue handling
└── processors/
    ├── ActivityProcessor.ts
    └── SyncProcessor.ts
```

## 📋 Migration Checklist

### Database Migration
- [ ] **SQLite Schema Analysis** - Understand current structure
- [ ] **Data Model Creation** - TypeScript interfaces
- [ ] **Migration Scripts** - Safe data transfer
- [ ] **Backup Strategy** - Preserve existing data

### Script Migration Priority
#### Phase 1 (Essential - Week 1-2)
- [ ] `strava_sync.py` → TypeScript + API
- [ ] `garmin_sync.py` → TypeScript + API  
- [ ] `gpx_sync.py` → File upload system
- [ ] `utils.py` → Shared utilities

#### Phase 2 (Important - Week 3-4)
- [ ] `nike_sync.py` → Nike integration
- [ ] `keep_sync.py` → Keep integration
- [ ] `tcx_sync.py` → TCX file support
- [ ] `fit_sync.py` → FIT file support

#### Phase 3 (Nice-to-have - Week 5-6)
- [ ] `codoon_sync.py` → Codoon integration
- [ ] `joyrun_sync.py` → JoyRun integration
- [ ] `tulipsport_sync.py` → Tulipsport integration
- [ ] Cross-platform sync scripts

#### Phase 4 (Advanced - Week 7-8)
- [ ] `gen_svg.py` → SVG generation API
- [ ] GitHub Actions integration
- [ ] Advanced sync features
- [ ] Performance optimization

### Authentication & Security
- [ ] **OAuth 2.0 Implementation** - Strava, others
- [ ] **Secret Management** - Environment variables
- [ ] **Rate Limiting** - API quota management
- [ ] **Error Handling** - Robust sync processes
- [ ] **Logging System** - Comprehensive sync logs

### Testing Strategy
- [ ] **Unit Tests** - Individual sync providers
- [ ] **Integration Tests** - End-to-end sync flows
- [ ] **Mock Data** - Testing without real APIs
- [ ] **Performance Tests** - Large dataset handling

## 🎯 Success Metrics

### Functional Requirements
- [ ] **Data Parity** - All original data sources supported
- [ ] **Sync Reliability** - 99%+ success rate
- [ ] **Performance** - Sub-5s sync for typical datasets
- [ ] **Error Recovery** - Automatic retry with exponential backoff

### User Experience
- [ ] **Easy Setup** - One-click OAuth for major platforms
- [ ] **Progress Tracking** - Real-time sync status
- [ ] **Error Reporting** - Clear error messages and solutions
- [ ] **Data Privacy** - User control over data sharing

This comprehensive integration plan ensures we maintain full compatibility with the original running_page while building a more robust, scalable, and user-friendly system.
