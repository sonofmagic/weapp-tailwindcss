---
"weapp-tailwindcss": patch
---

优化 Vite watch 模式下 Tailwind v4 热更新性能：缓存 source candidates 扫描结果，优先按 `@source`/CSS 入口缩小扫描范围，并复用 Tailwind v4 generator 的增量结果，避免 demo 热更新时反复全量扫描源码和重复生成 CSS。
