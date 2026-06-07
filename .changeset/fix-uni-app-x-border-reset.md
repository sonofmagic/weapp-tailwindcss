---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 uni-app x Tailwind CSS v4 场景下 `uvue.wxss` 默认 `border-width: medium` 覆盖 Tailwind preflight 后导致的异常黑边问题。
