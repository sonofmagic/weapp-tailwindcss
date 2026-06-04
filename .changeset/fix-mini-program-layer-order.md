---
"weapp-tailwindcss": patch
---

修复小程序生成模式下自定义 `@layer components` 在最终主 CSS 中被追加到 utilities 后面的问题。现在 Tailwind CSS v3/v4 的小程序产物会保留 `.raw-btn`、`.btn` 等用户组件层规则，并在不保留 `@layer` 包裹的前提下把它们排到 utilities 之前。
