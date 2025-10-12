# 云平台部署指南

本文档提供了天气鸭项目在不同云平台上的部署方案和配置示例。

## 🌟 推荐平台对比

| 平台 | 免费额度 | 优势 | 适用场景 | 推荐指数 |
|------|----------|------|----------|----------|
| **Vercel** | 100GB带宽/月 | 零配置、CDN、自动HTTPS | 静态站点、JAMstack | ⭐⭐⭐⭐⭐ |
| **Netlify** | 100GB带宽/月 | 表单处理、函数计算 | 静态站点、无服务器 | ⭐⭐⭐⭐ |
| **GitHub Pages** | 1GB存储 | 与GitHub集成 | 开源项目展示 | ⭐⭐⭐ |
| **Railway** | $5免费额度 | 支持数据库、后端服务 | 全栈应用 | ⭐⭐⭐⭐ |
| **Fly.io** | 3个应用免费 | 全球部署、Docker支持 | 容器化应用 | ⭐⭐⭐⭐ |

## 🚀 Vercel 部署（推荐）

### 特点
- ✅ 零配置部署
- ✅ 全球CDN加速
- ✅ 自动HTTPS证书
- ✅ 预览部署
- ✅ 环境变量管理

### 配置文件
项目已包含 `vercel.json` 配置文件，支持：
- 静态资源优化
- 路由重写
- 安全头设置
- PWA支持

### 部署步骤
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署触发

### 访问地址
- 生产环境: `https://weather-duck-preview.vercel.app`
- 预览环境: `https://weather-duck-preview-{branch}.vercel.app`

## 🌐 Netlify 部署

### 配置文件
创建 `netlify.toml`:

```toml
[build]
  publish = "dist-web"
  command = "npm run build:web-preview"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_APP_ENV = "production"
  VITE_ENABLE_PWA = "true"

[context.deploy-preview.environment]
  VITE_APP_ENV = "staging"
  VITE_DEBUG_PANEL = "true"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### GitHub Actions 配置
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for production
        run: npm run build:web-preview
        env:
          VITE_QWEATHER_API_KEY: ${{ secrets.VITE_QWEATHER_API_KEY }}
          VITE_APP_ENV: staging
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist-web'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📄 GitHub Pages 部署

### 配置文件
创建 `.github/workflows/deploy-github-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build:web-preview
        env:
          VITE_QWEATHER_API_KEY: ${{ secrets.VITE_QWEATHER_API_KEY }}
          VITE_PUBLIC_PATH: '/WeatherDuck/'
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist-web'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 🚂 Railway 部署

### 配置文件
创建 `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run preview:web"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
VITE_APP_ENV = "production"
VITE_ENABLE_PWA = "true"
```

### Dockerfile（可选）
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:web-preview

FROM nginx:alpine
COPY --from=builder /app/dist-web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置
创建 `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # 处理SPA路由
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 静态资源缓存
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Service Worker
        location /sw.js {
            expires 0;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # 安全头
        add_header X-Frame-Options "DENY";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }
}
```

## ✈️ Fly.io 部署

### 配置文件
创建 `fly.toml`:

```toml
app = "weather-duck-preview"
primary_region = "nrt"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  VITE_APP_ENV = "production"

[[services]]
  http_checks = []
  internal_port = 80
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

### 部署命令
```bash
# 安装 Fly CLI
curl -L https://fly.io/install.sh | sh

# 登录
fly auth login

# 初始化应用
fly launch

# 设置环境变量
fly secrets set VITE_QWEATHER_API_KEY=your_api_key_here

# 部署
fly deploy
```

## 🔧 通用优化建议

### 1. 构建优化
```json
{
  "scripts": {
    "build:optimized": "vite build --mode production && npm run optimize:assets"
  }
}
```

### 2. 缓存策略
- 静态资源：1年缓存
- HTML文件：无缓存
- Service Worker：无缓存

### 3. 性能监控
```javascript
// 添加到应用中
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// 性能监控
window.addEventListener('load', () => {
  if ('performance' in window) {
    console.log('页面加载时间:', performance.now());
  }
});
```

### 4. 错误监控
推荐集成 Sentry 进行错误监控：

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
});
```

## 📊 部署后验证清单

- [ ] 应用正常加载
- [ ] API调用成功
- [ ] PWA功能正常
- [ ] 响应式设计正确
- [ ] 性能指标良好
- [ ] 错误监控正常
- [ ] HTTPS证书有效
- [ ] CDN缓存生效

---

选择最适合你需求的平台，按照对应的配置进行部署。推荐优先使用 Vercel，它提供了最佳的开发体验和性能。