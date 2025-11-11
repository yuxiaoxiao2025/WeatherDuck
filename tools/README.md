# 天气鸭项目规范检查工具

本目录包含两个专为"天气鸭"项目定制的规范检查工具，用于确保代码符合项目定义的开发规范。

## 📦 工具列表

### 1. weather-duck-lint.py - 规范检查工具

Python 脚本，用于静态检查代码是否符合项目规范，包括：
- ✅ 开发需求规范检查
- ✅ 命名约定检查
- ✅ 安全规范检查
- ✅ 错误处理规范检查
- ✅ 测试规范检查

### 2. weather-duck-report.cjs - 合规报告生成器

Node.js 脚本，用于生成项目规范遵守情况的详细报告，包括：
- 📊 代码统计（文件数、行数、类型分布）
- 📋 规范启用情况分析
- 🧪 测试覆盖率报告
- 📈 总体合规率计算

---

## 🚀 快速开始

### 前置要求

- **Python 3.7+** (用于 weather-duck-lint.py)
- **Node.js 12+** (用于 weather-duck-report.js)

### 安装

无需额外安装依赖，工具使用 Python 和 Node.js 标准库。

---

## 📖 使用指南

### 1. 运行规范检查 (weather-duck-lint.py)

#### 基础用法

```powershell
# 检查 src 目录（默认）
python tools\weather-duck-lint.py

# 检查指定目录
python tools\weather-duck-lint.py --target-dir .\src

# 只显示错误级别的问题
python tools\weather-duck-lint.py --severity ERROR

# 只显示警告级别的问题
python tools\weather-duck-lint.py --severity WARNING
```

#### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--target-dir` | 要检查的目标目录 | `../src` |
| `--severity` | 过滤严重程度 (ERROR/WARNING/INFO) | 无（显示全部） |

#### 输出示例

```
🦆 天气鸭项目规范检查工具
🔍 检查目录: e:\trae-pc\qoder-rules-main\Windows Desktop Clock Utility\src
📁 项目根目录: e:\trae-pc\qoder-rules-main\Windows Desktop Clock Utility

================================================================================
🦆 天气鸭项目规范检查报告
================================================================================

发现 3 个问题:
  ❌ 错误 (ERROR):   1
  ⚠️  警告 (WARNING): 2
  ℹ️  提示 (INFO):    0


📄 src/utils/api.ts
  ❌ L42      [规则 8] 安全配置管理
     问题: 可能硬编码了API 密钥，应使用环境变量
     建议: 使用 process.env.VARIABLE_NAME 或配置文件
     规范: security-spec.zh-CN.md

  ⚠️  L15      [规则 1] 生成完整可运行代码
     问题: 代码包含 TODO/FIXME 标记，应在提交前完成实现
     建议: 完成该部分实现或创建任务追踪
     规范: requirements-spec.zh-CN.md

================================================================================
总计: 3 个问题需要处理
================================================================================
```

---

### 2. 生成合规报告 (weather-duck-report.cjs)

#### 基础用法

```powershell
# 生成控制台报告（默认）
node tools\weather-duck-report.cjs

# 生成 JSON 报告
node tools\weather-duck-report.cjs --output .\docs\compliance-report.json

# 生成 Markdown 报告
node tools\weather-duck-report.cjs --format markdown --output .\docs\compliance-report.md

# 检查指定目录
node tools\weather-duck-report.cjs --target-dir .\src
```

#### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--target-dir` | 要检查的目标目录 | `../src` |
| `--output` | 输出报告文件路径 | 无（仅控制台输出） |
| `--format` | 输出格式 (json/markdown) | `json` |
| `--help, -h` | 显示帮助信息 | - |

#### 输出示例

```
🦆 天气鸭项目规范遵守情况报告生成器

🔍 扫描规范文件...
📊 扫描代码文件...
🧪 检查测试文件...
📈 检查测试覆盖率...

================================================================================
🦆 天气鸭项目规范遵守情况报告
================================================================================

📅 生成时间: 2024-01-15T10:30:00.000Z
📁 项目根目录: e:\trae-pc\qoder-rules-main\Windows Desktop Clock Utility
🎯 检查目录: e:\trae-pc\qoder-rules-main\Windows Desktop Clock Utility\src

📊 代码统计:
  总文件数: 12
  总行数: 1,850
  文件类型分布:
    .tsx  :   5 个文件,    920 行
    .ts   :   4 个文件,    650 行
    .css  :   2 个文件,    180 行
    .html :   1 个文件,    100 行

🧪 测试文件统计:
  总测试文件: 3
  单元测试: 3
  集成测试: 0
  E2E 测试: 0

📋 规范启用情况:

  requirements spec:
    位置: core/requirements-spec.zh-CN.md
    总规则数: 13
    已启用: 13
    已禁用: 0
    启用率: 100%
    已启用的规则:
      ✅ [规则 1] 生成完整可运行代码
      ✅ [规则 2] 复用现有代码和 API
      ✅ [规则 3] 最小化新增依赖
      ...

================================================================================
📊 总体合规率: 95%
📝 已启用规则: 57/60
📄 代码文件数: 12 (1,850 行)
================================================================================

📄 报告已保存至: .\docs\compliance-report.json
```

---

## 🔍 检查项说明

### 开发需求规范 (requirements-spec.zh-CN.md)

| 规则 | 检查内容 | 严重程度 |
|------|----------|----------|
| 规则 1 | 检查 TODO/FIXME 标记 | WARNING |
| 规则 10 | 验证导入语句正确性 | ERROR |
| 规则 13 | 检查虚构/不存在的库导入 | ERROR |

### 命名约定 (naming-conventions.zh-CN.md)

| 约定 | 检查内容 | 严重程度 |
|------|----------|----------|
| 约定 1 | Python 变量使用 snake_case | WARNING |
| 约定 4 | 常量使用 UPPER_SNAKE_CASE | INFO |
| 约定 9 | 环境变量使用 UPPER_SNAKE_CASE | WARNING |

### 安全规范 (security-spec.zh-CN.md)

| 规则 | 检查内容 | 严重程度 |
|------|----------|----------|
| 规则 1 | SQL 注入风险检测 | ERROR |
| 规则 8 | 硬编码密钥/密码检测 | ERROR |

### 错误处理规范 (error-handling-spec.zh-CN.md)

| 规则 | 检查内容 | 严重程度 |
|------|----------|----------|
| 规则 3 | 建议使用自定义错误类 | INFO |
| 规则 5 | 检测空 catch 块 | ERROR |

---

## 🔧 集成到工作流

### 1. Git Hooks 集成

在提交前自动运行检查：

```powershell
# .git/hooks/pre-commit
#!/bin/sh
python tools/weather-duck-lint.py --severity ERROR
if [ $? -ne 0 ]; then
  echo "❌ 规范检查失败，请修复错误后再提交"
  exit 1
fi
```

### 2. CI/CD 集成 (GitHub Actions)

```yaml
# .github/workflows/spec-check.yml
name: 规范检查

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: 设置 Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: 运行规范检查
        run: python tools/weather-duck-lint.py --severity ERROR
      
      - name: 设置 Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: 生成合规报告
        run: |
          node tools/weather-duck-report.cjs --output compliance-report.json
          node tools/weather-duck-report.cjs --format markdown --output compliance-report.md
      
      - name: 上传报告
        uses: actions/upload-artifact@v2
        with:
          name: compliance-reports
          path: |
            compliance-report.json
            compliance-report.md
```

### 3. npm scripts 集成

在 `package.json` 中添加：

```json
{
  "scripts": {
    "lint:spec": "python tools/weather-duck-lint.py",
    "lint:spec:errors": "python tools/weather-duck-lint.py --severity ERROR",
    "report:compliance": "node tools/weather-duck-report.cjs --output ./docs/compliance-report.json",
    "report:compliance:md": "node tools/weather-duck-report.cjs --format markdown --output ./docs/compliance-report.md"
  }
}
```

---

## 📊 报告格式

### JSON 报告结构

```json
{
  "project": "天气鸭 - Weather Duck",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalRules": 60,
    "enabledRules": 57,
    "disabledRules": 3,
    "complianceRate": 95,
    "codeFiles": 12,
    "totalLines": 1850
  },
  "specs": {
    "requirements-spec.zh-CN.md": {
      "location": "core/requirements-spec.zh-CN.md",
      "totalRules": 13,
      "enabledRules": 13,
      "rules": [...]
    }
  },
  "codeStats": {...},
  "testCoverage": {...}
}
```

---

## 🤝 贡献

如需扩展检查规则或改进工具，请：

1. 在 `weather-duck-lint.py` 中添加新的检查方法
2. 在对应的规范文件（如 `core/requirements-spec.zh-CN.md`）中定义规则
3. 更新本文档的检查项说明

---

## 📝 许可证

与主项目保持一致。

---

**最后更新**: 2024-01-15
