# 设计令牌规范 v1.0

## 命名
- 使用 UPPER_SNAKE_CASE：如 `SPACING_MD`、`RADIUS_LG`、`SHADOW_CARD`
- CSS 变量以同名定义：如 `--SPACING_MD`、`--RADIUS_LG`

## 使用范围
- 间距（padding/margin）
- 圆角（border-radius）
- 阴影（box-shadow）
- 动画时长与缓动（在逻辑中使用令牌值）

## 引用方式
- Tailwind 任意值或自定义 utilities：如 `rounded-[var(--RADIUS_LG)]` 或 `rounded-token-lg`
- 组件类名附加 token utilities 保证一致性

