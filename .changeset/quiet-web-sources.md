---
"weapp-tailwindcss": patch
---

修复 Vite Web generator 默认扫描第三方依赖模块导致候选类污染和构建性能下降的问题，并让 `tailwindcss.v4.sources` 同时约束初始扫描与增量更新。
