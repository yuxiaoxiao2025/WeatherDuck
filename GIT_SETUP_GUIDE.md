# Git 仓库初始化和 GitHub 集成指南

## 🚀 快速开始

### 1. 本地 Git 仓库初始化

```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加所有文件到暂存区
git add .

# 3. 创建初始提交
git commit -m "feat: 初始化 WeatherDuck 项目

- 配置 Electron + React + TypeScript 架构
- 集成 Vitest 测试框架
- 配置 ESLint + Prettier 代码规范
- 设置 GitHub Actions CI/CD 流水线
- 支持 Web 版和桌面版双目标构建"

# 4. 设置默认分支为 main
git branch -M main
```

### 2. GitHub 远程仓库关联

#### 方法一：使用 GitHub CLI (推荐)
```bash
# 1. 安装 GitHub CLI (如果未安装)
# Windows: winget install GitHub.cli
# 或访问: https://cli.github.com/

# 2. 登录 GitHub
gh auth login

# 3. 创建远程仓库并推送
gh repo create WeatherDuck --public --source=. --remote=origin --push

# 4. 设置分支保护规则 (可选)
gh api repos/:owner/WeatherDuck/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","format-check","type-check","test","build-web","build-electron"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

#### 方法二：手动创建仓库
```bash
# 1. 在 GitHub 网站创建新仓库 "WeatherDuck"
# 访问: https://github.com/new

# 2. 添加远程仓库地址
git remote add origin https://github.com/YOUR_USERNAME/WeatherDuck.git

# 3. 推送到远程仓库
git push -u origin main
```

### 3. 开发分支策略设置

```bash
# 1. 创建开发分支
git checkout -b develop
git push -u origin develop

# 2. 创建功能分支示例
git checkout -b feature/weather-api
git checkout -b feature/ui-components
git checkout -b fix/electron-build

# 3. 推送功能分支
git push -u origin feature/weather-api
```

## 📋 分支保护规则配置

### GitHub 网页端配置步骤

1. **访问仓库设置**
   - 进入 GitHub 仓库页面
   - 点击 `Settings` 选项卡
   - 选择左侧 `Branches` 菜单

2. **配置 main 分支保护**
   ```
   Branch name pattern: main
   
   ✅ Restrict pushes that create files larger than 100 MB
   ✅ Require a pull request before merging
       ✅ Require approvals (1)
       ✅ Dismiss stale PR approvals when new commits are pushed
       ✅ Require review from code owners
   ✅ Require status checks to pass before merging
       ✅ Require branches to be up to date before merging
       Required status checks:
       - lint
       - format-check  
       - type-check
       - test (18.x)
       - test (20.x)
       - build-web
       - build-electron
   ✅ Require conversation resolution before merging
   ✅ Require linear history
   ✅ Include administrators
   ```

3. **配置 develop 分支保护**
   ```
   Branch name pattern: develop
   
   ✅ Require a pull request before merging
       ✅ Require approvals (1)
   ✅ Require status checks to pass before merging
       Required status checks:
       - lint
       - format-check
       - type-check
       - test (18.x)
       - test (20.x)
   ```

## 🔄 标准工作流程

### 功能开发流程
```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. 开发和提交
git add .
git commit -m "feat: 添加新功能"

# 3. 推送并创建 PR
git push -u origin feature/new-feature
gh pr create --base develop --title "feat: 添加新功能" --body "功能描述..."

# 4. 合并后清理
git checkout develop
git pull origin develop
git branch -d feature/new-feature
```

### 发布流程
```bash
# 1. 从 develop 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. 更新版本号和发布准备
npm version patch  # 或 minor, major
git add .
git commit -m "chore: 准备 v1.0.0 发布"

# 3. 合并到 main
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git push origin main --tags

# 4. 合并回 develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# 5. 清理发布分支
git branch -d release/v1.0.0
```

## 🛠️ 有用的 Git 命令

### 日常开发
```bash
# 查看状态
git status

# 查看提交历史
git log --oneline --graph

# 暂存部分更改
git add -p

# 修改最后一次提交
git commit --amend

# 查看分支
git branch -a

# 同步远程分支
git fetch --prune
```

### 代码质量检查
```bash
# 运行所有检查 (推送前)
npm run lint
npm run format:check
npm run type-check
npm run test:ci

# 自动修复格式问题
npm run format

# 构建验证
npm run build:web
npm run build:electron
```

## 🔧 CI/CD 触发条件

### 自动触发场景
- ✅ 推送到任何分支 (除 main)
- ✅ 创建 Pull Request
- ✅ 更新 Pull Request
- ✅ 手动触发 (workflow_dispatch)

### 检查项目
- **代码规范**: ESLint, Prettier
- **类型检查**: TypeScript
- **单元测试**: Vitest (Node.js 18.x, 20.x)
- **构建验证**: Web 版 + 桌面版
- **端到端测试**: Playwright (可选)
- **安全扫描**: npm audit
- **性能测试**: 基准测试 (可选)

## 📚 相关文档

- [GitHub Actions 工作流](.github/workflows/ci.yml)
- [PR 模板](.github/pull_request_template.md)
- [分支保护详细指南](.github/BRANCH_PROTECTION.md)
- [CI/CD 配置总结](.github/CI_CD_SETUP_SUMMARY.md)

## 🆘 常见问题

### Q: CI 检查失败怎么办？
```bash
# 本地运行相同检查
npm run lint        # ESLint 检查
npm run format:check # 格式检查
npm run type-check   # 类型检查
npm run test:ci      # 测试运行

# 修复后重新推送
git add .
git commit -m "fix: 修复 CI 检查问题"
git push
```

### Q: 如何跳过 CI 检查？
```bash
# 仅在紧急情况下使用
git commit -m "hotfix: 紧急修复 [skip ci]"
```

### Q: 如何更新分支保护规则？
- 使用 GitHub CLI: `gh api repos/:owner/:repo/branches/main/protection`
- 或访问 GitHub 网页端仓库设置

---

**配置完成**: ✅ Git 仓库和 CI/CD 流水线已就绪  
**下一步**: 推送代码到 GitHub，开始协作开发！