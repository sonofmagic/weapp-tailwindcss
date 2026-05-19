---
"weapp-tailwindcss": patch
---

修复 uni-app Vite 下 Tailwind CSS v4 子包样式生成过慢的问题：子包 `wxss` 现在会优先反查对应源码侧 CSS 入口，并在命中 `source(none)` 等独立入口时隔离主包运行时候选，避免静态 icon 插件等大候选集被重复合并到子包生成流程。
