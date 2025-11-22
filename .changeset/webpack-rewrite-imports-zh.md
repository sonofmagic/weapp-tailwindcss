---
'weapp-tailwindcss': patch
---

修复 webpack demos 在开启 `rewriteCssImports` 时未能把 `@import "tailwindcss"` 重写为 `weapp-tailwindcss` 的问题，确保运行时 loader 会在 PostCSS 之前插入并重写 CSS 导入。
