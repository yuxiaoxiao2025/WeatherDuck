# 天气鸭 (WeatherDuck) 🦆

> 现代化的双目标天气应用，支持桌面版和Web版，采用 Electron + React + TypeScript 技术栈

## 项目简介

天气鸭是一款现代化的双目标天气应用，旨在为用户提供直观、美观且功能丰富的天气信息展示体验。应用集成了布谷鸟报时功能，支持多城市天气查询，并提供精美的天气动画效果。

### 双目标架构

- 🖥️ **桌面版** - 基于 Electron 的原生桌面应用
- 🌐 **Web版** - 基于 Vite 的现代化Web应用
- 🔄 **共享代码** - 组件、服务、类型定义完全共享
- 📱 **响应式设计** - 适配不同屏幕尺寸和设备

### 核心特性

- 🌤️ **实时天气信息** - 基于和风天气API的准确天气数据
- 🕐 **布谷鸟报时** - 整点报时功能，可自定义音效和时间范围
- 🏙️ **多城市支持** - 支持全国城市搜索和地理定位
- 🎨 **现代化UI** - Material Design风格，支持浅色/深色主题
- ✨ **丰富动画** - 天气状况匹配的动画效果
- 🖥️ **跨平台** - 桌面版支持 Windows、macOS、Linux
- 🌐 **Web兼容** - Web版支持现代浏览器和PWA

## 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面框架**: Electron 28+
- **样式方案**: Tailwind CSS 3.x
- **动画库**: Framer Motion
- **数据库**: SQLite 3 + better-sqlite3
- **构建工具**: Vite + electron-forge
- **代码规范**: ESLint + Prettier
- **测试框架**: Jest + Playwright

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/yourusername/WeatherDuck.git
cd WeatherDuck

# 安装依赖
npm install
```

### 双目标开发环境

#### 桌面版开发

```bash
# 启动桌面版开发环境（推荐）
npm run dev:main

# 或者分别启动
npm run dev:electron  # 启动 Electron 渲染进程
npm run start         # 启动 Electron 主进程
```

#### Web版开发

```bash
# 启动Web版开发服务器
npm run dev:web

# 预览Web版构建结果
npm run preview:web
```

#### 同时开发两个目标

```bash
# 同时启动桌面版和Web版开发环境
npm run dev
```

### 双目标构建和打包

#### Web版构建

```bash
# 构建Web版
npm run build:web

# 预览Web版
npm run preview:web
```

#### 桌面版构建

```bash
# 构建桌面版渲染进程
npm run build:electron
# 或
npm run build:renderer

# 构建主进程
npm run build:main

# 完整构建所有目标
npm run build
```

#### 桌面版打包

```bash
# 打包桌面应用
npm run package

# 生成安装包
npm run make

# 发布应用
npm run publish
```

## 开发指南

### 双目标项目结构

```
WeatherDuck/
├── src/                    # 共享源代码目录
│   ├── components/        # React 组件
│   ├── hooks/             # React Hooks
│   ├── services/          # 业务服务
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── assets/            # 静态资源
│   └── main/              # Electron 主进程代码
├── src-electron/          # Electron 渲染进程入口
│   ├── App.tsx            # Electron 版本应用组件
│   ├── index.tsx          # Electron 入口文件
│   ├── index.html         # Electron HTML 模板
│   └── main/              # 主进程文件
├── src-web/               # Web 版本入口
│   ├── App.tsx            # Web 版本应用组件
│   ├── index.tsx          # Web 入口文件
│   └── index.html         # Web HTML 模板
├── dist/                  # Electron 构建输出
│   ├── main/              # 主进程构建结果
│   └── renderer/          # 渲染进程构建结果
├── dist-web/              # Web 版构建输出
├── vite.config.ts         # 主 Vite 配置
├── vite.web.config.ts     # Web 版专用配置
├── vite.electron.config.ts # Electron 版专用配置
├── tsconfig.json          # 主 TypeScript 配置
├── tsconfig.web.json      # Web 版 TypeScript 配置
├── tsconfig.electron.json # Electron 版 TypeScript 配置
├── .github/               # GitHub Actions 配置
├── docs/                  # 项目文档
└── tests/                 # 测试文件
```

### 代码规范

项目使用 ESLint + Prettier 进行代码规范检查：

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

### 测试

```bash
# 运行单元测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 端到端测试
npm run test:e2e
```

## API 配置

### 和风天气 API

1. 注册和风天气开发者账号：https://dev.qweather.com/
2. 获取 API Key
3. 创建 `.env` 文件：

```env
QWEATHER_API_KEY=your_api_key_here
```

## 部署

### GitHub Actions CI/CD

项目配置了完整的 CI/CD 流程：

- **代码质量检查**: ESLint、Prettier、TypeScript
- **自动化测试**: 单元测试、端到端测试
- **多平台构建**: Windows、macOS、Linux
- **安全扫描**: npm audit、Snyk
- **性能测试**: Bundle 分析、性能监控

### 发布流程

1. 创建功能分支进行开发
2. 提交代码触发 CI 检查
3. 通过 Pull Request 合并到 main 分支
4. 自动构建和发布

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

- 项目主页: https://github.com/yourusername/WeatherDuck
- 问题反馈: https://github.com/yourusername/WeatherDuck/issues
- 邮箱: team@weatherduck.com

---

**天气鸭团队** ❤️ 用心打造