---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复小程序最终样式中可能残留 `color-mix`、`oklab`、`oklch`、`lab`、`lch` 与 `display-p3` 颜色函数的问题，能确定的颜色会降级为 `rgb`/`rgba`，避免输出小程序不支持的颜色语法。
