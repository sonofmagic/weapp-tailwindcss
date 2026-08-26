---
'weapp-tailwindcss': patch
---

修复 uni-app x Web 局部样式中的重要修饰符导致 CSS 编译失败的问题，确保 `!mt-6` 与 `mt-6!` 能生成 Tailwind CSS v4 支持的形式。
