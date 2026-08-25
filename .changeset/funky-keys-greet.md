---
"weapp-tailwindcss": patch
---

优化 Generic Vite Web 非 watch 生产构建，跳过未被消费的 source candidate 扫描与模块级跟踪，同时保留开发、watch、跨框架及 CSS 来源追踪链路；升级 weapp-vite 6.22 后迁移独立分包样式构建并保留单次生成回归。
