---
"weapp-tailwindcss": patch
---

优化 Vite 生成模式在 uni-app watch 场景下的 Tailwind CSS 增量热更新性能，复用底层生成器的新增 CSS 片段并避免重复处理整份历史样式。
