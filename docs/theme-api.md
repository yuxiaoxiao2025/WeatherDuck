# 主题切换组件 API

## 组件
- `ThemeToggle`: 支持 `light`/`dark`/`system` 三种模式

## Props
- `initial?: 'light' | 'dark' | 'system'` 默认 `system`

## 行为
- 根据选择设置 `document.documentElement.classList` 的 `dark`
- 持久化到 `localStorage.theme`

## 最佳实践
- 初始阶段在 HTML head 中加入一次性同步脚本以避免 FOUC

