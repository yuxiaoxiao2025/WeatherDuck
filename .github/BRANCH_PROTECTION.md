# GitHub 分支保护规则配置指南

## 概述

本文档说明如何为 WeatherDuck 项目配置 GitHub 分支保护规则，确保代码质量和团队协作流程。

## 主分支保护规则 (main)

### 基本设置

1. **访问仓库设置**
   - 进入 GitHub 仓库
   - 点击 `Settings` → `Branches`
   - 点击 `Add rule` 或编辑现有规则

2. **分支名称模式**
   ```
   main
   ```

### 保护规则配置

#### ✅ 必须启用的规则

- **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (如果有 CODEOWNERS 文件)

- **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **必需的状态检查:**
    - `lint` - 代码规范检查
    - `format-check` - 代码格式检查
    - `type-check` - TypeScript 类型检查
    - `test (18.x)` - Node.js 18.x 单元测试
    - `test (20.x)` - Node.js 20.x 单元测试
    - `build-web` - Web 版本构建
    - `build-electron` - 桌面版构建
    - `e2e-test` - 端到端测试
    - `security-scan` - 安全扫描

- **Require conversation resolution before merging**
  - ✅ 启用 - 确保所有 PR 评论都已解决

- **Require signed commits**
  - ⚠️ 可选 - 根据团队安全要求决定

- **Require linear history**
  - ✅ 启用 - 保持清晰的提交历史

- **Include administrators**
  - ✅ 启用 - 管理员也需要遵循规则

#### ❌ 不建议启用的规则

- **Require deployments to succeed before merging**
  - ❌ 暂不启用 - 部署流程独立于合并流程

### 示例配置截图位置

```
Settings → Branches → Branch protection rules → main
```

## 开发分支保护规则 (develop)

### 基本设置

1. **分支名称模式**
   ```
   develop
   ```

### 保护规则配置

#### ✅ 必须启用的规则

- **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale PR approvals when new commits are pushed

- **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **必需的状态检查:**
    - `lint`
    - `format-check`
    - `type-check`
    - `test (18.x)`
    - `test (20.x)`
    - `build-web`
    - `build-electron`

- **Include administrators**
  - ✅ 启用

## 功能分支命名规范

### 分支命名模式

```
feature/*
bugfix/*
hotfix/*
release/*
```

### 保护规则

- 功能分支通常不需要特殊保护规则
- 但建议在 CI 中对所有分支运行基本检查

## CODEOWNERS 文件配置

创建 `.github/CODEOWNERS` 文件来指定代码审查者：

```
# 全局代码所有者
* @team-lead @senior-dev

# 前端代码
/src/web/ @frontend-team
/src/shared/components/ @frontend-team

# 桌面端代码
/src/main/ @desktop-team
/src/shared/electron/ @desktop-team

# CI/CD 配置
/.github/ @devops-team
/scripts/ @devops-team

# 文档
/docs/ @tech-writer
*.md @tech-writer

# 配置文件
package.json @team-lead
tsconfig.json @team-lead
vite.config.ts @team-lead
```

## 自动化设置脚本

可以使用 GitHub CLI 自动设置分支保护规则：

```bash
# 安装 GitHub CLI
# https://cli.github.com/

# 设置 main 分支保护
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","format-check","type-check","test (18.x)","test (20.x)","build-web","build-electron","e2e-test","security-scan"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## 验证配置

### 检查清单

- [ ] main 分支已配置保护规则
- [ ] develop 分支已配置保护规则
- [ ] 所有必需的状态检查已添加
- [ ] PR 模板已创建
- [ ] CODEOWNERS 文件已配置（可选）
- [ ] 团队成员了解新的工作流程

### 测试流程

1. 创建测试分支
2. 提交代码变更
3. 创建 PR 到 develop 分支
4. 验证所有状态检查是否运行
5. 验证合并限制是否生效

## 故障排除

### 常见问题

1. **状态检查失败**
   - 检查 CI 工作流配置
   - 确认分支名称匹配

2. **无法合并 PR**
   - 确认所有必需检查已通过
   - 检查分支是否为最新

3. **管理员绕过规则**
   - 确认 "Include administrators" 已启用

### 联系支持

如有问题，请联系 DevOps 团队或在项目 Issues 中创建支持请求。

---

**最后更新**: 2024年12月
**维护者**: DevOps 团队