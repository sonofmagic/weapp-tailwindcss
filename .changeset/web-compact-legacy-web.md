---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

将 `legacy-web` Web 兼容预设明确收敛到 Chrome 91 / AppleWebKit 537.36 基线，并补充现代 `rgb()` / `hsl()` 空格斜杠颜色语法降级，确保 `webCompat` 与 uni-app App WebView safe selector 产物保持可用。
