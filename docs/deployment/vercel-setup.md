# Vercel 部署指南

## 🚀 部署步骤

### Step 1: 准备 Vercel 账户
1. 访问 [Vercel 官网](https://vercel.com/)
2. 使用 GitHub 账户登录（推荐）
3. 这样可以直接访问你的 GitHub 仓库

### Step 2: 导入项目
1. 在 Vercel Dashboard 点击 "New Project"
2. 选择你的 `running2.0` 仓库
3. Vercel 会自动检测到这是一个 Next.js 项目

### Step 3: 配置项目设置
在项目配置页面：

#### Build & Development Settings
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web` (重要！)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (默认)
- **Install Command**: `npm install`

#### Environment Variables
添加以下环境变量：

```bash
# 必需的环境变量
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# 数据库（生产环境使用不同路径）
DATABASE_PATH=/tmp/running_page_2.db

# Mapbox（可选，稍后添加）
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Strava（稍后配置）
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
```

### Step 4: 部署
1. 点击 "Deploy" 按钮
2. Vercel 会自动构建和部署你的应用
3. 部署完成后会得到一个 `.vercel.app` 域名

## 🔧 生产环境配置

### 数据库处理
由于 Vercel 是无服务器环境，我们需要调整数据库策略：

#### 选项 1: 使用 Vercel Postgres（推荐）
```bash
# 在 Vercel Dashboard 中添加 Postgres 数据库
# 会自动提供以下环境变量：
POSTGRES_URL=your_postgres_connection_string
```

#### 选项 2: 使用 PlanetScale（MySQL）
```bash
DATABASE_URL=your_planetscale_connection_string
```

#### 选项 3: 继续使用 SQLite（临时方案）
```bash
# SQLite 在 Vercel 上会在每次部署时重置
# 适合演示，不适合生产环境
DATABASE_PATH=/tmp/running_page_2.db
```

### 自定义域名（可选）
1. 在项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照指示配置 DNS 记录

## 📊 监控和分析

### Vercel Analytics
1. 在项目设置中启用 "Analytics"
2. 可以看到页面访问量、性能指标等

### 错误监控
Vercel 自动提供：
- 构建日志
- 运行时错误日志
- 性能监控

## 🔄 自动部署

### Git 集成
- 每次推送到 `master` 分支会自动部署到生产环境
- 每个 Pull Request 会创建预览部署
- 可以在 GitHub PR 中直接预览更改

### 部署钩子
可以设置 webhook 来触发重新部署：
```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/your-hook-id
```

## 🛠️ 故障排除

### 常见问题

#### 1. 构建失败
- 检查 `apps/web` 目录是否正确设置为根目录
- 确保所有依赖都在 `package.json` 中

#### 2. 数据库连接问题
- 检查环境变量是否正确设置
- 确保数据库路径在生产环境中可访问

#### 3. API 路由问题
- 确保 API 路由在 `apps/web/src/app/api/` 目录下
- 检查函数超时设置（默认 10 秒）

### 调试技巧
1. 查看 Vercel 构建日志
2. 使用 `vercel logs` 命令查看运行时日志
3. 在本地使用 `vercel dev` 测试

## 📈 性能优化

### 推荐设置
1. 启用 Edge Functions（如果需要）
2. 配置适当的缓存策略
3. 使用 Vercel Image Optimization
4. 启用 Vercel Speed Insights

## 🔐 安全配置

### 环境变量安全
- 敏感信息只在 Vercel Dashboard 中配置
- 不要在代码中硬编码密钥
- 使用不同的环境变量用于开发和生产

### CORS 配置
如果需要，在 `next.config.js` 中配置 CORS：
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
        ],
      },
    ]
  },
}
```

## 📝 部署检查清单

- [ ] GitHub 仓库已推送最新代码
- [ ] Vercel 项目已创建并连接到仓库
- [ ] 根目录设置为 `apps/web`
- [ ] 环境变量已配置
- [ ] 首次部署成功
- [ ] 网站可以正常访问
- [ ] API 路由工作正常
- [ ] 数据库连接正常（如果适用）
- [ ] 自定义域名已配置（如果需要）

完成这些步骤后，你的 Running Page 2.0 就会在 Vercel 上运行了！
