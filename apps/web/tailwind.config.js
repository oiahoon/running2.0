/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 保留原有的primary色彩
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // 赛博朋克霓虹色彩系统
        neonCyan: {
          50: '#ecfeff',
          100: '#cffafe', 
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',  // 主霓虹青
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          glow: '#22d3ee80', // 发光效果
        },
        neonPink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',  // 主霓虹粉
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          glow: '#ec489980',
        },
        neonGreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // 主霓虹绿
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          glow: '#22c55e80',
        },
        neonPurple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // 主霓虹紫
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          glow: '#a855f780',
        },
        neonOrange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // 主霓虹橙
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          glow: '#f9731680',
        },
        // 深色背景系统
        cyber: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
        display: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite alternate',
        'data-flow': 'dataFlow 3s infinite linear',
        'scan-line': 'scanLine 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'cyber-flicker': 'cyberFlicker 0.15s infinite linear alternate-reverse',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        neonPulse: {
          '0%': {
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor, 0 0 20px currentColor',
          },
          '100%': {
            textShadow: '0 0 2px currentColor, 0 0 5px currentColor, 0 0 8px currentColor, 0 0 12px currentColor',
          }
        },
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        glowPulse: {
          '0%': {
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
          },
          '100%': {
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
          }
        },
        cyberFlicker: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.98' }
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #22d3ee, 0 0 10px #22d3ee, 0 0 15px #22d3ee, 0 0 20px #22d3ee',
        'neon-pink': '0 0 5px #ec4899, 0 0 10px #ec4899, 0 0 15px #ec4899, 0 0 20px #ec4899',
        'neon-green': '0 0 5px #22c55e, 0 0 10px #22c55e, 0 0 15px #22c55e, 0 0 20px #22c55e',
        'neon-purple': '0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7, 0 0 20px #a855f7',
        'neon-orange': '0 0 5px #f97316, 0 0 10px #f97316, 0 0 15px #f97316, 0 0 20px #f97316',
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
        `,
        'scan-lines': `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(34, 211, 238, 0.03) 2px,
            rgba(34, 211, 238, 0.03) 4px
          )
        `,
        'data-stream': `
          linear-gradient(
            90deg,
            transparent,
            rgba(34, 211, 238, 0.2),
            transparent
          )
        `,
      },
      backgroundSize: {
        'grid': '20px 20px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
