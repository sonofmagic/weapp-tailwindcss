---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

现在 Tailwind CSS v3 和 v4 场景都会默认开启内置 `autoprefixer` 后处理，用于补齐小程序 WebView 所需的兼容前缀；如需关闭可继续传入 `autoprefixer: false`。
