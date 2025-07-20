# 手动Wiki同步指南 📚

由于GitHub在2021年8月移除了密码认证支持，自动Wiki同步需要SSH密钥配置。以下是手动同步Wiki的几种方法：

## 🔧 方法1: GitHub Web界面 (推荐)

### 步骤：
1. **访问Wiki页面**
   ```
   https://github.com/oiahoon/running2.0/wiki
   ```

2. **创建/编辑页面**
   - 点击 "Create the first page" 或 "New Page"
   - 或点击现有页面的 "Edit" 按钮

3. **复制内容**
   从本地文件复制内容到GitHub Wiki编辑器：
   
   **Home页面** (`wiki/Home.md`):
   - 在GitHub Wiki中创建 "Home" 页面
   - 复制 `wiki/Home.md` 的全部内容
   
   **Installation Guide** (`wiki/Installation-Guide.md`):
   - 创建 "Installation Guide" 页面
   - 复制对应文件内容
   
   **Cyberpunk Theme** (`wiki/Cyberpunk-Theme.md`):
   - 创建 "Cyberpunk Theme" 页面
   - 复制对应文件内容
   
   **API Reference** (`wiki/API-Reference.md`):
   - 创建 "API Reference" 页面
   - 复制对应文件内容

4. **保存页面**
   - 添加提交信息
   - 点击 "Save Page"

## 🔧 方法2: GitHub CLI (如果已安装)

```bash
# 安装GitHub CLI (如果未安装)
brew install gh  # macOS
# 或 sudo apt install gh  # Ubuntu

# 认证
gh auth login

# 克隆Wiki仓库
gh repo clone oiahoon/running2.0.wiki

# 复制文件
cp wiki/*.md running2.0.wiki/

# 提交和推送
cd running2.0.wiki
git add .
git commit -m "📚 Update wiki documentation"
git push
```

## 🔧 方法3: SSH密钥配置 (高级用户)

### 配置SSH密钥：

1. **生成SSH密钥** (如果没有)
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. **添加到SSH Agent**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **添加到GitHub**
   ```bash
   # 复制公钥
   cat ~/.ssh/id_ed25519.pub
   
   # 访问 https://github.com/settings/keys
   # 点击 "New SSH key" 并粘贴公钥
   ```

4. **测试连接**
   ```bash
   ssh -T git@github.com
   ```

5. **运行同步脚本**
   ```bash
   ./scripts/sync-wiki.sh
   ```

## 📋 Wiki页面清单

需要同步的页面：

| 本地文件 | Wiki页面名称 | 状态 |
|---------|-------------|------|
| `wiki/Home.md` | Home | ⏳ 待同步 |
| `wiki/Installation-Guide.md` | Installation Guide | ⏳ 待同步 |
| `wiki/Cyberpunk-Theme.md` | Cyberpunk Theme | ⏳ 待同步 |
| `wiki/API-Reference.md` | API Reference | ⏳ 待同步 |

## 🎯 同步验证

同步完成后，验证以下页面可以正常访问：

- ✅ [Home](https://github.com/oiahoon/running2.0/wiki)
- ✅ [Installation Guide](https://github.com/oiahoon/running2.0/wiki/Installation-Guide)
- ✅ [Cyberpunk Theme](https://github.com/oiahoon/running2.0/wiki/Cyberpunk-Theme)
- ✅ [API Reference](https://github.com/oiahoon/running2.0/wiki/API-Reference)

## 💡 同步脚本状态

**当前状态**: ✅ 脚本已创建并测试
**认证问题**: ⚠️ 需要SSH密钥或手动同步
**文件检测**: ✅ 成功检测到4个Wiki文件
**内容准备**: ✅ 所有内容已准备就绪

## 🚀 推荐流程

**最简单的方法**：
1. 访问 https://github.com/oiahoon/running2.0/wiki
2. 点击 "Create the first page"
3. 页面标题设为 "Home"
4. 复制 `wiki/Home.md` 的内容
5. 保存页面
6. 重复步骤创建其他3个页面

**预计时间**: 10-15分钟
**难度**: ⭐⭐☆☆☆ (简单)

---

**需要帮助？** 可以通过以下方式获取支持：
- 📧 Email: 4296411@qq.com
- 🐛 Issues: https://github.com/oiahoon/running2.0/issues
- 💬 Discussions: https://github.com/oiahoon/running2.0/discussions
