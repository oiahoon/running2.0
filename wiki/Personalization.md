# Personalization Guide 🎨

Make your Running Page 2.0 uniquely yours with custom information, styling, and features.

## 📋 Table of Contents

- [Basic User Information](#basic-user-information)
- [Custom Avatar](#custom-avatar)
- [Page Titles and Metadata](#page-titles-and-metadata)
- [Social Links](#social-links)
- [Activity Display Preferences](#activity-display-preferences)
- [Custom Styling](#custom-styling)
- [Advanced Customization](#advanced-customization)

## Basic User Information

### Environment Variables Setup

Configure these in your **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
NEXT_PUBLIC_USER_NAME="Your Full Name"
NEXT_PUBLIC_GITHUB_USERNAME="your-github-username"
NEXT_PUBLIC_USER_EMAIL="your-email@example.com"
```

### What Each Variable Controls

**NEXT_PUBLIC_USER_NAME**
- Appears in page header
- Used in page titles
- Shows in activity cards
- Displays in statistics

**NEXT_PUBLIC_GITHUB_USERNAME**
- Used for GitHub avatar
- Links to your GitHub profile
- Repository references

**NEXT_PUBLIC_USER_EMAIL**
- Contact information
- Footer links
- Optional display

### Example Configuration
```env
NEXT_PUBLIC_USER_NAME="Sarah Johnson"
NEXT_PUBLIC_GITHUB_USERNAME="sarahj-runner"
NEXT_PUBLIC_USER_EMAIL="sarah@example.com"
```

## Custom Avatar

### Option 1: GitHub Avatar (Default)
Your GitHub profile picture is used automatically.

**To change:**
1. Go to GitHub → Settings → Profile
2. Upload new profile picture
3. Your running page will update automatically

### Option 2: Custom Avatar URL
```env
NEXT_PUBLIC_USER_AVATAR="https://example.com/your-avatar.jpg"
```

**Requirements:**
- ✅ HTTPS URL
- ✅ Direct image link
- ✅ Recommended: 400x400px or larger
- ✅ Formats: JPG, PNG, WebP

**Good sources:**
- Personal website
- Cloud storage (Dropbox, Google Drive public links)
- Image hosting services (Imgur, Cloudinary)

### Option 3: Local Avatar
1. Add image to `apps/web/public/images/`
2. Set environment variable:
   ```env
   NEXT_PUBLIC_USER_AVATAR="/images/my-avatar.jpg"
   ```

## Page Titles and Metadata

### Custom Page Title
Edit `apps/web/src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'Sarah\'s Running Journey',
  description: 'Follow my running adventures and personal records',
  // ...
}
```

### Custom Descriptions
```typescript
export const metadata: Metadata = {
  title: 'Your Running Page',
  description: 'Personal running statistics, routes, and achievements',
  keywords: 'running, fitness, marathon, training, strava',
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
}
```

### Social Media Cards
```typescript
openGraph: {
  title: 'Your Running Page',
  description: 'Follow my running journey',
  url: 'https://your-site.vercel.app',
  siteName: 'Your Running Page',
  images: [
    {
      url: 'https://your-site.vercel.app/og-image.jpg',
      width: 1200,
      height: 630,
    },
  ],
},
twitter: {
  card: 'summary_large_image',
  title: 'Your Running Page',
  description: 'Follow my running journey',
  images: ['https://your-site.vercel.app/og-image.jpg'],
},
```

## Social Links

### Add Social Media Links

Edit `apps/web/src/components/layout/Header.tsx`:

```typescript
const socialLinks = [
  {
    name: 'Strava',
    url: 'https://www.strava.com/athletes/your-id',
    icon: StravaIcon,
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/your-handle',
    icon: InstagramIcon,
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/your-handle',
    icon: TwitterIcon,
  },
]
```

### Custom Footer Links

Edit `apps/web/src/components/layout/Footer.tsx`:

```typescript
const footerLinks = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Blog', href: 'https://your-blog.com' },
]
```

## Activity Display Preferences

### Default Activity Types

Edit `apps/web/src/lib/config/activityTypes.ts`:

```typescript
export const defaultActivityTypes = [
  'Run',
  'Walk', 
  'Hike',
  // Remove types you don't want to display
]
```

### Activity Icons and Colors

```typescript
export const activityConfig = {
  Run: {
    icon: '🏃‍♂️',
    color: '#FF6B6B',
    displayName: 'Running',
  },
  Walk: {
    icon: '🚶‍♂️', 
    color: '#4ECDC4',
    displayName: 'Walking',
  },
  // Add custom configurations
}
```

### Distance Units

Edit `apps/web/src/lib/utils/units.ts`:

```typescript
// Default: Metric (km, m/s)
export const useImperialUnits = false

// Imperial: Miles, mph
export const useImperialUnits = true
```

### Date Formats

```typescript
// US Format: MM/DD/YYYY
export const dateFormat = 'MM/dd/yyyy'

// European Format: DD/MM/YYYY  
export const dateFormat = 'dd/MM/yyyy'

// ISO Format: YYYY-MM-DD
export const dateFormat = 'yyyy-MM-dd'
```

## Custom Styling

### Color Scheme

Edit `apps/web/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // Add your custom colors
        brand: {
          50: '#fdf2f8',
          500: '#ec4899', 
          900: '#831843',
        }
      }
    }
  }
}
```

### Custom Fonts

1. **Add font files** to `apps/web/public/fonts/`
2. **Import in CSS**:
   ```css
   @font-face {
     font-family: 'CustomFont';
     src: url('/fonts/custom-font.woff2') format('woff2');
   }
   ```
3. **Configure in Tailwind**:
   ```javascript
   fontFamily: {
     'custom': ['CustomFont', 'sans-serif'],
   }
   ```

### Dashboard Layout

Edit `apps/web/src/app/dashboard/page.tsx`:

```typescript
// Customize grid layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Rearrange components */}
  <StatsOverview />
  <RecentActivities />
  <MonthlyChart />
</div>
```

### Chart Colors

Edit chart components in `apps/web/src/components/charts/`:

```typescript
const chartColors = {
  primary: '#3b82f6',
  secondary: '#10b981', 
  accent: '#f59e0b',
  // Your custom colors
}
```

## Advanced Customization

### Custom Pages

Create new pages in `apps/web/src/app/`:

```typescript
// apps/web/src/app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>About My Running Journey</h1>
      <p>Your personal story...</p>
    </div>
  )
}
```

### Custom Components

Create reusable components:

```typescript
// apps/web/src/components/custom/PersonalRecord.tsx
export function PersonalRecord({ title, value, date }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  )
}
```

### Custom Metrics

Add custom calculations:

```typescript
// apps/web/src/lib/utils/customMetrics.ts
export function calculateRunningStreak(activities) {
  // Your custom logic
  return streakDays
}

export function getPersonalBests(activities) {
  // Calculate PRs for different distances
  return personalBests
}
```

### Environment-Specific Customization

```typescript
// Different configs for different environments
const config = {
  development: {
    showDebugInfo: true,
    enableTestFeatures: true,
  },
  production: {
    showDebugInfo: false,
    enableTestFeatures: false,
  }
}
```

### Custom Activity Filters

```typescript
// apps/web/src/lib/utils/activityFilters.ts
export const customFilters = {
  thisWeek: (activities) => {
    // Filter activities from this week
  },
  longRuns: (activities) => {
    // Filter runs over certain distance
  },
  raceEvents: (activities) => {
    // Filter activities marked as races
  }
}
```

## Deployment and Testing

### Local Testing

```bash
cd apps/web
npm run dev
```

Visit `http://localhost:3000` to see your changes.

### Environment Variables Testing

Create `.env.local` for local testing:
```env
NEXT_PUBLIC_USER_NAME="Test User"
NEXT_PUBLIC_GITHUB_USERNAME="testuser"
NEXT_PUBLIC_USER_EMAIL="test@example.com"
```

### Deploy Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Personalize running page"
   git push origin main
   ```

2. **Vercel auto-deploys** from your repository

3. **Update environment variables** in Vercel dashboard if needed

## Examples and Inspiration

### Minimalist Style
- Clean typography
- Lots of white space
- Subtle colors
- Focus on data

### Athletic Theme
- Bold colors
- Sports imagery
- Performance-focused metrics
- Achievement highlights

### Personal Blog Style
- Story-telling elements
- Photo galleries
- Personal reflections
- Journey documentation

## 🎉 Make It Yours!

Your Running Page 2.0 should reflect your personality and running journey. Don't be afraid to:

- ✅ Experiment with colors and fonts
- ✅ Add personal touches and stories
- ✅ Customize metrics that matter to you
- ✅ Create unique visualizations
- ✅ Share your achievements proudly

---

**Next Steps:**
- [Customize themes and colors](Theme-Customization)
- [Add new features](Adding-Features)
- [Optimize performance](Performance-Tuning)
