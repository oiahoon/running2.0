# Tailwind UI 集成设置指南

## 🔐 访问 Tailwind UI

### 登录信息
- **网站**: https://tailwindui.com/
- **登录方式**: 使用购买 Tailwind CSS Plus 时的邮箱和密码
- **访问内容**: 500+ 专业组件和模板

## 📦 项目初始化

### Step 1: 创建 Next.js 项目
```bash
cd ~/Work/running_2.0
npx create-next-app@latest apps/web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Step 2: 安装 Tailwind UI 相关依赖
```bash
cd apps/web

# Headless UI - 无样式的可访问组件
npm install @headlessui/react

# Heroicons - 图标库
npm install @heroicons/react

# 实用工具
npm install clsx tailwind-merge class-variance-authority

# Tailwind CSS 插件
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
```

### Step 3: 配置 Tailwind CSS
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 启用暗色模式
  theme: {
    extend: {
      colors: {
        // 跑步应用的自定义颜色
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

## 🎨 从 Tailwind UI 获取组件

### 推荐的组件获取顺序

#### 1. Application Shell (应用外壳)
```
访问: https://tailwindui.com/components/application-ui/application-shells
推荐: "Sidebar with header" 或 "Brand sidebar with header"
用途: 主应用布局
```

#### 2. Stats (统计组件)
```
访问: https://tailwindui.com/components/application-ui/data-display/stats
推荐: "Simple cards" 或 "Cards with icon"
用途: Dashboard 统计卡片
```

#### 3. Lists (列表组件)
```
访问: https://tailwindui.com/components/application-ui/lists
推荐: "Grid lists" 或 "Feed"
用途: 活动列表展示
```

#### 4. Forms (表单组件)
```
访问: https://tailwindui.com/components/application-ui/forms
推荐: "Input groups" 和 "Select menus"
用途: 搜索和过滤功能
```

### 组件复制和使用流程

#### Step 1: 登录并选择组件
1. 登录 https://tailwindui.com/
2. 导航到需要的组件类别
3. 选择合适的组件设计

#### Step 2: 获取代码
1. 点击组件的 "View Code" 按钮
2. 选择 "React" 标签页
3. 复制完整的组件代码

#### Step 3: 集成到项目
```typescript
// 示例: 复制 Stats 组件
// src/components/dashboard/StatsGrid.tsx

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'

const stats = [
  { name: 'Total Distance', stat: '1,234 km', previousStat: '1,180 km', change: '12%', changeType: 'increase' },
  { name: 'Total Time', stat: '123h 45m', previousStat: '115h 30m', change: '8%', changeType: 'increase' },
  { name: 'Activities', stat: '156', previousStat: '135', change: '23%', changeType: 'increase' },
  { name: 'Avg Pace', stat: '5:32/km', previousStat: '5:45/km', change: '3%', changeType: 'decrease' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function StatsGrid() {
  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Running Statistics</h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{item.stat}</dd>
            <dd className="mt-1 flex items-baseline text-sm font-semibold">
              <span
                className={classNames(
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {item.change}
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">from last month</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
```

## 🔧 实用工具设置

### 创建工具函数
```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化函数
export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(1)} km`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function formatPace(metersPerSecond: number): string {
  const secondsPerKm = 1000 / metersPerSecond
  const minutes = Math.floor(secondsPerKm / 60)
  const seconds = Math.floor(secondsPerKm % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`
}
```

### 创建主题提供者
```typescript
// src/components/providers/ThemeProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'running-page-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
```

## 📋 组件获取清单

### 立即需要的组件 (Week 1)
- [ ] Application Shell (应用外壳)
- [ ] Navigation (导航菜单)
- [ ] Stats Cards (统计卡片)
- [ ] Button variants (按钮变体)

### 后续需要的组件 (Week 2-3)
- [ ] Lists (活动列表)
- [ ] Forms (搜索表单)
- [ ] Tables (数据表格)
- [ ] Modals (弹窗)
- [ ] Dropdowns (下拉菜单)

### 高级组件 (Week 4+)
- [ ] Slideovers (侧边栏)
- [ ] Notifications (通知)
- [ ] Pagination (分页)
- [ ] Tabs (标签页)

## 🚀 开始使用

### 今天就可以开始
1. **登录 Tailwind UI**: 使用你的账户信息
2. **浏览组件库**: 熟悉可用的组件
3. **初始化项目**: 运行上面的命令
4. **复制第一个组件**: 从 Application Shell 开始

### 无需额外配置
- ❌ 不需要 API 密钥
- ❌ 不需要特殊的 npm 配置
- ❌ 不需要额外的认证设置
- ✅ 只需要网站登录访问

你准备好登录 Tailwind UI 并开始复制组件了吗？
