---
"weapp-tailwindcss": patch
---

优化 Tailwind CSS v4 在 Vite 构建中的 CSS source 匹配模型：普通主 CSS 输出也会优先通过 source candidates 精确匹配单个 cssSource，无法判定时不再对多个 cssSources 执行全量生成，减少 uni-app 等多 CSS source 项目的热更新耗时。
