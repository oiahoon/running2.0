---
title: Running Page 2.0
---

A modern, beautiful running data visualization platform that brings your fitness journey to life. Track, analyze, and visualize your running activities with powerful insights and stunning maps. {% .lead %}

{% quick-links %}

{% quick-link title="Dashboard" icon="installation" href="/dashboard" description="View your running statistics, recent activities, and performance trends at a glance." /%}

{% quick-link title="Activities" icon="presets" href="/activities" description="Browse and analyze all your running activities with detailed metrics and route maps." /%}

{% quick-link title="Statistics" icon="plugins" href="/stats" description="Dive deep into your running data with comprehensive charts and performance analytics." /%}

{% quick-link title="Route Map" icon="theming" href="/map" description="Explore your running routes on interactive maps with heatmaps and 3D visualizations." /%}

{% /quick-links %}

Running Page 2.0 transforms your fitness data into beautiful, actionable insights. Whether you're training for a marathon or just staying active, our platform helps you understand your progress and stay motivated.

---

## Supported Data Sources

Connect your favorite fitness apps and devices to automatically sync your running data.

### Popular Platforms

Running Page 2.0 supports 15+ data sources including all major fitness platforms:

- **Strava** - The social network for athletes
- **Garmin Connect** - For Garmin device users (Global & China)
- **Nike Run Club** - Nike's running community app
- **Apple Health** - iOS health data integration

### File Formats

Import your data directly from files:

```shell
# Supported file formats
GPX files    # GPS Exchange Format
TCX files    # Training Center XML
FIT files    # Flexible and Interoperable Data Transfer
```

Upload your workout files and let Running Page 2.0 automatically process and visualize your activities.

{% callout type="warning" title="Privacy First" %}
Your data stays secure. Running Page 2.0 processes your fitness data locally and gives you full control over what information is shared and displayed.
{% /callout %}

### GitHub Actions Integration

Automatically sync your data with powerful automation:

```yaml
# .github/workflows/sync-data.yml
name: Sync Running Data
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync Strava Data
        run: python scripts/strava_sync.py
```

Set up automated data synchronization that runs in the background, keeping your running page always up-to-date.

{% callout title="Open Source" %}
Running Page 2.0 is built on open-source technologies and welcomes contributions from the running community. Join us in making fitness data visualization better for everyone.
{% /callout %}

---

## Key Features

Discover what makes Running Page 2.0 the ultimate running data platform.

### Beautiful Visualizations

Transform your running data into stunning visual stories:

- **Interactive Maps** - See your routes on beautiful, customizable maps
- **Performance Charts** - Track your progress with detailed analytics
- **Calendar Heatmaps** - Visualize your activity patterns over time
- **3D Route Views** - Experience your runs in three dimensions

### Smart Analytics

Get insights that help you improve:

- **Pace Analysis** - Understand your running rhythm and consistency
- **Heart Rate Zones** - Optimize your training intensity
- **Personal Records** - Celebrate your achievements and milestones
- **Training Load** - Monitor your fitness progression

### Modern Technology

Built with the latest web technologies for the best experience:

- **Next.js 14** - Lightning-fast performance and SEO
- **TypeScript** - Type-safe development and better reliability
- **Tailwind CSS** - Beautiful, responsive design
- **Mapbox** - Professional-grade mapping and visualization

---

## Getting Started

Ready to visualize your running journey? Here's how to get started:

### Quick Setup

1. **Connect Your Data Source** - Link your Strava, Garmin, or other fitness accounts
2. **Sync Your Activities** - Import your historical running data
3. **Explore Your Dashboard** - Discover insights about your running patterns
4. **Share Your Journey** - Show off your progress with beautiful visualizations

### Advanced Features

For power users who want more control:

- **Custom Data Processing** - Fine-tune how your data is analyzed
- **Privacy Controls** - Decide exactly what information to display
- **Export Options** - Download your data in various formats
- **API Access** - Integrate with other tools and services

### Community

Join thousands of runners who use Running Page 2.0:

- **Share Routes** - Discover new running paths from the community
- **Compare Progress** - See how your performance stacks up
- **Get Motivated** - Find inspiration from other runners' journeys
- **Contribute** - Help improve the platform for everyone

Start your journey with Running Page 2.0 today and see your running data like never before!
