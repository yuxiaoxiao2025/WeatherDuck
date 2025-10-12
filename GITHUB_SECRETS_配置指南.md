# GitHub Secrets 配置指南

## 📋 概述

为了让天气鸭项目的预览环境持续部署正常工作，您需要在GitHub仓库中配置以下Secrets。这些敏感信息将用于自动部署流程。

## 🔑 必需的 GitHub Secrets

### 1. Vercel 部署相关

| Secret 名称 | 值 | 说明 |
|------------|----|----|
| `VERCEL_TOKEN` | `[需要获取]` | Vercel 个人访问令牌 |
| `VERCEL_ORG_ID` | `[需要获取]` | Vercel 组织 ID |
| `VERCEL_PROJECT_ID` | `[需要获取]` | Vercel 项目 ID |

### 2. 和风天气 API 相关

| Secret 名称 | 值 | 说明 |
|------------|----|----|
| `QWEATHER_API_KEY` | `6b95a713b2854ca0b5b62ac9d9cca3bb` | 和风天气 API 密钥 |
| `QWEATHER_API_HOST` | `https://nd2r6wuqd7.re.qweatherapi.com` | 和风天气 API 主机地址 |
| `QWEATHER_CREDENTIAL_ID` | `CGPNGJKBU6` | 和风天气凭据 ID |

## 🚀 配置步骤

### 步骤 1: 获取 Vercel 配置信息

#### 1.1 获取 Vercel Token
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击右上角头像 → Settings
3. 在左侧菜单选择 "Tokens"
4. 点击 "Create Token"
5. 输入 Token 名称（如：`weather-duck-deploy`）
6. 选择 Scope（推荐选择 "Full Account"）
7. 点击 "Create" 并复制生成的 Token

#### 1.2 获取 Organization ID
1. 在 Vercel Dashboard 中，点击左上角的团队/用户名
2. 选择 "Settings"
3. 在 "General" 标签页中找到 "Team ID" 或 "User ID"
4. 复制这个 ID（通常以 `team_` 或 `user_` 开头）

#### 1.3 获取 Project ID
1. 在 Vercel Dashboard 中找到 `weather-duck-preview` 项目
2. 点击项目进入详情页
3. 点击 "Settings" 标签
4. 在 "General" 部分找到 "Project ID"
5. 复制这个 ID

### 步骤 2: 在 GitHub 中配置 Secrets

#### 2.1 进入 GitHub 仓库设置
1. 打开您的 GitHub 仓库页面
2. 点击 "Settings" 标签
3. 在左侧菜单中选择 "Secrets and variables" → "Actions"

#### 2.2 添加 Repository Secrets
点击 "New repository secret" 按钮，逐一添加以下 Secrets：

**Vercel 相关：**
```
Name: VERCEL_TOKEN
Secret: [您在步骤1.1中获取的Token]
```

```
Name: VERCEL_ORG_ID
Secret: [您在步骤1.2中获取的Organization ID]
```

```
Name: VERCEL_PROJECT_ID
Secret: [您在步骤1.3中获取的Project ID]
```

**和风天气 API 相关：**
```
Name: QWEATHER_API_KEY
Secret: 6b95a713b2854ca0b5b62ac9d9cca3bb
```

```
Name: QWEATHER_API_HOST
Secret: https://nd2r6wuqd7.re.qweatherapi.com
```

```
Name: QWEATHER_CREDENTIAL_ID
Secret: CGPNGJKBU6
```

### 步骤 3: 在 Vercel 中配置环境变量

#### 3.1 登录 Vercel 并找到项目
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到 `weather-duck-preview` 项目并点击进入

#### 3.2 配置环境变量
1. 点击 "Settings" 标签
2. 在左侧菜单选择 "Environment Variables"
3. 添加以下环境变量：

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_QWEATHER_API_KEY` | `6b95a713b2854ca0b5b62ac9d9cca3bb` | Production, Preview, Development |
| `VITE_WEATHER_API_BASE_URL` | `https://nd2r6wuqd7.re.qweatherapi.com` | Production, Preview, Development |
| `VITE_QWEATHER_CREDENTIAL_ID` | `CGPNGJKBU6` | Production, Preview, Development |

## ✅ 验证配置

### 1. 检查 GitHub Secrets
在 GitHub 仓库的 Settings → Secrets and variables → Actions 页面，确认所有 6 个 Secrets 都已正确添加。

### 2. 测试部署流程
1. 对项目进行一个小的修改（如更新 README.md）
2. 提交并推送到 `main` 分支
3. 在 GitHub 的 "Actions" 标签页查看工作流执行情况
4. 如果成功，您将看到部署完成的通知

### 3. 访问预览环境
部署成功后，您可以通过以下地址访问预览环境：
- **主要地址**: https://weather-duck-preview.vercel.app
- **分支预览**: https://weather-duck-preview-git-main-[your-username].vercel.app

## 🔧 故障排除

### 常见问题

#### 1. Vercel 部署失败
- **检查**: Vercel Token 是否有效
- **解决**: 重新生成 Token 并更新 GitHub Secret

#### 2. API 调用失败
- **检查**: 和风天气 API 密钥是否正确
- **解决**: 确认 API 密钥和主机地址配置正确

#### 3. 环境变量未生效
- **检查**: Vercel 项目中的环境变量配置
- **解决**: 重新部署项目以应用新的环境变量

### 调试命令

在本地测试环境变量配置：
```bash
# 复制环境变量示例文件
cp .env.example .env.local

# 编辑 .env.local 文件，填入实际值
# 然后运行本地构建测试
npm run build:web-preview
npm run preview:web
```

## 📞 获取帮助

如果在配置过程中遇到问题，可以：

1. **查看 GitHub Actions 日志**: 在仓库的 Actions 标签页查看详细错误信息
2. **检查 Vercel 部署日志**: 在 Vercel Dashboard 的项目页面查看部署详情
3. **验证 API 配置**: 使用和风天气官方文档验证 API 配置

## 🎉 配置完成

配置完成后，每次推送代码到 `main` 或 `develop` 分支都会自动触发部署，项目创始人可以随时访问最新的预览版本！

---

**重要提醒**: 
- 请勿在公开的代码仓库中提交 API 密钥
- 定期检查和更新 API 密钥的安全性
- 监控 API 使用量，避免超出配额限制