---
"@weapp-tailwindcss/postcss": patch
---

修复 tailwindcss v3 `border-blue-600/10` 这类 rgb 斜杠透明度语法仍输出为 `rgb()`，导致安卓无法解析的问题，强制降级为传统 `rgba()`。
