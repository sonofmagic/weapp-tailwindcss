---
"weapp-tailwindcss": patch
---

修复 Webpack web target 下 Tailwind CSS v4 入口 CSS 会被 css-loader 提前展开为 `@media source(none)`，导致文档站生产构建丢失大量样式的问题。
