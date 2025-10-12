# GitHub Secrets 配置指南

本文档详细说明了为天气鸭项目配置GitHub Secrets的步骤，以确保CI/CD流程正常运行。

## 🔐 必需的 GitHub Secrets

### 1. Vercel 部署配置

#### VERCEL_TOKEN
- **用途**: Vercel API访问令牌
- **获取方式**:
  1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
  2. 点击右上角头像 → Settings
  3. 左侧菜单选择 "Tokens"
  4. 点击 "Create" 创建新令牌
  5. 输入令牌名称（如：`weather-duck-ci`）
  6. 选择作用域（推荐选择 "Full Account"）
  7. 复制生成的令牌

#### VERCEL_ORG_ID
- **用途**: Vercel组织ID
- **获取方式**:
  1. 在项目根目录运行: `npx vercel link`
  2. 按提示链接到Vercel项目
  3. 查看生成的 `.vercel/project.json` 文件
  4. 复制 `orgId` 字段的值

#### VERCEL_PROJECT_ID
- **用途**: Vercel项目ID
- **获取方式**:
  1. 同上述步骤，查看 `.vercel/project.json` 文件
  2. 复制 `projectId` 字段的值

### 2. 和风天气API配置

#### QWEATHER_API_KEY
- **用途**: 和风天气API密钥（用于Vercel环境变量）
- **获取方式**:
  1. 访问 [和风天气开发平台](https://dev.qweather.com/)
  2. 注册并登录账户
  3. 创建新应用
  4. 获取API Key
  5. 在Vercel项目设置中添加环境变量

## 🚀 配置步骤

### 步骤1: 在GitHub仓库中添加Secrets

1. 打开GitHub仓库页面
2. 点击 "Settings" 标签
3. 在左侧菜单中选择 "Secrets and variables" → "Actions"
4. 点击 "New repository secret"
5. 逐一添加以下Secrets:

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

### 步骤2: 在Vercel中配置环境变量

1. 登录Vercel Dashboard
2. 选择天气鸭项目
3. 进入 "Settings" → "Environment Variables"
4. 添加以下环境变量:

```
VITE_QWEATHER_API_KEY=your_qweather_api_key_here
VITE_APP_ENV=staging
VITE_ENABLE_PWA=true
```

### 步骤3: 验证配置

1. 推送代码到 `main` 分支
2. 检查GitHub Actions是否成功运行
3. 验证Vercel部署是否正常
4. 访问预览URL确认应用正常工作

## 🔧 可选配置

### Docker Hub 部署（可选）

如果需要Docker镜像部署，添加以下Secrets:

```
DOCKER_HUB_USERNAME=your_dockerhub_username
DOCKER_HUB_ACCESS_TOKEN=your_dockerhub_access_token
```

### 云服务器部署（可选）

如果需要部署到云服务器，添加以下Secrets:

```
SERVER_HOST=your_server_ip
SERVER_USERNAME=your_server_username
SERVER_SSH_KEY=your_private_ssh_key
```

### 通知配置（可选）

#### Slack通知
```
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

#### Discord通知
```
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

## 🛡️ 安全最佳实践

1. **定期轮换令牌**: 建议每3-6个月更新一次API令牌
2. **最小权限原则**: 只授予必要的权限
3. **监控使用情况**: 定期检查API使用量和访问日志
4. **备份配置**: 将配置信息安全地备份到密码管理器

## 🔍 故障排除

### 常见问题

1. **Vercel部署失败**
   - 检查VERCEL_TOKEN是否有效
   - 确认VERCEL_ORG_ID和VERCEL_PROJECT_ID正确
   - 验证Vercel项目是否存在

2. **API调用失败**
   - 检查QWEATHER_API_KEY是否正确
   - 确认API密钥配额是否充足
   - 验证API密钥权限设置

3. **环境变量未生效**
   - 确认变量名称拼写正确
   - 检查Vercel项目环境变量配置
   - 重新部署项目以应用新配置

### 调试命令

```bash
# 检查Vercel项目配置
npx vercel env ls

# 测试API连接
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v2/user

# 验证部署状态
npx vercel ls
```

## 📞 支持

如果在配置过程中遇到问题，请：

1. 检查GitHub Actions日志
2. 查看Vercel部署日志
3. 参考官方文档
4. 在项目Issues中提问

---

**注意**: 请妥善保管所有API密钥和令牌，不要在代码中硬编码敏感信息。