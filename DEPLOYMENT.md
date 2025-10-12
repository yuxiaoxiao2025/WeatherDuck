# 天气鸭预览环境部署指南

本文档详细说明了天气鸭项目的预览环境部署配置和流程。

## 🚀 部署概览

天气鸭项目采用混合部署策略，支持多种部署方式：

- **Web预览版**: 部署到 Vercel（推荐）
- **桌面应用**: GitHub Actions 自动构建
- **容器化部署**: Docker + 云服务器（可选）

## 🚀 快速开始

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
```

详细配置步骤请参考 <mcfile name="GITHUB_SECRETS_SETUP.md" path="e:\trae\WeatherDuck\GITHUB_SECRETS_SETUP.md"></mcfile>

### 2. 配置环境变量

复制 <mcfile name=".env.example" path="e:\trae\WeatherDuck\.env.example"></mcfile> 为 `.env.local` 并配置：

```bash
# 和风天气API密钥
VITE_QWEATHER_API_KEY=your_api_key_here

# 应用环境
VITE_APP_ENV=staging
VITE_ENABLE_PWA=true
```

### 3. 推送代码触发部署

```bash
git push origin main
```

### 4. 查看部署结果

- 检查 GitHub Actions 运行状态
- 访问 Vercel 预览链接: `https://weather-duck-preview.vercel.app`
- 验证应用功能正常

### 5. 本地验证构建

```bash
# 安装依赖
npm install

# 构建Web预览版
npm run build:web-preview

# 本地预览
npm run preview:web
```

## 📋 GitHub Actions CI/CD

### 工作流触发条件
- 推送到 `main` 或 `develop` 分支
- 手动触发 (workflow_dispatch)

### 构建流程
1. **代码检查**: ESLint + TypeScript 类型检查
2. **测试执行**: 单元测试 + 集成测试
3. **Web构建**: 生成 `dist-web` 目录
4. **Vercel部署**: 自动部署到预览环境
5. **部署验证**: 自动检查部署状态
6. **桌面构建**: Windows应用打包（可选）
7. **Docker构建**: 容器镜像构建（可选）

### 最新优化
- ✅ 添加部署状态验证
- ✅ 改进错误处理和通知
- ✅ 优化构建缓存策略
- ✅ 增强安全配置

## 部署架构

### 1. 混合部署策略
- **Web预览版**: 部署到Vercel，提供在线预览功能
- **桌面应用**: 通过GitHub Actions自动构建多平台安装包
- **容器化部署**: 支持Docker部署到云服务器

### 2. 支持的部署平台
- ✅ **Vercel** (推荐) - Web预览版
- ✅ **GitHub Pages** - 静态站点托管
- ✅ **Netlify** - 备选Web托管
- ✅ **Docker** - 容器化部署
- ✅ **云服务器** - 自定义部署

## GitHub Secrets 配置

### 必需的 Secrets

在GitHub仓库的 `Settings > Secrets and variables > Actions` 中配置以下secrets：

#### Vercel 部署
```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

#### Docker Hub (可选)
```bash
DOCKER_HUB_USERNAME=your_dockerhub_username
DOCKER_HUB_ACCESS_TOKEN=your_dockerhub_access_token
```

#### 云服务器部署 (可选)
```bash
SERVER_HOST=your_server_ip_or_domain
SERVER_USERNAME=your_server_username
SERVER_SSH_KEY=your_private_ssh_key
SERVER_PORT=22
```

#### 通知配置 (可选)
```bash
SLACK_WEBHOOK_URL=your_slack_webhook_url
DISCORD_WEBHOOK_URL=your_discord_webhook_url
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 获取 Secrets 的方法

#### 1. Vercel Token
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入 `Settings > Tokens`
3. 创建新的Token，复制保存

#### 2. Vercel 项目信息
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并链接项目
vercel login
vercel link

# 获取项目信息
vercel env ls
```

#### 3. Docker Hub Token
1. 登录 [Docker Hub](https://hub.docker.com/)
2. 进入 `Account Settings > Security`
3. 创建新的Access Token

#### 4. SSH 密钥生成
```bash
# 生成SSH密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions@weatherduck.com"

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub user@server

# 将私钥内容复制到GitHub Secrets
cat ~/.ssh/id_rsa
```

## 环境变量配置

### 构建时环境变量

在 `.env.production` 文件中配置：

```bash
# 应用信息
VITE_APP_TITLE=天气鸭 Web 预览版
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=现代化的桌面天气应用预览版

# 构建配置
VITE_BUILD_TARGET=web-preview
VITE_PUBLIC_PATH=/

# API配置 (如果需要)
VITE_API_BASE_URL=https://api.weatherduck.com
VITE_WEATHER_API_KEY=your_weather_api_key

# 功能开关
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=true

# 第三方服务
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
```

### 运行时环境变量

Docker容器运行时环境变量：

```bash
# 基础配置
NODE_ENV=production
TZ=Asia/Shanghai
LANG=zh_CN.UTF-8

# 服务配置
PORT=80
HOST=0.0.0.0

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json
```

## 部署流程

### 1. 自动部署触发条件

- ✅ 推送到 `main` 分支
- ✅ 推送到 `develop` 分支
- ✅ 手动触发 (`workflow_dispatch`)
- ✅ 创建Release标签

### 2. 部署步骤

#### Web预览版部署 (Vercel)
1. 代码检出和环境准备
2. 依赖安装和缓存
3. 代码质量检查 (ESLint, Prettier)
4. 单元测试执行
5. Web版本构建
6. 构建产物上传
7. Vercel部署
8. 部署状态通知

#### 桌面应用构建

桌面应用使用 Electron 构建，专为Windows平台优化：

```bash
# 构建Windows桌面应用
npm run build:desktop

# 构建Windows特定版本
npm run build:desktop:win
```

1. Windows平台构建优化
2. Electron应用打包
3. 安装包生成和签名
4. GitHub Release发布
5. 下载链接更新

#### Docker镜像构建
1. 多架构镜像构建 (amd64, arm64)
2. 镜像推送到Docker Hub
3. 云服务器部署更新
4. 健康检查和回滚

### 3. 部署后验证

- ✅ 健康检查端点测试
- ✅ 核心功能验证
- ✅ 性能指标监控
- ✅ 错误日志检查

## 预览环境访问

### Web预览版
- **Vercel**: https://weather-duck-preview.vercel.app
- **GitHub Pages**: https://username.github.io/WeatherDuck
- **自定义域名**: https://preview.weatherduck.com

### 桌面应用下载
- **Windows**: [下载链接](https://github.com/username/WeatherDuck/releases/latest/download/WeatherDuck-Setup.exe)
- **macOS**: [下载链接](https://github.com/username/WeatherDuck/releases/latest/download/WeatherDuck.dmg)
- **Linux**: [下载链接](https://github.com/username/WeatherDuck/releases/latest/download/WeatherDuck.AppImage)

## 本地开发部署

### 1. Web预览版本地运行
```bash
# 安装依赖
npm install

# 启动Web开发服务器
npm run dev:web

# 构建Web预览版
npm run build:web-preview

# 预览构建结果
npm run preview:web
```

### 2. Docker本地部署
```bash
# 构建镜像
docker build -t weather-duck-web .

# 运行容器
docker run -p 3000:80 weather-duck-web

# 使用docker-compose
docker-compose up -d

# 开发环境
docker-compose --profile dev up -d
```

### 3. 完整开发环境
```bash
# 启动所有服务
docker-compose --profile dev --profile monitoring up -d

# 访问服务
# - 应用: http://localhost:3000
# - 监控: http://localhost:9090 (Prometheus)
# - 仪表板: http://localhost:3002 (Grafana)
```

## 故障排除

### 常见问题

#### 1. Vercel部署失败
```bash
# 检查构建日志
vercel logs

# 本地测试构建
npm run build:web-preview

# 检查vercel.json配置
vercel dev
```

#### 2. Docker构建失败
```bash
# 检查Dockerfile语法
docker build --no-cache -t weather-duck-web .

# 查看构建日志
docker build --progress=plain -t weather-duck-web .

# 进入容器调试
docker run -it --entrypoint /bin/sh weather-duck-web
```

#### 3. GitHub Actions失败
```bash
# 检查workflow语法
act --list

# 本地运行workflow
act push

# 检查secrets配置
gh secret list
```

### 日志查看

#### 应用日志
```bash
# Docker容器日志
docker logs weather-duck-web-preview

# Nginx访问日志
docker exec weather-duck-web-preview tail -f /var/log/nginx/access.log

# 错误日志
docker exec weather-duck-web-preview tail -f /var/log/nginx/error.log
```

#### 部署日志
```bash
# GitHub Actions日志
gh run list
gh run view <run-id>

# Vercel部署日志
vercel logs --follow
```

## 安全配置

### 1. 内容安全策略 (CSP)
```javascript
// vercel.json 中的CSP配置
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://devapi.qweather.com https://geoapi.qweather.com;"
```

### 2. HTTPS强制
```nginx
# Nginx配置
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

### 3. 安全头配置
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 监控和告警

### 1. 健康检查
- **端点**: `/health`
- **间隔**: 30秒
- **超时**: 10秒
- **重试**: 3次

### 2. 性能监控
- **Lighthouse CI**: 自动性能测试
- **Web Vitals**: 核心性能指标
- **错误追踪**: Sentry集成

### 3. 告警通知
- **Slack**: 部署状态通知
- **Discord**: 错误告警
- **Telegram**: 关键事件通知

## 成本优化

### 1. 免费额度利用
- **Vercel**: 100GB带宽/月
- **GitHub Actions**: 2000分钟/月
- **Docker Hub**: 1个私有仓库

### 2. 资源优化
- **镜像大小**: 使用Alpine Linux
- **构建缓存**: 利用GitHub Actions缓存
- **CDN**: 静态资源缓存优化

## 📚 相关文档

- <mcfile name="GITHUB_SECRETS_SETUP.md" path="e:\trae\WeatherDuck\GITHUB_SECRETS_SETUP.md"></mcfile> - GitHub Secrets 详细配置指南
- <mcfile name="PLATFORM_DEPLOYMENT_GUIDE.md" path="e:\trae\WeatherDuck\PLATFORM_DEPLOYMENT_GUIDE.md"></mcfile> - 多平台部署方案对比
- <mcfile name=".env.example" path="e:\trae\WeatherDuck\.env.example"></mcfile> - 环境变量配置示例
- <mcfile name="vercel.json" path="e:\trae\WeatherDuck\vercel.json"></mcfile> - Vercel 部署配置
- <mcfile name="deploy-staging.yml" path="e:\trae\WeatherDuck\.github\workflows\deploy-staging.yml"></mcfile> - GitHub Actions 工作流

## 🎯 部署检查清单

部署前请确认：

- [ ] GitHub Secrets 已正确配置
- [ ] 环境变量已设置
- [ ] 和风天气API密钥有效
- [ ] 本地构建测试通过
- [ ] 代码已推送到正确分支

部署后请验证：

- [ ] GitHub Actions 工作流成功运行
- [ ] Vercel 部署状态正常
- [ ] 预览环境可正常访问
- [ ] API调用功能正常
- [ ] PWA功能正常工作

## 📞 技术支持

如果在部署过程中遇到问题：

1. 检查 GitHub Actions 日志
2. 查看 Vercel 部署日志  
3. 确认环境变量配置
4. 参考故障排除指南
5. 在项目 Issues 中提问

---

**注意**: 请确保所有敏感信息都通过 GitHub Secrets 配置，不要在代码中硬编码 API 密钥等敏感数据。

## 🎉 部署完成

恭喜！您已成功配置了天气鸭项目的预览环境持续部署流程。现在每次推送代码到 `main` 分支时，都会自动触发构建和部署，让项目创始人可以随时查看最新的开发进展。

**预览环境访问地址**: `https://weather-duck-preview.vercel.app`

---

**最后更新**: 2024年1月
**文档版本**: v1.0.0
**维护者**: WeatherDuck Team