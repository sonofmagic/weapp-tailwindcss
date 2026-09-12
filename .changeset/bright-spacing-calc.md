---
'weapp-tailwindcss': patch
---

修复 Tailwind CSS v4 跨 CSS 资产构建时 `cssCalc` 未默认保留 `--spacing` 导致间距表达式无法预计算的问题。
