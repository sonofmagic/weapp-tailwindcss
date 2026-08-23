---
"weapp-tailwindcss": patch
---

优化 Generic Vite Web 非 watch 生产构建，跳过未被消费的 source candidate 扫描与模块级跟踪，同时保留开发、watch、跨框架及 CSS 来源追踪链路。
