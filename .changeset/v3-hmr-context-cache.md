---
"weapp-tailwindcss": patch
---

优化 Tailwind CSS v3 开发热更新性能，增量生成时复用 Tailwind v3 runtime context，并缓存稳定 CSS 源的 legacy compat 转换结果，避免新增 class 时重复重建 v3 上下文和重复转换兼容 CSS。
