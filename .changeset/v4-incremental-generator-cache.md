---
"weapp-tailwindcss": patch
---

优化 Tailwind CSS v4 在 Vite watch 下的热更新性能，避免已有候选集时重复扫描源码，并复用增量 CSS 生成缓存。
