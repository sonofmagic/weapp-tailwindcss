---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 H5 与 App WebView 兼容模式错误静态化 Tailwind 运行时 CSS 变量的问题，避免 shadow、ring、gradient、mask 等颜色组合工具类互相串色。
