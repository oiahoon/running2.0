# Theme Customization Guide 🎨

Complete guide to customizing colors, fonts, layouts, and visual styling of your Running Page 2.0.

## 📋 Table of Contents

- [Understanding the Theme System](#understanding-the-theme-system)
- [Color Customization](#color-customization)
- [Typography and Fonts](#typography-and-fonts)
- [Dark/Light Mode](#darklight-mode)
- [Layout Customization](#layout-customization)
- [Component Styling](#component-styling)
- [Chart Themes](#chart-themes)
- [Pre-built Themes](#pre-built-themes)

## Understanding the Theme System

Running Page 2.0 uses:
- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for theme variables
- **Catalyst UI** for component consistency
- **Automatic dark/light mode** detection

### File Structure
```
apps/web/src/
├── styles/
│   ├── globals.css          # Global styles and CSS variables
│   └── components.css       # Component-specific styles
├── components/
│   └── ui/                  # Reusable UI components
└── tailwind.config.js       # Tailwind configuration
```

## Color Customization

### Primary Color Scheme

Edit `apps/web/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your brand colors
        primary: {
          50: '#eff6ff',   // Lightest
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Main color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',  // Darkest
        },
        
        // Secondary colors
        secondary: {
          50: '#f0fdf4',
          500: '#10b981',
          900: '#064e3b',
        },
        
        // Accent colors
        accent: {
          50: '#fffbeb',
          500: '#f59e0b',
          900: '#78350f',
        }
      }
    }
  }
}
```

### Activity Type Colors

Edit `apps/web/src/lib/config/activityTypes.ts`:

```typescript
export const activityColors = {
  Run: {
    light: '#ef4444',    // Red
    dark: '#f87171',
    bg: '#fef2f2',
  },
  Walk: {
    light: '#10b981',    // Green
    dark: '#34d399', 
    bg: '#f0fdf4',
  },
  Ride: {
    light: '#3b82f6',    // Blue
    dark: '#60a5fa',
    bg: '#eff6ff',
  },
  Swim: {
    light: '#06b6d4',    // Cyan
    dark: '#22d3ee',
    bg: '#ecfeff',
  },
  Hike: {
    light: '#84cc16',    // Lime
    dark: '#a3e635',
    bg: '#f7fee7',
  }
}
```

### CSS Custom Properties

Edit `apps/web/src/styles/globals.css`:

```css
:root {
  /* Light mode colors */
  --color-primary: 59 130 246;      /* RGB values */
  --color-secondary: 16 185 129;
  --color-accent: 245 158 11;
  
  /* Background colors */
  --color-background: 255 255 255;
  --color-surface: 249 250 251;
  
  /* Text colors */
  --color-text-primary: 17 24 39;
  --color-text-secondary: 107 114 128;
  
  /* Border colors */
  --color-border: 229 231 235;
}

[data-theme="dark"] {
  /* Dark mode colors */
  --color-primary: 96 165 250;
  --color-secondary: 52 211 153;
  --color-accent: 251 191 36;
  
  /* Background colors */
  --color-background: 17 24 39;
  --color-surface: 31 41 55;
  
  /* Text colors */
  --color-text-primary: 243 244 246;
  --color-text-secondary: 156 163 175;
  
  /* Border colors */
  --color-border: 75 85 99;
}
```

## Typography and Fonts

### System Fonts (Default)

The default configuration uses system fonts for optimal performance:

```javascript
// tailwind.config.js
fontFamily: {
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  mono: [
    'SFMono-Regular',
    'Monaco',
    'Consolas',
    'monospace',
  ],
}
```

### Custom Web Fonts

#### Option 1: Google Fonts

1. **Add to `apps/web/src/app/layout.tsx`**:
```typescript
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})
```

2. **Configure Tailwind**:
```javascript
fontFamily: {
  sans: ['var(--font-inter)', 'sans-serif'],
  mono: ['var(--font-roboto-mono)', 'monospace'],
}
```

#### Option 2: Self-Hosted Fonts

1. **Add fonts to `apps/web/public/fonts/`**
2. **Define in CSS**:
```css
@font-face {
  font-family: 'CustomSans';
  src: url('/fonts/custom-sans.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

3. **Configure Tailwind**:
```javascript
fontFamily: {
  'custom': ['CustomSans', 'sans-serif'],
}
```

### Typography Scale

```javascript
// tailwind.config.js
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'base': ['1rem', { lineHeight: '1.5rem' }],
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '5xl': ['3rem', { lineHeight: '1' }],
  '6xl': ['3.75rem', { lineHeight: '1' }],
}
```

## Dark/Light Mode

### Automatic Detection

The system automatically detects user preference:

```typescript
// apps/web/src/components/ThemeProvider.tsx
'use client'

import { useEffect, useState } from 'react'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system')
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setTheme(mediaQuery.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    handleChange()
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return (
    <div data-theme={theme}>
      {children}
    </div>
  )
}
```

### Manual Theme Toggle

```typescript
// apps/web/src/components/ThemeToggle.tsx
export function ThemeToggle() {
  const [theme, setTheme] = useState('system')
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

### Dark Mode Styles

Use Tailwind's dark mode utilities:

```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 className="text-blue-600 dark:text-blue-400">Title</h1>
  <p className="text-gray-600 dark:text-gray-300">Content</p>
</div>
```

## Layout Customization

### Container Widths

```javascript
// tailwind.config.js
container: {
  center: true,
  padding: {
    DEFAULT: '1rem',
    sm: '2rem',
    lg: '4rem',
    xl: '5rem',
    '2xl': '6rem',
  },
  screens: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },
}
```

### Grid Layouts

```jsx
// Dashboard layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <StatsCard />
  <ActivityChart />
  <RecentActivities />
</div>

// Activities list
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {activities.map(activity => (
    <ActivityCard key={activity.id} activity={activity} />
  ))}
</div>
```

### Responsive Breakpoints

```javascript
// tailwind.config.js
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
}
```

## Component Styling

### Card Components

```jsx
// Base card style
const cardClasses = `
  bg-white dark:bg-gray-800 
  border border-gray-200 dark:border-gray-700
  rounded-lg shadow-sm hover:shadow-md
  transition-shadow duration-200
  p-6
`

// Usage
<div className={cardClasses}>
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600 dark:text-gray-300">Card content</p>
</div>
```

### Button Variants

```jsx
const buttonVariants = {
  primary: `
    bg-blue-600 hover:bg-blue-700 
    text-white font-medium
    px-4 py-2 rounded-md
    transition-colors duration-200
  `,
  secondary: `
    bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
    text-gray-900 dark:text-gray-100
    px-4 py-2 rounded-md
    transition-colors duration-200
  `,
  outline: `
    border border-gray-300 dark:border-gray-600
    hover:bg-gray-50 dark:hover:bg-gray-800
    text-gray-700 dark:text-gray-300
    px-4 py-2 rounded-md
    transition-colors duration-200
  `
}
```

### Form Elements

```jsx
const inputClasses = `
  w-full px-3 py-2
  border border-gray-300 dark:border-gray-600
  rounded-md shadow-sm
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  placeholder-gray-500 dark:placeholder-gray-400
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  transition-colors duration-200
`
```

## Chart Themes

### Recharts Customization

```typescript
// apps/web/src/components/charts/ChartTheme.ts
export const chartTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    success: '#22c55e',
    warning: '#f97316',
    error: '#ef4444',
  },
  
  grid: {
    stroke: '#e5e7eb',
    strokeDasharray: '3 3',
  },
  
  axis: {
    stroke: '#6b7280',
    fontSize: 12,
    fontFamily: 'system-ui',
  },
  
  tooltip: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  }
}

// Dark mode overrides
export const darkChartTheme = {
  ...chartTheme,
  grid: {
    stroke: '#374151',
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: '#9ca3af',
    fontSize: 12,
    fontFamily: 'system-ui',
  },
  tooltip: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  }
}
```

### Chart Color Palettes

```typescript
export const chartPalettes = {
  default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  pastel: ['#fecaca', '#fed7d7', '#fef3c7', '#d1fae5', '#ddd6fe'],
  vibrant: ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb'],
  monochrome: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db'],
}
```

## Pre-built Themes

### Athletic Theme

```javascript
// tailwind.config.js - Athletic theme
const athleticTheme = {
  colors: {
    primary: {
      500: '#dc2626', // Red
    },
    secondary: {
      500: '#1f2937', // Dark gray
    },
    accent: {
      500: '#fbbf24', // Gold
    }
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    display: ['Oswald', 'sans-serif'],
  }
}
```

### Minimalist Theme

```javascript
const minimalistTheme = {
  colors: {
    primary: {
      500: '#000000', // Black
    },
    secondary: {
      500: '#6b7280', // Gray
    },
    accent: {
      500: '#3b82f6', // Blue
    }
  },
  fontFamily: {
    sans: ['system-ui', 'sans-serif'],
  },
  spacing: {
    // Increased spacing for minimalist feel
    section: '4rem',
    card: '2rem',
  }
}
```

### Nature Theme

```javascript
const natureTheme = {
  colors: {
    primary: {
      500: '#059669', // Green
    },
    secondary: {
      500: '#92400e', // Brown
    },
    accent: {
      500: '#0891b2', // Teal
    }
  },
  backgroundImage: {
    'hero-pattern': "url('/images/nature-bg.jpg')",
  }
}
```

## Implementation Examples

### Complete Theme Switch

```typescript
// apps/web/src/lib/themes.ts
export const themes = {
  default: {
    name: 'Default',
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
    }
  },
  athletic: {
    name: 'Athletic',
    colors: {
      primary: '#dc2626',
      secondary: '#1f2937', 
      accent: '#fbbf24',
    }
  },
  minimalist: {
    name: 'Minimalist',
    colors: {
      primary: '#000000',
      secondary: '#6b7280',
      accent: '#3b82f6',
    }
  }
}

// Theme context
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState('default')
  
  const applyTheme = (themeName: string) => {
    const theme = themes[themeName]
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value)
      })
      setCurrentTheme(themeName)
    }
  }
  
  return { currentTheme, applyTheme, themes }
}
```

### Theme Selector Component

```jsx
export function ThemeSelector() {
  const { currentTheme, applyTheme, themes } = useTheme()
  
  return (
    <div className="flex gap-2">
      {Object.entries(themes).map(([key, theme]) => (
        <button
          key={key}
          onClick={() => applyTheme(key)}
          className={`
            px-3 py-2 rounded-md text-sm font-medium
            ${currentTheme === key 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {theme.name}
        </button>
      ))}
    </div>
  )
}
```

## 🎨 Create Your Unique Style!

Your Running Page 2.0 should reflect your personality. Experiment with:

- ✅ **Color combinations** that inspire you
- ✅ **Typography** that matches your style
- ✅ **Layouts** that showcase your data best
- ✅ **Themes** that motivate your running journey

---

**Next Steps:**
- [Add custom features](Adding-Features)
- [Optimize performance](Performance-Tuning)
- [Explore advanced customization](Custom-Integrations)
