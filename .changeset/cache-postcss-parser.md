---
'@weapp-tailwindcss/postcss': patch
---

通过缓存选择器解析器实例并复用兜底清理流程，优化 PostCSS 管线的运行性能。
