# Original Running Page - Feature Analysis

## 📊 Core Features

### 1. Data Sources Integration
**Supported Platforms:**
- Strava
- Garmin (Global & China)
- Nike Run Club
- Keep
- Codoon
- JoyRun
- Tulipsport
- GPX/TCX/FIT files

**Data Sync Scripts:**
- `garmin_sync.py` - Garmin data synchronization
- `strava_sync.py` - Strava API integration
- `nike_sync.py` - Nike Run Club data
- `keep_sync.py` - Keep app data
- `codoon_sync.py` - Codoon platform
- `gpx_sync.py` - GPX file processing
- `tcx_sync.py` - TCX file processing
- `fit_sync.py` - FIT file processing

### 2. Data Storage
**Database Schema (SQLite):**
```sql
CREATE TABLE activities (
    run_id INTEGER PRIMARY KEY,
    name VARCHAR,
    distance FLOAT,
    moving_time DATETIME,
    elapsed_time DATETIME,
    type VARCHAR,
    start_date VARCHAR,
    start_date_local VARCHAR,
    location_country VARCHAR,
    summary_polyline VARCHAR,
    average_heartrate FLOAT,
    average_speed FLOAT
);
```

### 3. Visualization Components

#### 3.1 Map Visualization (`src/components/RunMap/`)
- **Technology**: Mapbox GL JS + react-map-gl
- **Features**:
  - Interactive route display
  - Multiple map styles (dark theme)
  - Polyline rendering with customizable colors
  - Start/end markers for single runs
  - Province/region highlighting (China-specific)
  - Fullscreen control
  - Navigation controls
  - Language support (Chinese/English)
  - Privacy mode (hide map, show only routes)
  - Lights on/off toggle

#### 3.2 Statistics Components

**YearStat (`src/components/YearStat/`)**
- Annual running statistics
- Distance, time, and count metrics
- Year-over-year comparison

**LocationStat (`src/components/LocationStat/`)**
- Geographic distribution of runs
- City/province statistics
- Location-based insights

**RunTable (`src/components/RunTable/`)**
- Tabular view of all runs
- Sortable columns
- Filtering capabilities
- Pagination

**SVGStat (`src/components/SVGStat/`)**
- GitHub profile integration
- SVG generation for statistics
- Grid view of running data
- Circular year view

### 4. GitHub Actions Integration

**Workflow Features:**
- Automated data synchronization
- Multiple trigger types (schedule, manual, push)
- Support for all data sources
- SVG generation for GitHub profiles
- Configurable sync intervals
- Error handling and notifications

**Generated Assets:**
- `assets/github.svg` - GitHub profile stats
- `assets/grid.svg` - Grid view of runs
- `assets/circular.svg` - Circular year view
- Yearly SVG files

### 5. Configuration System

**Site Metadata (`src/static/site-metadata.ts`)**
- Site title and URL
- Logo and branding
- Navigation links
- SEO metadata

**Constants (`src/utils/const.ts`)**
- Mapbox token configuration
- Map styling options
- Color themes
- Language settings
- Privacy settings
- Analytics integration

### 6. Styling and Theming

**Technology Stack:**
- Sass/SCSS
- Tachyons CSS framework
- CSS Modules
- Custom color schemes

**Design Elements:**
- Dark theme focus
- Minimalist design
- Mobile-responsive layout
- Custom color palettes

### 7. Internationalization
- Chinese/English language support
- Localized messages and UI text
- Region-specific features (China map data)

### 8. Privacy Features
- Data anonymization options
- Polyline filtering
- Start/end point obfuscation
- Privacy mode for sensitive locations

## 🔧 Technical Architecture

### Frontend Stack
- React 18
- TypeScript
- Vite build tool
- React Router for navigation
- React Helmet for SEO

### Backend/Data Processing
- Python 3.8+
- SQLite database
- Various API integrations
- GPX/TCX/FIT file processing

### Deployment
- Vercel (recommended)
- GitHub Pages
- Cloudflare Pages
- Docker support

## 📈 Data Flow

1. **Data Collection**: Sync scripts fetch data from various sources
2. **Data Processing**: Python scripts process and normalize data
3. **Data Storage**: SQLite database stores processed activities
4. **Frontend Rendering**: React components visualize data
5. **Asset Generation**: SVG files generated for external use

## 🎯 Key Strengths

1. **Comprehensive Data Source Support**
2. **Robust Automation System**
3. **Flexible Deployment Options**
4. **Privacy-Conscious Design**
5. **GitHub Integration**
6. **Internationalization Support**

## 🔍 Areas for Improvement

1. **UI/UX Modernization**
2. **Enhanced Interactivity**
3. **Better Mobile Experience**
4. **Advanced Analytics**
5. **Performance Optimization**
6. **Modern Development Tooling**
