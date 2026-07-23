---
"weapp-tailwindcss": patch
---

确保 Vite 增量构建复用缓存样式时，最终小程序 CSS 产物仍会递归移除空的条件规则。
