# Vercel 部署问题排查指南

## 🚨 自动部署未触发的常见原因

### 1. Git 集成问题
- Vercel 项目未正确连接到 GitHub 仓库
- 分支设置不正确（默认应该是 `master` 或 `main`）
- GitHub 权限不足

### 2. 项目配置问题
- 根目录设置错误
- 构建命令配置问题
- 环境变量缺失

### 3. 代码问题
- 构建错误导致部署失败
- 依赖安装问题

## 🔧 解决步骤

### Step 1: 检查 Git 集成
1. 在 Vercel Dashboard 中进入你的项目
2. 点击 "Settings" → "Git"
3. 确认：
   - Repository: `oiahoon/running2.0`
   - Production Branch: `master`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Root Directory: `apps/web`

### Step 2: 手动触发部署
1. 在 Vercel Dashboard 中点击 "Deployments"
2. 点击 "Create Deployment"
3. 选择 `master` 分支
4. 点击 "Deploy"

### Step 3: 检查构建日志
如果部署失败，查看构建日志中的错误信息

## 📋 快速检查清单
- [ ] GitHub 仓库连接正确
- [ ] 生产分支设置为 `master`
- [ ] 根目录设置为 `apps/web`
- [ ] 构建命令正确
- [ ] 环境变量已配置
