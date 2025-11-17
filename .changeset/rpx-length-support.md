---
"@weapp-tailwindcss/runtime": patch
"@weapp-tailwindcss/merge": patch
"@weapp-tailwindcss/merge-v3": patch
"@weapp-tailwindcss/variants": patch
---

提取并统一 rpx 任意值的长度处理逻辑，修复 `text|border|bg|outline|ring-[…rpx]` 被当作颜色合并的问题，并补充对应的运行时与快照单测。
