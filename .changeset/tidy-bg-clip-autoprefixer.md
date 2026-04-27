---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

在 Tailwind CSS v4 场景下默认启用内置 autoprefixer 后处理，为小程序 CSS 补齐 `-webkit-background-clip: text` 等 WebView 兼容前缀，并新增 `autoprefixer: false` 配置用于显式关闭。
