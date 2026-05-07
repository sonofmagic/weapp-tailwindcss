---
"weapp-tailwindcss": patch
---

修复 v5 默认生成模式在 Tailwind CSS v3 + uni-app Vite 小程序/quickapp 构建中遗漏 `@tailwind`/`@apply` 展开导致产物残留原始 Tailwind 指令的问题。现在 `@apply` 会作为生成入口参与 Tailwind v3 样式生成，并且生成后的兼容 CSS 追加不会把未展开的 `@apply` 规则重新写回产物。
