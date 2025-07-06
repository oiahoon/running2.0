# 启用GitHub Pages - 详细步骤

## 🎯 问题分析

当前问题：
- ❌ GitHub Pages未启用，所以看不到/homepage文件夹选项
- ❌ GitHub Actions需要Pages先启用才能正常工作
- ❌ 需要先手动启用Pages，然后才能配置文件夹

## 🚀 解决步骤

### 步骤1: 手动启用GitHub Pages

1. **访问仓库设置**
   ```
   https://github.com/oiahoon/running2.0/settings/pages
   ```

2. **首次启用Pages**
   - 如果看到"GitHub Pages is currently disabled"
   - 点击下面的任何一个选项来启用：
     - Source: "Deploy from a branch"
     - Branch: 选择 "master" 
     - Folder: 选择 "/ (root)" (暂时)
   - 点击 "Save"

3. **等待初始化**
   - GitHub会显示 "Your site is ready to be published at..."
   - 等待几分钟让Pages服务初始化

### 步骤2: 重新配置指向homepage文件夹

1. **再次访问Pages设置**
   ```
   https://github.com/oiahoon/running2.0/settings/pages
   ```

2. **现在应该能看到更多选项**
   - Source: "Deploy from a branch" 
   - Branch: "master"
   - Folder: 现在应该能看到 "/homepage" 选项了！
   - 选择 "/homepage"
   - 点击 "Save"

### 步骤3: 或者使用GitHub Actions部署

如果上面的方法还是不行，使用我们的foolproof工作流：

1. **访问Actions页面**
   ```
   https://github.com/oiahoon/running2.0/actions
   ```

2. **运行Foolproof部署**
   - 选择 "Deploy Homepage (Foolproof)" 工作流
   - 点击 "Run workflow"
   - 选择 "master" 分支
   - 点击绿色的 "Run workflow" 按钮

3. **等待部署完成**
   - 工作流会自动创建gh-pages分支
   - 部署完成后，GitHub Pages会自动启用

## 🔍 验证部署

部署成功后：

1. **检查Pages设置**
   - 应该显示: "Your site is published at https://oiahoon.github.io/running2.0/"
   - Source应该显示: "Deploy from a branch: gh-pages / (root)"

2. **访问网站**
   - 主页: https://oiahoon.github.io/running2.0/
   - 测试页: https://oiahoon.github.io/running2.0/test.html

3. **检查部署状态**
   - 访问: https://github.com/oiahoon/running2.0/deployments
   - 应该看到成功的部署记录

## 🐛 如果还是有问题

### 问题1: 仍然看不到/homepage选项
**解决方案**: 使用GitHub Actions部署，它会自动处理所有配置

### 问题2: Actions仍然报错
**解决方案**: 使用"Deploy Homepage (Foolproof)"工作流，它不依赖GitHub Pages API

### 问题3: 部署成功但网站不显示
**解决方案**: 
1. 等待5-10分钟
2. 清除浏览器缓存
3. 检查浏览器控制台是否有错误

## 📞 需要帮助？

如果以上步骤都不行：
1. 截图发送Pages设置页面
2. 截图发送Actions运行结果
3. 告诉我具体在哪一步遇到问题

---

**最简单的方法：直接运行 "Deploy Homepage (Foolproof)" 工作流！** 🚀
