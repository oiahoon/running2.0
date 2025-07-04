# Running Page 2.0 🏃‍♂️

A modern, feature-rich running data visualization platform built with Next.js 14, TypeScript, and modern web technologies.

![Running Page 2.0](https://img.shields.io/badge/Running%20Page-2.0-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🎯 Core Functionality
- **📊 Interactive Dashboard** - Overview of your running activities with key metrics
- **📋 Activity List** - Paginated, filterable list of all your activities
- **📈 Statistics & Charts** - Comprehensive analytics with beautiful visualizations
- **🗺️ Interactive Maps** - Activity routes and location visualization (with Mapbox)
- **🔄 Automatic Data Sync** - GitHub Actions integration for seamless Strava sync

### 📊 Data Visualization
- **Monthly Progress Charts** - Track your distance and activity trends
- **Activity Type Distribution** - Pie and bar charts showing activity breakdown
- **GitHub-style Heatmap** - Daily activity calendar visualization
- **Personal Records Tracking** - Longest distance, fastest pace, most elevation
- **Responsive Charts** - Beautiful, interactive charts that work on all devices

### 🎨 Modern UI/UX
- **Dark/Light Mode** - Automatic theme switching with system preference
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Catalyst UI Components** - Professional, accessible interface components
- **Smooth Animations** - Framer Motion powered transitions
- **Loading States** - Skeleton loading for better user experience

### 🔧 Technical Features
- **TypeScript** - Full type safety throughout the application
- **SQLite Database** - Efficient local data storage with Better SQLite3
- **API Routes** - RESTful API endpoints for data access
- **Error Handling** - Comprehensive error boundaries and fallbacks
- **Performance Optimized** - Code splitting, lazy loading, and caching

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
git clone https://github.com/your-username/running2.0.git
cd running2.0
chmod +x scripts/deploy-setup.sh
./scripts/deploy-setup.sh
```

### Option 2: Manual Setup
```bash
git clone https://github.com/your-username/running2.0.git
cd running2.0/apps/web
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**
- **Strava Account** (for data sync)
- **Mapbox Account** (optional, for maps)

## ⚙️ Configuration

### Environment Variables
Create `.env.local` in `/apps/web/`:

```env
# User Configuration
NEXT_PUBLIC_USER_NAME="Your Full Name"
NEXT_PUBLIC_GITHUB_USERNAME="your-github-username"
NEXT_PUBLIC_USER_EMAIL="your-email@example.com"

# Mapbox (Optional - for interactive maps)
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"

# Database
DATABASE_PATH="./data/running_page_2.db"
```

### Strava Integration
Set up GitHub Actions secrets:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET` 
- `STRAVA_REFRESH_TOKEN`

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration guide.

## 🏗️ Project Structure

```
running_2.0/
├── apps/web/                   # Next.js frontend application
│   ├── src/
│   │   ├── app/               # App Router pages and API routes
│   │   ├── components/        # React components
│   │   ├── lib/              # Utilities and database
│   │   └── styles/           # Global styles
│   ├── data/                 # SQLite database and JSON files
│   └── public/               # Static assets
├── scripts/                  # Data sync and processing scripts
├── docs/                     # Project documentation
└── .github/workflows/        # GitHub Actions for data sync
```

## 📊 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Components**: Catalyst UI (Tailwind UI)
- **State Management**: TanStack Query
- **Animation**: Framer Motion

### Data & Visualization
- **Database**: SQLite with Better SQLite3
- **Charts**: Recharts + D3.js
- **Maps**: Mapbox GL JS
- **Data Processing**: Custom TypeScript utilities

### DevOps & Deployment
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Data Sync**: Python scripts
- **Code Quality**: ESLint, Prettier, TypeScript

## 🎯 Key Pages

### 📊 Dashboard (`/dashboard`)
- Activity overview with key metrics
- Recent activities list
- Monthly progress chart
- Activity heatmap
- Interactive map preview

### 📋 Activities (`/activities`)
- Paginated activity list
- Advanced filtering (type, date, distance)
- Search functionality
- Activity details with metrics

### 📈 Statistics (`/stats`)
- Comprehensive analytics dashboard
- Monthly and yearly trends
- Activity type distribution
- Personal records tracking
- Calendar heatmap

### 🗺️ Map (`/map`)
- Interactive activity map
- Route visualization
- Activity clustering
- Location-based filtering

## 🔄 Data Sync

### Automatic Sync (GitHub Actions)
- Runs every 6 hours automatically
- Fetches new activities from Strava
- Updates SQLite database
- Deploys to Vercel automatically

### Manual Sync
```bash
cd scripts
python sync_strava.py
node migrate-strava-json.js
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Database Management
```bash
npm run db:init      # Initialize database
npm run migrate      # Run data migration
npm run prepare-db   # Prepare for Vercel deployment
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## 🔧 Customization

### Adding New Chart Types
1. Create component in `/src/components/charts/`
2. Add to stats page
3. Update API to provide required data format

### Custom Activity Types
1. Update activity type mapping in `/src/lib/database/models/Activity.ts`
2. Add icons and colors in chart components
3. Update filtering logic

### Theme Customization
1. Modify Tailwind config in `tailwind.config.js`
2. Update CSS variables in `globals.css`
3. Customize Catalyst components

## 📚 Documentation

- [🔧 Environment Setup](./ENVIRONMENT_SETUP.md) - Detailed configuration guide
- [🛠️ Fixes & Improvements](./FIXES_AND_IMPROVEMENTS.md) - Recent fixes and enhancement suggestions
- [📊 API Documentation](./docs/api/) - API endpoints and data formats
- [🎨 Design System](./docs/design/) - UI components and design guidelines

## 🐛 Troubleshooting

### Common Issues

**Activities not showing?**
- Check database file exists in `/apps/web/data/`
- Verify Strava sync is working
- Check API endpoints at `/api/activities`

**Charts not loading?**
- Verify data format in `/api/stats`
- Check browser console for errors
- Ensure all dependencies are installed

**Maps not working?**
- Add `NEXT_PUBLIC_MAPBOX_TOKEN` to environment
- Verify Mapbox token is valid
- Check network connectivity

**User avatar not showing?**
- Verify `NEXT_PUBLIC_GITHUB_USERNAME` is correct
- Check GitHub username exists
- Ensure network access to GitHub

### Debug Tools
- Visit `/test-fixes` to verify all functionality
- Check `/api/debug` for system information
- Use browser dev tools for client-side debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Original Running Page** - Inspiration and data structure
- **Strava API** - Activity data source
- **Mapbox** - Interactive maps
- **Tailwind UI** - Beautiful UI components
- **Vercel** - Hosting and deployment
- **Next.js Team** - Amazing framework

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/running2.0/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/your-username/running2.0/discussions)
- 📧 **Email**: your-email@example.com

---

<div align="center">

**Built with ❤️ for runners by runners**

[🏃‍♂️ Live Demo](https://your-running-page.vercel.app) • [📚 Documentation](./docs/) • [🚀 Deploy Your Own](https://vercel.com/new/clone?repository-url=https://github.com/your-username/running2.0)

</div>
