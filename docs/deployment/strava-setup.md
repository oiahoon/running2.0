# Strava 集成配置指南

## 🏃‍♂️ Strava API 设置

### Step 1: 创建 Strava 应用

1. **登录 Strava**
   - 访问 [Strava 官网](https://www.strava.com/)
   - 登录你的 Strava 账户

2. **访问开发者页面**
   - 访问 [Strava Developers](https://developers.strava.com/)
   - 点击 "Create & Manage Your App"

3. **创建新应用**
   - 点击 "Create App" 或 "My API Application"
   - 填写应用信息：

```
Application Name: Running Page 2.0
Category: Data Importer
Club: (留空)
Website: https://your-app-name.vercel.app
Application Description: Personal running data visualization platform
Authorization Callback Domain: your-app-name.vercel.app
```

4. **获取应用凭据**
   创建成功后，你会看到：
   - **Client ID**: 一串数字（如：12345）
   - **Client Secret**: 一串字母数字组合

### Step 2: 配置回调 URL

确保在 Strava 应用设置中配置正确的回调域名：

**开发环境**:
```
Authorization Callback Domain: localhost
```

**生产环境**:
```
Authorization Callback Domain: your-app-name.vercel.app
```

### Step 3: 在 Vercel 中配置环境变量

在 Vercel Dashboard 的项目设置中添加以下环境变量：

#### 必需的 Strava 环境变量
```bash
# Strava API 凭据
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here

# 应用 URL（用于 OAuth 回调）
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

#### 可选的配置变量
```bash
# Strava API 配置
STRAVA_RATE_LIMIT_REQUESTS=100
STRAVA_RATE_LIMIT_DAILY=1000

# 同步配置
STRAVA_AUTO_SYNC=true
STRAVA_SYNC_FREQUENCY=daily
```

### Step 4: OAuth 授权流程

部署完成后，用户可以通过以下步骤连接 Strava：

1. **访问应用** - 打开你的 Running Page 2.0
2. **点击连接 Strava** - 在设置或同步页面
3. **Strava 授权** - 会跳转到 Strava 授权页面
4. **授权权限** - 确认授权以下权限：
   - `read` - 读取公开数据
   - `activity:read_all` - 读取所有活动数据
   - `profile:read_all` - 读取完整个人资料

5. **完成授权** - 授权后会跳转回你的应用

### Step 5: 测试 Strava 集成

#### 本地测试
```bash
# 在本地 .env.local 中添加
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000/api/auth/strava 测试授权
```

#### 生产环境测试
1. 部署到 Vercel 后访问你的应用
2. 尝试连接 Strava 账户
3. 检查是否能成功获取活动数据

## 🔧 高级配置

### 权限范围说明

Strava API 提供不同的权限范围：

```javascript
const scopes = [
  'read',                    // 读取公开数据
  'read_all',               // 读取所有数据（包括私有）
  'profile:read_all',       // 读取完整个人资料
  'profile:write',          // 修改个人资料
  'activity:read',          // 读取公开活动
  'activity:read_all',      // 读取所有活动
  'activity:write'          // 创建/修改活动
];
```

**推荐配置**（用于数据可视化）：
```javascript
const recommendedScopes = [
  'read',
  'activity:read_all',
  'profile:read_all'
];
```

### 数据同步策略

#### 1. 手动同步
用户点击按钮手动触发同步

#### 2. 定时同步
使用 Vercel Cron Jobs（需要 Pro 计划）：

```javascript
// vercel.json
{
  "crons": [
    {
      "path": "/api/sync/strava",
      "schedule": "0 6 * * *"
    }
  ]
}
```

#### 3. Webhook 同步（推荐）
配置 Strava Webhook 实时接收数据更新：

```javascript
// Webhook 端点: /api/webhooks/strava
// 在 Strava 应用设置中配置:
// Callback URL: https://your-app.vercel.app/api/webhooks/strava
```

### 错误处理

#### 常见错误和解决方案

1. **授权失败**
   ```
   错误: invalid_client
   解决: 检查 Client ID 和 Client Secret 是否正确
   ```

2. **回调域名错误**
   ```
   错误: redirect_uri_mismatch
   解决: 确保 Strava 应用中的回调域名与实际域名匹配
   ```

3. **权限不足**
   ```
   错误: insufficient_scope
   解决: 重新授权并确保请求了正确的权限范围
   ```

4. **API 限制**
   ```
   错误: rate_limit_exceeded
   解决: 实现适当的速率限制和重试机制
   ```

### 监控和日志

#### 同步日志
应用会记录所有同步活动：
- 同步开始/结束时间
- 处理的活动数量
- 错误信息和重试次数
- API 调用统计

#### 监控指标
- 同步成功率
- API 响应时间
- 数据更新频率
- 用户活跃度

## 🔐 安全最佳实践

### 1. 环境变量安全
- 永远不要在代码中硬编码 API 密钥
- 使用 Vercel 环境变量管理敏感信息
- 定期轮换 API 密钥

### 2. 数据隐私
- 遵守 Strava API 使用条款
- 实现适当的数据保留策略
- 提供用户数据删除选项

### 3. API 使用限制
- 遵守 Strava API 速率限制
- 实现指数退避重试策略
- 缓存数据以减少 API 调用

## 📊 部署检查清单

### Strava 应用配置
- [ ] Strava 应用已创建
- [ ] 回调域名已正确配置
- [ ] Client ID 和 Client Secret 已获取

### Vercel 环境变量
- [ ] `STRAVA_CLIENT_ID` 已设置
- [ ] `STRAVA_CLIENT_SECRET` 已设置
- [ ] `NEXT_PUBLIC_APP_URL` 已设置为正确的域名

### 功能测试
- [ ] OAuth 授权流程正常工作
- [ ] 能够成功获取用户数据
- [ ] 活动同步功能正常
- [ ] 错误处理机制有效

### 生产环境
- [ ] HTTPS 已启用
- [ ] 域名已正确配置
- [ ] 监控和日志已设置
- [ ] 备份策略已实施

完成这些配置后，你的用户就可以连接他们的 Strava 账户并自动同步跑步数据了！
