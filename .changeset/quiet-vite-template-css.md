---
"weapp-tailwindcss": patch
---

修复 uni-app Vite 产物阶段可能把 Vue 模板源码当作样式交给 PostCSS 解析的问题，避免动态 `:style` 模板触发 `Unknown word` 报错。
