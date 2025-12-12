---
'@weapp-tailwindcss/postcss': patch
---

修复 tailwindcss v2/v3/v4 中任意 rpx 值被误判为颜色的问题，确保 text/border/bg/outline/ring 输出正确的尺寸样式。
