---
"weapp-tailwindcss": patch
---

优化 Vite 小程序构建中的 source-candidates 扫描、批量 HMR 同步和增量 bundle 入口规划，减少重复候选提取与 clean entry 全图处理。

Related to #1127
