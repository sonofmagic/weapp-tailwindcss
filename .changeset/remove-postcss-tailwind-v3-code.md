---
"@weapp-tailwindcss/postcss": major
"weapp-tailwindcss": patch
---

移除 `@weapp-tailwindcss/postcss` 中 Tailwind CSS v3 相关的版本探测、显式 `version` 配置、v3 fixture 与 benchmark 基线。

PostCSS 生成插件现在固定按 Tailwind CSS v4 CSS-first 流程处理。仅包含 `@apply` 的局部 CSS 会在内部注入 Tailwind v4 `@reference` 上下文并跳过自动源码扫描，不再依赖旧的 v3/v4 分支判断。
