---
'weapp-tailwindcss': patch
'@weapp-tailwindcss/postcss': patch
'@weapp-tailwindcss/postcss-calc': patch
---

修复 Tailwind CSS v4 跨 CSS 资产构建时 `cssCalc` 无法预计算配置的 CSS 自定义属性的问题，并支持变量 fallback、链式引用与循环引用保护。

- 统一数组、正则、对象和布尔形式的 `cssCalc` 外部变量映射透传，支持顶层和 `cssOptions` 配置入口。
- 未启用 calc 变量解析时，完整 Tailwind v4 生成路径不再额外解析整份 CSS 收集变量，减少构建内存开销。
