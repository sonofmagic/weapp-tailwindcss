---
"weapp-tailwindcss": patch
---

修复 Vite 构建中已由 CSS 管线处理过的 Tailwind CSS v3 分包样式被再次按全局候选重新生成，导致普通分包和独立分包样式互相串入的问题。
