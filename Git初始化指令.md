# Git 初始化指令

## 本地Git仓库初始化（已完成）

以下命令已经在项目中执行完成：

```bash
# 1. 初始化Git仓库
git init

# 2. 配置用户信息
git config user.name "WeatherDuck Developer"
git config user.email "developer@weatherduck.com"

# 3. 添加所有文件到暂存区
git add .

# 4. 进行首次提交
git commit -m "Initial commit: WeatherDuck project setup with Electron + React + TypeScript"
```

## 关联GitHub远程仓库

要将本地仓库关联到GitHub，请按以下步骤操作：

### 1. 在GitHub上创建新仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 仓库名称：`WeatherDuck`
4. 描述：`一个基于Electron的桌面天气应用，具有布谷鸟报时功能`
5. 选择 "Public" 或 "Private"
6. **不要**勾选 "Initialize this repository with a README"（因为我们已经有了本地仓库）
7. 点击 "Create repository"

### 2. 关联远程仓库

在项目根目录执行以下命令（将 `YOUR_USERNAME` 替换为你的GitHub用户名）：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/WeatherDuck.git

# 设置默认分支为main
git branch -M main

# 推送到远程仓库
git push -u origin main
```

### 3. 验证关联

```bash
# 查看远程仓库信息
git remote -v

# 查看分支状态
git status
```

## 后续开发工作流

### 创建功能分支

```bash
# 创建并切换到新分支
git checkout -b feature/weather-display

# 或者使用新的git switch命令
git switch -c feature/weather-display
```

### 提交代码

```bash
# 添加修改的文件
git add .

# 提交更改
git commit -m "feat: 添加天气显示组件"

# 推送到远程分支
git push origin feature/weather-display
```

### 合并到主分支

```bash
# 切换到main分支
git checkout main

# 拉取最新代码
git pull origin main

# 合并功能分支
git merge feature/weather-display

# 推送到远程
git push origin main

# 删除已合并的功能分支
git branch -d feature/weather-display
git push origin --delete feature/weather-display
```

## CI/CD 工作流

项目已配置GitHub Actions CI工作流（`.github/workflows/ci.yml`），当代码推送到任何非`main`分支时会自动：

1. 检出代码
2. 设置Node.js环境
3. 安装依赖
4. 运行代码检查和格式化
5. 执行单元测试

## 注意事项

1. `.env` 文件已被添加到 `.gitignore`，不会被提交到仓库
2. 敏感信息（如API密钥）请使用GitHub Secrets配置
3. 建议使用功能分支进行开发，避免直接在main分支上工作
4. 每次提交前确保代码通过本地测试

## 项目状态

✅ Git仓库已初始化  
✅ 首次提交已完成  
✅ CI工作流已配置  
⏳ 等待关联GitHub远程仓库