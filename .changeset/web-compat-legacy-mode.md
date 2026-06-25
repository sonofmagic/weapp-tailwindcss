---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

新增 Web 端 Tailwind CSS v4 产物兼容降级配置，可通过 `generator.webCompat` 移除或降级 `@theme`、`@layer`、`@property`、现代颜色函数与相关 `@supports`，以适配更多 Android/iOS WebView 场景。
