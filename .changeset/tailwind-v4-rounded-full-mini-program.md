---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 的 `rounded-full` 在小程序端生成 `calc(infinity * 1px)` 后无法稳定生效的问题，统一归一化为小程序可解析的 `9999px`。
