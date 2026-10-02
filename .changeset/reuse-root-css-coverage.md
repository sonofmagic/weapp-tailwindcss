---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

在同一轮 Vite 产物清理中复用未变化的根样式覆盖索引，减少多个页面和组件重复解析根 CSS 的开销；根样式变更时重新计算，并保留独立分包隔离。
