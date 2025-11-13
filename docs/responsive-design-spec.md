# 响应式设计规范

## 栅格系统
- 使用 Tailwind `grid` 与断点：`sm`/`md`/`lg`/`xl`
- 示例：`grid grid-cols-2 md:grid-cols-3`

## 容器
- 原型尺寸 `w-[375px] h-[812px]`
- 在 `md` 及以上：`md:w-[420px] md:h-auto`

## 间距规则
- 优先使用令牌：`p-token-md`（等价 `var(--SPACING_MD)`）

