# 天气鸭 (WeatherDuck) 🦆

> 现代化的桌面天气应用，采用 Electron + React + TypeScript 技术栈

## 项目简介

天气鸭是一款现代化的桌面天气应用，旨在为用户提供直观、美观且功能丰富的天气信息展示体验。应用集成了布谷鸟报时功能，支持多城市天气查询，并提供精美的天气动画效果。

### 核心特性

- 🌤️ **实时天气信息** - 基于和风天气API的准确天气数据
- 🕐 **布谷鸟报时** - 整点报时功能，可自定义音效和时间范围
- 🏙️ **多城市支持** - 支持全国城市搜索和地理定位
- 🎨 **现代化UI** - Material Design风格，支持浅色/深色主题
- ✨ **丰富动画** - 天气状况匹配的动画效果
- 🖥️ **跨平台** - 支持 Windows、macOS、Linux

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

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 或者分别启动渲染进程和主进程
npm run dev:renderer  # 启动 Vite 开发服务器
npm run dev:main      # 启动 Electron 主进程
```

### 构建和打包

```bash
# 构建应用
npm run build

# 打包 Electron 应用
npm run electron:build

# 生成安装包
npm run electron:package
```

## 开发指南

### 项目结构

```
WeatherDuck/
├── src/                    # 源代码目录
│   ├── main/              # Electron 主进程
│   ├── renderer/          # React 渲染进程
│   ├── shared/            # 共享代码
│   └── assets/            # 静态资源
├── dist/                  # 构建输出
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