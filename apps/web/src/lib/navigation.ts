export const navigation = [
  {
    title: 'Overview',
    links: [
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Statistics', href: '/stats' },
    ],
  },
  {
    title: 'Activities',
    links: [
      { title: 'All Activities', href: '/activities' },
      { title: 'Running', href: '/activities?type=run' },
      { title: 'Walking', href: '/activities?type=walk' },
      { title: 'Cycling', href: '/activities?type=ride' },
    ],
  },
  {
    title: 'Visualization',
    links: [
      { title: 'Route Map', href: '/map' },
      { title: 'Heatmap', href: '/map?view=heatmap' },
      { title: 'Year in Review', href: '/stats/yearly' },
    ],
  },
  {
    title: 'Data Sources',
    links: [
      { title: 'Strava', href: '/sync/strava' },
      { title: 'Garmin', href: '/sync/garmin' },
      { title: 'Nike Run Club', href: '/sync/nike' },
      { title: 'GPX Files', href: '/sync/gpx' },
    ],
  },
]
