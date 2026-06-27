---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 Web 兼容模式下 Tailwind CSS v4 的 `@property` 初始值与现代颜色降级处理，确保开启 `webCompat` 后仍保留现代浏览器的最终展示效果，同时为旧 WebView 提供可用 fallback。
