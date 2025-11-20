---
"weapp-tailwindcss": patch
---

修复 Vite 插件未在 CSS transform 阶段改写 `@import 'tailwindcss'` 的问题，确保入口样式会被重写到 `weapp-tailwindcss` 并移除无效的 preflight 产物。
