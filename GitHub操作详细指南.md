# GitHub 操作详细指南 - 零基础版

## 第一步：在GitHub上创建仓库

### 1.1 登录GitHub
1. 打开浏览器，访问 https://github.com
2. 点击右上角的 "Sign in" 登录您的账号

### 1.2 创建新仓库
1. 登录后，点击右上角的 **"+"** 号
2. 在下拉菜单中选择 **"New repository"**
3. 填写仓库信息：
   - **Repository name**: `WeatherDuck`
   - **Description**: `一个基于Electron的桌面天气应用，具有布谷鸟报时功能`
   - 选择 **"Public"**（公开仓库，免费）
   - ⚠️ **重要：不要勾选** "Add a README file"
   - ⚠️ **重要：不要勾选** "Add .gitignore"
   - ⚠️ **重要：不要勾选** "Choose a license"
4. 点击绿色的 **"Create repository"** 按钮

### 1.3 获取仓库地址
创建完成后，GitHub会显示一个页面，找到这样的地址：
```
https://github.com/您的用户名/WeatherDuck.git
```
**请复制这个地址，稍后会用到！**

## 第二步：在本地关联远程仓库

现在回到您的项目文件夹，我们需要执行几个命令。

### 2.1 打开PowerShell
1. 确保您在项目目录：`E:\trae\WeatherDuck`
2. 在Trae AI中，我们已经有一个终端窗口

### 2.2 添加远程仓库
请告诉我您的GitHub用户名，我会为您生成具体的命令。

**命令格式：**
```bash
git remote add origin https://github.com/您的用户名/WeatherDuck.git
```

### 2.3 设置主分支
```bash
git branch -M main
```

### 2.4 推送代码到GitHub
```bash
git push -u origin main
```

## 第三步：验证是否成功

### 3.1 检查远程仓库
```bash
git remote -v
```
应该显示：
```
origin  https://github.com/您的用户名/WeatherDuck.git (fetch)
origin  https://github.com/您的用户名/WeatherDuck.git (push)
```

### 3.2 查看GitHub页面
回到GitHub网页，刷新您的WeatherDuck仓库页面，应该能看到所有项目文件。

## 常见问题解决

### 问题1：推送时要求输入用户名和密码
**解决方案：**
1. 用户名：输入您的GitHub用户名
2. 密码：需要使用Personal Access Token（不是登录密码）

**如何创建Personal Access Token：**
1. 在GitHub上，点击右上角头像 → Settings
2. 左侧菜单最下方点击 "Developer settings"
3. 点击 "Personal access tokens" → "Tokens (classic)"
4. 点击 "Generate new token" → "Generate new token (classic)"
5. 填写：
   - Note: `WeatherDuck Project`
   - Expiration: 选择一个过期时间
   - 勾选 "repo" 权限
6. 点击 "Generate token"
7. **重要：复制生成的token，这就是您的"密码"**

### 问题2：推送被拒绝
如果看到类似 "rejected" 的错误，执行：
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

## 下一步操作

完成GitHub关联后，您就可以：
1. 在本地修改代码
2. 使用 `git add .` 添加修改
3. 使用 `git commit -m "描述修改内容"` 提交
4. 使用 `git push` 推送到GitHub

---

**请告诉我您的GitHub用户名，我会为您生成具体的命令并指导您执行！**