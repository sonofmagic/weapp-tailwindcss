---
"weapp-tailwindcss": patch
---

修复生成产物时误删用户自定义的 `@layer components { ... }` 块，导致相关样式没有写入 `app.wxss` 的问题。
