---
"weapp-tailwindcss": patch
---

优化 Tailwind CSS v3 生成器在 Vite 热更新中的增量 CSS 生成路径。现在 v3 生成器在热更新场景会复用同一 source/style/target 下已生成的 CSS，只为新增候选类生成 utilities 片段，减少重复执行完整 Tailwind v3 PostCSS 生成的次数。
