---
"@weapp-tailwindcss/runtime": minor
"@weapp-tailwindcss/cva": minor
"@weapp-tailwindcss/variants": minor
"@weapp-tailwindcss/merge": minor
"@weapp-tailwindcss/merge-v3": minor
---

重构 `@weapp-tailwindcss/merge` 体系：把核心运行时代码提取到 `@weapp-tailwindcss/runtime`，并将 cva、variants、v3 runtime 拆分成独立包，同时将 `weappTwIgnore`/`clsx` 等公共能力统一由 runtime 对外导出，避免子包之间重复依赖。
