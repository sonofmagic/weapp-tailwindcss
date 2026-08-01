---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 H5 与 App WebView 兼容模式错误静态化元素作用域 CSS 变量的问题，避免多个 `shadow-*` 颜色工具类互相串色。
