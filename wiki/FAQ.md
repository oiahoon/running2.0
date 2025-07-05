# Frequently Asked Questions (FAQ) ❓

Quick answers to the most common questions about Running Page 2.0.

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Setup and Configuration](#setup-and-configuration)
- [Strava Integration](#strava-integration)
- [Maps and Visualization](#maps-and-visualization)
- [Data and Privacy](#data-and-privacy)
- [Costs and Pricing](#costs-and-pricing)
- [Customization](#customization)
- [Technical Questions](#technical-questions)

## General Questions

### What is Running Page 2.0?

Running Page 2.0 is a modern, self-hosted web application that creates a beautiful personal dashboard for your running activities. It automatically syncs with Strava, displays interactive maps, provides detailed statistics, and includes cost-effective static map caching.

### How is this different from the original running_page?

Running Page 2.0 offers several improvements:
- ✅ **Modern tech stack** (Next.js 14, TypeScript, Tailwind CSS)
- ✅ **Static map caching** for 99% cost reduction
- ✅ **Better mobile experience** with responsive design
- ✅ **Enhanced visualizations** with interactive charts
- ✅ **Improved performance** and reliability
- ✅ **Easier deployment** with one-click setup

### Do I need coding experience?

No! The setup process is designed for non-developers:
- **Fork** the repository (1 click)
- **Deploy** to Vercel (1 click)
- **Configure** through web interfaces
- **Customize** through environment variables

### Is it free to use?

Yes! The core application is completely free:
- ✅ **GitHub** - Free for public repositories
- ✅ **Vercel** - Free tier includes hosting
- ✅ **Strava API** - Free for personal use
- ✅ **Mapbox** - Free tier (50k requests/month)

With static map caching, ongoing costs are virtually zero.

## Setup and Configuration

### How long does setup take?

- **Quick setup**: 15 minutes (basic functionality)
- **Full setup**: 30-45 minutes (including maps and customization)
- **First data sync**: 5-15 minutes (depending on activity count)

### What accounts do I need?

**Required**:
- GitHub account (free)
- Vercel account (free)
- Strava account with activities

**Optional**:
- Mapbox account (for maps, free tier available)

### Can I use other fitness platforms besides Strava?

Currently, only Strava is supported. However, the architecture allows for future integrations with:
- Garmin Connect
- Polar Flow
- Nike Run Club
- GPX file imports

### What if I don't have many activities?

The page works with any number of activities:
- **Few activities**: Still provides nice visualization and tracking
- **Many activities**: Showcases your running journey beautifully
- **No activities yet**: Perfect motivation to start running!

## Strava Integration

### Why do I need to create a Strava app?

Strava requires API applications for data access. Creating your own app ensures:
- ✅ **Your data stays private** (only you have access)
- ✅ **No rate limit sharing** with other users
- ✅ **Full control** over permissions and data
- ✅ **Compliance** with Strava's terms of service

### What Strava data is accessed?

The application accesses:
- ✅ **Public profile information** (name, photo)
- ✅ **Activity data** (distance, time, pace, elevation)
- ✅ **GPS routes** (for map visualization)
- ✅ **Activity metadata** (type, date, location)

**Not accessed**:
- ❌ Private messages or social interactions
- ❌ Other athletes' private data
- ❌ Payment or subscription information

### How often does data sync?

- **Automatic sync**: Every 6 hours by default
- **Manual sync**: Anytime through GitHub Actions
- **Customizable**: Change frequency in workflow configuration
- **Incremental**: Only new/changed activities are processed

### What if I make my Strava activities private?

- **Public activities**: Always accessible
- **Private activities**: Require `activity:read_all` scope
- **Followers-only**: Treated as private activities
- **Privacy zones**: Respected and not displayed

## Maps and Visualization

### Do I need Mapbox for maps?

Maps are optional but highly recommended:
- **Without Mapbox**: Activity list with basic location info
- **With Mapbox**: Interactive route maps and visualizations
- **Free tier**: 50,000 map loads per month
- **Static caching**: Reduces usage by 99%+

### How does static map caching work?

Static map caching pre-generates map images:
1. **First time**: Generate PNG image via Mapbox API
2. **Storage**: Save image in your repository
3. **Future loads**: Serve cached image directly
4. **Result**: 99% reduction in API calls and costs

### Can I customize map styles?

Yes! You can customize:
- **Map style**: Streets, satellite, outdoors, dark, light
- **Colors**: Route colors, markers, overlays
- **Size**: Image dimensions and quality
- **Elements**: Start/end markers, route highlighting

### What if GPS data is inaccurate?

The system displays data as provided by Strava:
- **Strava processing**: Routes are processed by Strava first
- **Privacy zones**: Automatically handled
- **Data quality**: Depends on your GPS device/phone
- **Manual correction**: Edit activities in Strava, then re-sync

## Data and Privacy

### Where is my data stored?

Your data is stored in multiple places:
- **GitHub repository**: SQLite database and cached maps
- **Vercel**: Deployed application and database
- **Your browser**: Temporary caching only

**Important**: All storage is under your control.

### Is my data secure?

Yes, security is built-in:
- ✅ **Private repository**: Your fork can be private
- ✅ **Encrypted secrets**: GitHub Secrets are encrypted
- ✅ **HTTPS**: All connections are encrypted
- ✅ **No third-party tracking**: No analytics or tracking
- ✅ **Your control**: You own all data and infrastructure

### Can I delete my data?

Absolutely:
- **Delete repository**: Removes all code and data
- **Delete Vercel project**: Removes deployed application
- **Revoke Strava access**: Removes API permissions
- **Local backups**: Download data before deletion

### Who can see my running page?

By default, your running page is public on the internet. You can:
- **Keep public**: Share with friends and family
- **Make private**: Configure authentication (advanced)
- **Custom domain**: Use your own domain name
- **Password protect**: Add authentication layer

## Costs and Pricing

### What are the ongoing costs?

With proper configuration, ongoing costs are minimal:
- **GitHub**: Free for public repos, $4/month for private
- **Vercel**: Free tier covers most personal use
- **Mapbox**: ~$0-5/month with static caching
- **Domain** (optional): $10-15/year

### How much does Mapbox cost without caching?

Without static caching, costs can be significant:
- **Heavy usage**: $50-200/month
- **With caching**: $0-5/month
- **Savings**: 95-99% cost reduction

### Can I run this completely free?

Yes! Here's how:
- ✅ Use **public GitHub repository**
- ✅ Stay within **Vercel free tier**
- ✅ Enable **static map caching**
- ✅ Use **free Mapbox tier**
- ✅ Skip **custom domain**

### What if I exceed free tiers?

- **Vercel**: $20/month for Pro plan
- **Mapbox**: Pay-as-you-go pricing
- **GitHub**: $4/month for private repos
- **Total**: Usually under $25/month even with heavy usage

## Customization

### How much can I customize?

Extensive customization is possible:
- ✅ **Colors and themes**: Complete visual control
- ✅ **Layout**: Rearrange components and sections
- ✅ **Content**: Add personal information and links
- ✅ **Features**: Enable/disable functionality
- ✅ **Data display**: Choose metrics and formats

### Do I need to code to customize?

Basic customization requires no coding:
- **Environment variables**: User info, colors, settings
- **Configuration files**: Simple JSON/YAML editing
- **Theme selection**: Pre-built themes available

Advanced customization may require:
- **CSS knowledge**: For custom styling
- **React/TypeScript**: For new features
- **GitHub**: For version control

### Can I add my own features?

Yes! The codebase is designed for extensibility:
- ✅ **Open source**: Full access to code
- ✅ **Modern architecture**: Easy to understand and modify
- ✅ **Component-based**: Add new components easily
- ✅ **API-driven**: Extend with new data sources

### Can I contribute back to the project?

Absolutely! Contributions are welcome:
- 🐛 **Bug reports**: Help improve stability
- 💡 **Feature requests**: Suggest improvements
- 🔧 **Code contributions**: Submit pull requests
- 📚 **Documentation**: Improve guides and examples

## Technical Questions

### What technologies are used?

**Frontend**:
- Next.js 14 (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Catalyst UI (components)

**Backend**:
- Node.js (runtime)
- SQLite (database)
- Python (data processing)

**Infrastructure**:
- Vercel (hosting)
- GitHub Actions (automation)
- GitHub (code repository)

### Can I self-host instead of using Vercel?

Yes! You can deploy to:
- **Your own server**: VPS, dedicated server
- **Other platforms**: Netlify, Railway, DigitalOcean
- **Docker**: Containerized deployment
- **Local**: Run on your own computer

### How do I backup my data?

Multiple backup strategies:
- **Git repository**: All data is version controlled
- **Database export**: Download SQLite file
- **Vercel backups**: Deployment history
- **Manual export**: API endpoints for data export

### Can I migrate from the original running_page?

Migration is possible but requires some work:
- **Data format**: Different database schema
- **Configuration**: Different environment variables
- **Features**: Some features may work differently
- **Manual process**: No automated migration tool yet

### What if the project is discontinued?

Your installation remains yours:
- ✅ **Your fork**: Independent copy of the code
- ✅ **Your data**: Stored in your repositories
- ✅ **Your deployment**: Continues running
- ✅ **Open source**: Community can continue development

## Still Have Questions?

### Quick Help Resources

- 📚 **[Wiki Home](Home)** - Complete documentation
- 🔧 **[Common Issues](Common-Issues)** - Troubleshooting guide
- 🚀 **[Quick Setup](Quick-Setup-Guide)** - Get started fast

### Community Support

- 💬 **[GitHub Discussions](https://github.com/your-username/running2.0/discussions)** - Ask questions
- 🐛 **[GitHub Issues](https://github.com/your-username/running2.0/issues)** - Report bugs
- 📧 **Email**: your-email@example.com

### Before Asking

1. **Search existing discussions** - your question might be answered
2. **Check the troubleshooting guide** - common solutions
3. **Include details** - error messages, screenshots, steps
4. **Be specific** - helps us help you faster

---

**Remember**: There are no stupid questions! The community is here to help you succeed with your running page. 🏃‍♂️💪
