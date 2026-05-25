---
"@weapp-tailwindcss/postcss": patch
---

调整内置 `autoprefixer` 默认选项，显式关闭小程序不需要的 `grid` 与 `@supports` 前缀分支，保留 `remove: true` 清理过时前缀，并继续允许用户传入 `autoprefixer` 选项覆盖默认值。
