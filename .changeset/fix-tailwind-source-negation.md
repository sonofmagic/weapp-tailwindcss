---
"weapp-tailwindcss": patch
---

修复生成模式的额外源码候选扫描绕过 Tailwind 扫描排除规则的问题，确保 Tailwind CSS v3 `content` 中的 `!` 排除以及 Tailwind CSS v4 `@source not` 不会被 Vite/PostCSS 补扫重新引入。

新增 e2e-watch HMR 速度报告产物，CI 每次 watch 回归都会输出 hot update 的 avg/p50/p95/max、按项目和按场景拆分的耗时摘要，并随 artifact 上传。

补齐 Tailwind CSS v4 `@source inline(...)` 与 `@source not inline(...)` 在 Vite/PostCSS 生成模式下的候选收集支持，覆盖 brace expansion、换行参数、`source(none)`/全量排除以及内联排除文件候选等场景。
