---
"weapp-tailwindcss": patch
---

修复 Vite HMR 场景下样式增量生成和缓存回放导致的内存持续增长问题，限制 Tailwind 增量缓存与 Vite 样式缓存规模，并为 watch-HMR 回归工具补充 RSS/heap 内存监控和预算守卫。
