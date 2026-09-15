---
'@weapp-tailwindcss/runtime': patch
'@weapp-tailwindcss/cn': patch
---

导出 `wrapRuntimeAggregator`，让 `@weapp-tailwindcss/cn` 复用有界 LRU 与按需 unescape/escape，并接入与 merge 相同的 rpx 长度归一化，使 `text-red` 与 `text-[80rpx]` 等颜色 + 长度类可以共存。
