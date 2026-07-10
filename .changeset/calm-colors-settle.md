---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 现代颜色配合动态透明度变量时的 RGB 通道转换，避免 OKLCH 等颜色被错误地直接当作 RGB 通道输出。
