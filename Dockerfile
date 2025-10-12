# 多阶段构建 Dockerfile for 天气鸭 Web 预览版

# 第一阶段：构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV VITE_APP_TITLE="天气鸭 Web 预览版"
ENV VITE_APP_VERSION="1.0.0"

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（仅生产依赖）
RUN npm ci --only=production --silent

# 安装构建依赖
RUN npm install --save-dev vite @vitejs/plugin-react typescript

# 复制源代码
COPY . .

# 构建 Web 预览版
RUN npm run build:web-preview

# 第二阶段：运行阶段
FROM nginx:alpine AS production

# 安装必要的工具
RUN apk add --no-cache curl

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制自定义 nginx 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist-web /usr/share/nginx/html

# 复制静态资源
COPY --from=builder /app/public /usr/share/nginx/html

# 创建必要的目录并设置权限
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 切换到非 root 用户
USER nginx

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

# 元数据标签
LABEL maintainer="WeatherDuck Team"
LABEL version="1.0.0"
LABEL description="天气鸭 Web 预览版 Docker 镜像"
LABEL org.opencontainers.image.title="WeatherDuck Web Preview"
LABEL org.opencontainers.image.description="Modern desktop weather application web preview"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="WeatherDuck Team"