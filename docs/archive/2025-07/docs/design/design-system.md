# Running Page 2.0 - Design System

## 🎨 Design Philosophy

### Core Principles
1. **Data-Driven**: Let the running data tell the story
2. **Minimalist**: Clean, focused interface without distractions
3. **Accessible**: WCAG 2.1 AA compliance for all users
4. **Performance-First**: Fast loading, smooth interactions
5. **Mobile-First**: Responsive design for all devices

### Visual Identity
- **Modern Athletic**: Clean lines, dynamic elements
- **Data Visualization Focus**: Charts and maps as primary elements
- **Dark Theme Preference**: Better for data visualization, less eye strain
- **Vibrant Accents**: Use color to highlight achievements and progress

## 🎯 Color System

### Primary Palette
```typescript
const colors = {
  // Brand Colors
  primary: {
    50: '#f0f9ff',   // Very light blue
    100: '#e0f2fe',  // Light blue
    200: '#bae6fd',  // Lighter blue
    300: '#7dd3fc',  // Light blue
    400: '#38bdf8',  // Medium blue
    500: '#0ea5e9',  // Primary blue
    600: '#0284c7',  // Darker blue
    700: '#0369a1',  // Dark blue
    800: '#075985',  // Very dark blue
    900: '#0c4a6e',  // Darkest blue
  },
  
  // Success/Running Colors
  success: {
    50: '#f0fdf4',   // Very light green
    100: '#dcfce7',  // Light green
    200: '#bbf7d0',  // Lighter green
    300: '#86efac',  // Light green
    400: '#4ade80',  // Medium green
    500: '#22c55e',  // Primary green
    600: '#16a34a',  // Darker green
    700: '#15803d',  // Dark green
    800: '#166534',  // Very dark green
    900: '#14532d',  // Darkest green
  },
  
  // Warning/Caution Colors
  warning: {
    50: '#fffbeb',   // Very light yellow
    100: '#fef3c7',  // Light yellow
    200: '#fde68a',  // Lighter yellow
    300: '#fcd34d',  // Light yellow
    400: '#fbbf24',  // Medium yellow
    500: '#f59e0b',  // Primary yellow
    600: '#d97706',  // Darker yellow
    700: '#b45309',  // Dark yellow
    800: '#92400e',  // Very dark yellow
    900: '#78350f',  // Darkest yellow
  },
  
  // Error Colors
  error: {
    50: '#fef2f2',   // Very light red
    100: '#fee2e2',  // Light red
    200: '#fecaca',  // Lighter red
    300: '#fca5a5',  // Light red
    400: '#f87171',  // Medium red
    500: '#ef4444',  // Primary red
    600: '#dc2626',  // Darker red
    700: '#b91c1c',  // Dark red
    800: '#991b1b',  // Very dark red
    900: '#7f1d1d',  // Darkest red
  },
  
  // Neutral Colors (Dark Theme)
  neutral: {
    50: '#fafafa',   // Almost white
    100: '#f5f5f5',  // Very light gray
    200: '#e5e5e5',  // Light gray
    300: '#d4d4d4',  // Lighter gray
    400: '#a3a3a3',  // Medium gray
    500: '#737373',  // Gray
    600: '#525252',  // Darker gray
    700: '#404040',  // Dark gray
    800: '#262626',  // Very dark gray
    900: '#171717',  // Almost black
    950: '#0a0a0a',  // Darkest
  }
};
```

### Semantic Colors
```typescript
const semanticColors = {
  background: {
    primary: 'neutral.950',    // Main background
    secondary: 'neutral.900',  // Card backgrounds
    tertiary: 'neutral.800',   // Elevated surfaces
  },
  text: {
    primary: 'neutral.50',     // Main text
    secondary: 'neutral.300',  // Secondary text
    muted: 'neutral.500',      // Muted text
  },
  border: {
    default: 'neutral.800',    // Default borders
    muted: 'neutral.700',      // Subtle borders
  },
  accent: {
    running: 'success.500',    // Running activities
    cycling: 'primary.500',    // Cycling activities
    swimming: 'primary.400',   // Swimming activities
    walking: 'warning.500',    // Walking activities
  }
};
```

## 📝 Typography

### Font Stack
```typescript
const fonts = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ],
  mono: [
    'JetBrains Mono',
    'SF Mono',
    'Monaco',
    'Inconsolata',
    'Roboto Mono',
    'monospace'
  ],
  display: [
    'Cal Sans',
    'Inter',
    'system-ui',
    'sans-serif'
  ]
};
```

### Type Scale
```typescript
const typography = {
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  }
};
```

## 🧩 Component System

### Button Variants
```typescript
const buttonVariants = {
  // Primary actions
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  
  // Secondary actions
  secondary: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100',
  
  // Destructive actions
  destructive: 'bg-error-500 hover:bg-error-600 text-white',
  
  // Ghost buttons
  ghost: 'hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100',
  
  // Link style
  link: 'text-primary-400 hover:text-primary-300 underline-offset-4 hover:underline',
};

const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  default: 'h-10 px-4 py-2',
  lg: 'h-12 px-8 text-lg',
  icon: 'h-10 w-10',
};
```

### Card Components
```typescript
const cardVariants = {
  default: 'bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm',
  elevated: 'bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg',
  interactive: 'bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm hover:border-neutral-700 transition-colors',
};
```

## 📊 Data Visualization Guidelines

### Chart Colors
```typescript
const chartColors = {
  // Primary data series
  primary: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
  
  // Gradient overlays
  gradients: {
    distance: 'from-primary-500 to-primary-600',
    pace: 'from-success-500 to-success-600',
    elevation: 'from-warning-500 to-warning-600',
    heartRate: 'from-error-500 to-error-600',
  },
  
  // Map colors
  map: {
    route: '#22c55e',        // Running route color
    routeHover: '#16a34a',   // Hovered route
    startMarker: '#0ea5e9',  // Start point
    endMarker: '#ef4444',    // End point
    heatmap: ['#22c55e', '#f59e0b', '#ef4444'], // Heat intensity
  }
};
```

### Animation Guidelines
```typescript
const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Common animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  }
};
```

## 📱 Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
};
```

### Layout Guidelines
- **Mobile First**: Design for mobile, enhance for larger screens
- **Touch Targets**: Minimum 44px for interactive elements
- **Content Width**: Max 1200px for optimal reading
- **Spacing**: Consistent 8px grid system

## 🎯 Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Motion**: Respect prefers-reduced-motion settings

### Implementation
```typescript
const a11y = {
  // Focus styles
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900',
  
  // Screen reader only text
  srOnly: 'sr-only',
  
  // Skip links
  skipLink: 'absolute left-[-10000px] top-auto w-1 h-1 overflow-hidden focus:left-6 focus:top-7 focus:w-auto focus:h-auto focus:overflow-visible',
};
```

This design system provides a comprehensive foundation for building a modern, accessible, and visually appealing running data visualization platform.
