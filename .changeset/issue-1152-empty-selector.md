---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

清理小程序最终样式中的空选择器规则，避免无效的 `:is(...)` 语法进入 WXSS 产物。Refs #1152
