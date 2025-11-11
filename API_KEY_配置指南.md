# 和风天气 API Key 配置指南

## 问题诊断结果

✅ API Key 格式正确（32字符）  
❌ 所有 API 端点返回 403 错误：**Invalid Host**

## 问题原因

你的 API Key 在和风天气控制台中**没有正确配置应用类型**。和风天气要求每个 API Key 必须指定应用类型（Web API、iOS、Android 或桌面应用），否则会拒绝所有请求。

## 解决方案（3个选项）

### 方案 1：配置现有 API Key（推荐）

1. **登录和风天气控制台**
   - 访问：https://console.qweather.com/
   - 使用你的账号登录

2. **找到你的应用**
   - 点击左侧菜单"应用管理"
   - 找到 API Key 为 `6b95a713...a3bb` 的应用

3. **编辑应用配置**
   - 点击应用右侧的"编辑"按钮
   - 在"Key 类型"中选择：**Web API**（最简单，无需配置域名）
   - 或选择：**桌面应用**（需要填写应用包名，如 `com.weatherwidget.desktop`）

4. **保存并等待生效**
   - 点击"保存"
   - 等待 1-2 分钟让配置生效

5. **重新测试**
   ```bash
   node tests/helpers/diagnose-api-issue.js
   ```

### 方案 2：申请新的 API Key

如果你无法修改现有 API Key，可以申请一个新的：

1. **登录控制台**
   - https://console.qweather.com/

2. **创建新应用**
   - 点击"创建应用"
   - 填写应用名称（如：天气桌面小工具）
   - **Key 类型选择：Web API**（重要！）
   - 选择订阅：免费订阅（每天1000次请求）

3. **获取新的 API Key**
   - 创建成功后，复制新的 API Key

4. **更新代码中的 API Key**
   - 修改 `tests/helpers/test-api-connection.js` 中的 `API_KEY`
   - 或设置环境变量：
     ```bash
     set QWEATHER_API_KEY=你的新APIKey
     ```

### 方案 3：使用免费公共 API（临时测试）

如果只是想快速测试，可以使用和风天气的公共测试 Key（有限制）：

⚠️ 注意：公共 Key 仅用于测试，不要用于生产环境

## 配置详解

### Web API 类型（推荐）

**优点：**
- 配置最简单
- 无需填写域名或包名
- 适合桌面应用和本地开发

**配置步骤：**
1. Key 类型：选择 "Web API"
2. 域名限制：留空（或填写 `*` 表示不限制）
3. 保存

### 桌面应用类型

**优点：**
- 更符合应用实际类型
- 可以设置包名限制

**配置步骤：**
1. Key 类型：选择 "桌面应用"
2. 应用包名：填写 `com.weatherwidget.desktop`
3. 保存

## 验证配置

配置完成后，运行诊断工具验证：

```bash
node tests/helpers/diagnose-api-issue.js
```

如果看到 ✅ 成功，说明配置正确！

## 常见问题

### Q1: 配置后还是 403 错误？

**A:** 等待 1-2 分钟让配置生效，然后重试。如果还是失败，检查：
- API Key 是否复制正确（没有多余空格）
- 是否选择了正确的 Key 类型
- 账号是否有足够的配额

### Q2: 城市搜索 API 返回 404？

**A:** 城市搜索使用不同的域名 `geoapi.qweather.com`，需要：
- 确保 API Key 配置正确
- 检查 URL 是否正确：`https://geoapi.qweather.com/v2/city/lookup`

### Q3: 如何查看 API 使用量？

**A:** 登录控制台后，在"数据统计"中可以查看每日请求次数和剩余配额。

## 代码已修复的问题

我已经修复了代码中的以下问题：

1. ✅ 将 `devapi.qweather.com` 改为 `api.qweather.com`（免费订阅端点）
2. ✅ 修复了城市搜索 API 的 URL（使用 `geoapi.qweather.com`）
3. ✅ 添加了详细的错误诊断工具

## 下一步

1. **立即操作**：按照方案 1 配置你的 API Key
2. **等待生效**：1-2 分钟
3. **运行测试**：`node tests/helpers/diagnose-api-issue.js`
4. **启动应用**：`npm start`

## 需要帮助？

- 和风天气开发文档：https://dev.qweather.com/
- 错误代码说明：https://dev.qweather.com/docs/resource/error-code/
- 控制台地址：https://console.qweather.com/

---

**重要提醒：** 不要在公开的代码仓库中提交 API Key！建议使用环境变量或配置文件（添加到 .gitignore）。
