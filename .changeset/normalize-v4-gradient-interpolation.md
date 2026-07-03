---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 小程序与 generator 产物中 `--tw-gradient-position` 仍保留 `in oklab` 等现代插值语法的问题，统一降级为小程序/WebView 兼容的渐变方向值。
