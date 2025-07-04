# Strava API Setup Guide

## 1. 创建 Strava API 应用

1. 访问 [Strava API Settings](https://www.strava.com/settings/api)
2. 创建新的应用或使用现有应用
3. 记录以下信息：
   - **Client ID**: 你的应用 ID
   - **Client Secret**: 你的应用密钥

## 2. 获取 Refresh Token

### 方法一：使用授权码流程

1. 在浏览器中访问以下 URL（替换 YOUR_CLIENT_ID）：
```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all
```

2. 授权后，浏览器会重定向到类似这样的 URL：
```
http://localhost/?state=&code=AUTHORIZATION_CODE&scope=read,activity:read_all
```

3. 复制 `code=` 后面的授权码

4. 使用以下 curl 命令获取 refresh token（替换相应的值）：
```bash
curl -X POST https://www.strava.com/oauth/token \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F code=AUTHORIZATION_CODE \
  -F grant_type=authorization_code
```

5. 响应中的 `refresh_token` 就是你需要的值

### 方法二：使用现有的 refresh token

如果你已经有一个 Strava 应用的 refresh token，可以直接使用。

## 3. 配置 GitHub Secrets

在你的 GitHub 仓库中设置以下 secrets：

1. 访问 `https://github.com/oiahoon/running2.0/settings/secrets/actions`

2. 添加以下三个 secrets：
   - `STRAVA_CLIENT_ID`: 你的 Strava 应用 Client ID
   - `STRAVA_CLIENT_SECRET`: 你的 Strava 应用 Client Secret  
   - `STRAVA_REFRESH_TOKEN`: 从步骤2获取的 refresh token

## 4. 测试配置

配置完成后，你可以：

1. 手动触发 GitHub Actions 工作流
2. 检查工作流日志确认环境变量不再为空
3. 验证数据同步是否成功

## 5. 故障排除

### 常见问题：

1. **环境变量为空**
   - 检查 GitHub Secrets 是否正确设置
   - 确认 secret 名称完全匹配（区分大小写）

2. **授权失败**
   - 检查 Client ID 和 Client Secret 是否正确
   - 确认 refresh token 是否有效

3. **权限不足**
   - 确保授权时包含了 `activity:read_all` 权限
   - 检查 Strava 应用的权限设置

## 6. 安全注意事项

- 永远不要在代码中硬编码 API 密钥
- 定期轮换 refresh token
- 监控 API 使用情况，避免超出限制

## 7. API 限制

Strava API 有以下限制：
- 每15分钟最多100个请求
- 每天最多1000个请求
- 我们的同步脚本已经包含了适当的速率限制处理
