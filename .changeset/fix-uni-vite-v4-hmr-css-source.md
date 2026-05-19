---
"weapp-tailwindcss": patch
---

优化 uni-app Vite + Tailwind CSS v4 热更新性能：主包占位 CSS 现在会根据已注册 CSS source 的 Tailwind source entries 与当前候选命中选择单个源，避免候选变化时把多个自动发现的 CSS source 合并生成到主包样式；同时跳过 Vue SFC 子请求对源码候选集合的覆盖，保留原始 `.vue` 文件中的完整 class 候选。
