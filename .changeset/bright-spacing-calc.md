---
'weapp-tailwindcss': patch
'@weapp-tailwindcss/postcss': patch
'@weapp-tailwindcss/postcss-calc': patch
---

修复 Tailwind CSS v4 跨 CSS 资产构建时 `cssCalc` 无法预计算配置的 CSS 自定义属性的问题，并支持变量 fallback、链式引用与循环引用保护。
