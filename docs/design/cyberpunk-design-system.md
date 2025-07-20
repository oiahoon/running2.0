# Running Page 2.0 - Cyberpunk/Geek Design System

## 🎨 设计理念

### 核心概念
- **数字朋克美学**: 霓虹色彩 + 暗黑背景 + 科技感元素
- **极客文化**: 终端风格 + 代码美学 + 数据可视化
- **未来主义**: 流线型设计 + 发光效果 + 动态交互
- **运动科技**: 将跑步数据呈现为科幻界面

### 视觉特征
- **霓虹发光效果**: 关键元素使用霓虹色彩和发光边框
- **终端美学**: 等宽字体 + 绿色文本 + 扫描线效果
- **网格系统**: 科幻感的网格背景和分割线
- **数据流动**: 动态数据流和粒子效果

## 🌈 色彩系统

### 主色调 - 霓虹色彩
```typescript
const cyberpunkColors = {
  // 霓虹青色 (主色)
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
  
  // 霓虹粉色 (强调色)
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
  
  // 霓虹绿色 (成功/跑步)
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
  
  // 霓虹紫色 (数据可视化)
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
  
  // 霓虹橙色 (警告/热力)
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
  }
};
```

### 背景色系 - 深色赛博朋克
```typescript
const darkTheme = {
  // 主背景 - 深黑色
  background: {
    primary: '#0a0a0a',     // 最深背景
    secondary: '#111111',   // 卡片背景
    tertiary: '#1a1a1a',    // 悬浮背景
    elevated: '#222222',    // 高层级背景
  },
  
  // 文本色彩
  text: {
    primary: '#ffffff',     // 主文本 - 纯白
    secondary: '#e5e5e5',   // 次要文本
    muted: '#a3a3a3',       // 弱化文本
    accent: '#22d3ee',      // 强调文本 - 霓虹青
    terminal: '#00ff41',    // 终端绿色
  },
  
  // 边框和分割线
  border: {
    default: '#333333',     // 默认边框
    muted: '#2a2a2a',       // 弱化边框
    accent: '#22d3ee',      // 强调边框
    glow: '#22d3ee40',      // 发光边框
  }
};
```

## 🔤 字体系统

### 字体选择
```typescript
const cyberpunkFonts = {
  // 主字体 - 现代无衬线
  sans: [
    'JetBrains Sans',
    'Inter',
    'SF Pro Display',
    '-apple-system',
    'system-ui',
    'sans-serif'
  ],
  
  // 等宽字体 - 终端/代码风格
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'SF Mono',
    'Monaco',
    'Consolas',
    'monospace'
  ],
  
  // 显示字体 - 标题用
  display: [
    'Orbitron',           // 科幻感字体
    'Exo 2',              // 未来感字体
    'JetBrains Sans',
    'system-ui',
    'sans-serif'
  ]
};
```

### 字体大小和权重
```typescript
const typography = {
  // 终端风格的字体大小
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
  
  // 字体权重
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  }
};
```

## ✨ 视觉效果

### 发光效果
```css
/* 霓虹发光效果 */
.neon-glow {
  box-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 15px currentColor,
    0 0 20px currentColor;
}

.neon-text-glow {
  text-shadow:
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 15px currentColor,
    0 0 20px currentColor;
}

/* 脉冲动画 */
.neon-pulse {
  animation: neonPulse 2s ease-in-out infinite alternate;
}

@keyframes neonPulse {
  from {
    text-shadow:
      0 0 5px currentColor,
      0 0 10px currentColor,
      0 0 15px currentColor,
      0 0 20px currentColor;
  }
  to {
    text-shadow:
      0 0 2px currentColor,
      0 0 5px currentColor,
      0 0 8px currentColor,
      0 0 12px currentColor;
  }
}
```

### 网格背景
```css
/* 科幻网格背景 */
.cyber-grid {
  background-image: 
    linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 扫描线效果 */
.scan-lines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(34, 211, 238, 0.03) 2px,
    rgba(34, 211, 238, 0.03) 4px
  );
  pointer-events: none;
}
```

### 数据流动效果
```css
/* 数据流动动画 */
.data-stream {
  position: relative;
  overflow: hidden;
}

.data-stream::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 211, 238, 0.2),
    transparent
  );
  animation: dataFlow 3s infinite;
}

@keyframes dataFlow {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

## 🧩 组件设计

### 按钮组件
```typescript
const cyberpunkButtonVariants = {
  // 主要按钮 - 霓虹青色
  primary: `
    bg-transparent border-2 border-neonCyan-400 text-neonCyan-400
    hover:bg-neonCyan-400 hover:text-black hover:shadow-neon-cyan
    transition-all duration-300 font-mono uppercase tracking-wider
  `,
  
  // 次要按钮 - 霓虹粉色
  secondary: `
    bg-transparent border-2 border-neonPink-500 text-neonPink-500
    hover:bg-neonPink-500 hover:text-black hover:shadow-neon-pink
    transition-all duration-300 font-mono uppercase tracking-wider
  `,
  
  // 危险按钮 - 霓虹橙色
  danger: `
    bg-transparent border-2 border-neonOrange-500 text-neonOrange-500
    hover:bg-neonOrange-500 hover:text-black hover:shadow-neon-orange
    transition-all duration-300 font-mono uppercase tracking-wider
  `,
  
  // 幽灵按钮
  ghost: `
    bg-transparent text-white hover:text-neonCyan-400
    hover:shadow-neon-cyan transition-all duration-300
    font-mono uppercase tracking-wider
  `
};
```

### 卡片组件
```typescript
const cyberpunkCardVariants = {
  // 默认卡片
  default: `
    bg-background-secondary border border-border-default
    backdrop-blur-sm relative overflow-hidden
    before:absolute before:inset-0 before:bg-cyber-grid
  `,
  
  // 发光卡片
  glowing: `
    bg-background-secondary border-2 border-neonCyan-400
    shadow-neon-cyan backdrop-blur-sm relative overflow-hidden
    before:absolute before:inset-0 before:bg-cyber-grid
  `,
  
  // 终端风格卡片
  terminal: `
    bg-black border-2 border-neonGreen-500 text-neonGreen-500
    font-mono shadow-neon-green relative overflow-hidden
    before:absolute before:inset-0 before:bg-scan-lines
  `
};
```

## 📊 数据可视化风格

### 图表配色
```typescript
const cyberpunkChartColors = {
  // 主要数据系列
  primary: [
    '#22d3ee', // 霓虹青
    '#ec4899', // 霓虹粉
    '#22c55e', // 霓虹绿
    '#a855f7', // 霓虹紫
    '#f97316', // 霓虹橙
  ],
  
  // 渐变色
  gradients: {
    distance: 'from-neonCyan-400 via-neonPurple-500 to-neonPink-500',
    pace: 'from-neonGreen-400 to-neonCyan-400',
    elevation: 'from-neonOrange-400 to-neonPink-500',
    heartRate: 'from-neonPink-500 to-neonOrange-500',
  },
  
  // 地图颜色
  map: {
    route: '#22c55e',        // 霓虹绿路线
    routeGlow: '#22c55e80',  // 路线发光
    startMarker: '#22d3ee',  // 霓虹青起点
    endMarker: '#ec4899',    // 霓虹粉终点
    heatmap: ['#22c55e', '#f97316', '#ec4899'], // 热力图
  }
};
```

### 图表样式
```css
/* 图表容器 */
.cyber-chart {
  background: linear-gradient(135deg, #0a0a0a 0%, #111111 100%);
  border: 1px solid #333333;
  position: relative;
}

.cyber-chart::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

/* 图表标题 */
.cyber-chart-title {
  font-family: 'Orbitron', monospace;
  color: #22d3ee;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 0 10px currentColor;
}
```

## 🎭 动画系统

### 页面转场
```typescript
const cyberpunkAnimations = {
  // 页面淡入
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  },
  
  // 卡片悬浮
  cardHover: {
    whileHover: { 
      scale: 1.02,
      boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)',
      transition: { duration: 0.3 }
    }
  },
  
  // 数据加载
  dataLoad: {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: 1, ease: 'easeInOut' }
  },
  
  // 霓虹脉冲
  neonPulse: {
    animate: {
      textShadow: [
        '0 0 5px currentColor, 0 0 10px currentColor',
        '0 0 10px currentColor, 0 0 20px currentColor',
        '0 0 5px currentColor, 0 0 10px currentColor'
      ]
    },
    transition: { duration: 2, repeat: Infinity }
  }
};
```

## 📱 响应式设计

### 移动端适配
- **触摸优化**: 增大触摸目标，优化手势操作
- **性能优化**: 减少移动端的发光效果，保持性能
- **布局调整**: 垂直布局，简化复杂的网格系统

### 断点系统
```typescript
const cyberpunkBreakpoints = {
  sm: '640px',   // 手机横屏
  md: '768px',   // 平板
  lg: '1024px',  // 笔记本
  xl: '1280px',  // 桌面
  '2xl': '1536px', // 大屏幕
  '4k': '2560px',  // 4K显示器
};
```

## 🎯 实现优先级

### Phase 1: 基础风格改造
1. 色彩系统更新
2. 字体系统升级
3. 基础组件重设计
4. 背景和网格效果

### Phase 2: 交互增强
1. 发光效果实现
2. 动画系统集成
3. 悬浮和点击反馈
4. 页面转场效果

### Phase 3: 数据可视化
1. 图表重新设计
2. 地图样式更新
3. 数据流动效果
4. 实时数据展示

### Phase 4: 细节优化
1. 性能优化
2. 移动端适配
3. 可访问性保证
4. 浏览器兼容性

这个设计系统将把Running Page 2.0转变为一个充满科技感和未来感的跑步数据可视化平台，完美融合Geek文化和赛博朋克美学。
