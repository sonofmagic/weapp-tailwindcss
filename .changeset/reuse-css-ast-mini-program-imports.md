---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

将小程序样式中不支持的非本地 `@import` 清理逻辑下沉到 PostCSS Root 级工具，并在 Vite HMR 注入路径复用同一次 CSS AST 解析来完成 import 清理和依赖收集，减少重复 parse。
