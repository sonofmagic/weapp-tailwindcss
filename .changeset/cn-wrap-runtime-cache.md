---
'@weapp-tailwindcss/runtime': patch
'@weapp-tailwindcss/cn': patch
---

导出 `wrapRuntimeAggregator`，让 `@weapp-tailwindcss/cn` 复用有界 LRU 与按需 unescape/escape，避免每次调用都跑合并引擎。
