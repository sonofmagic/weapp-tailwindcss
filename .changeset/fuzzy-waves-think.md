---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 uni-app-vite 小程序端在 Tailwind CSS v4 场景下对 `@layer base` 的误判警告，提前清理 mini-program CSS 中的 cascade layer 语法，并补充对应回归测试。
