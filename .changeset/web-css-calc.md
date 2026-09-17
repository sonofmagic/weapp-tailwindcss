---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复 Tailwind CSS v4 在 web/H5 生成路径中 `cssCalc` 无法预计算配置的 CSS 自定义属性的问题。

- 抽出仅计算 `calc()` / `var()` 的 `applyConfiguredCssCalc`，web 目标不再走会改写选择器的完整小程序 style handler。
- 完整生成、增量生成和 web 用户 CSS（含 `@apply`）都会消费生成器收集的变量映射；未匹配变量与循环引用仍保留运行时表达式。
- 补齐 Vite Web/H5 最终 CSS 资产中的普通样式计算，避免独立导入的 CSS 绕过 `cssCalc`；跨资产仅使用唯一生成上下文，多个主题入口不按遍历顺序猜测变量值。Refs #1194。
