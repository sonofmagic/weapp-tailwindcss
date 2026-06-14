---
"weapp-tailwindcss": patch
---

修复 Vite、Webpack 与 Gulp watch/HMR 场景下样式增量生成和构建适配层缓存持续增长的问题，限制 Tailwind 增量缓存、Vite 样式缓存、Webpack 处理缓存与 Gulp 流式处理缓存规模，并为 watch-HMR 回归工具补充 RSS/heap 内存监控和预算守卫。
