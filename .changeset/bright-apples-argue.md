---
"weapp-tailwindcss": patch
---

修复生成产物时误删或漏提取用户自定义的 `@layer components { ... }` 块，导致相关样式没有写入 `app.wxss` 的问题。覆盖纯 CSS 与 Sass/Less fallback 源码中的自定义 layer。
