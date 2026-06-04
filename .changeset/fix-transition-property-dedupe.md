---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复小程序 CSS 前缀清理后 `transition-property` 声明重复的问题，避免 Tailwind CSS v3 的 `.transition` 输出保留多条等价声明。
