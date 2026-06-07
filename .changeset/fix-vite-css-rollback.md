---
"weapp-tailwindcss": patch
---

修复 Vite 开发构建中 CSS 源码回滚后，旧的 Vite CSS bundle asset 覆盖最新 transform 结果，导致样式没有恢复到最新内容的问题。
