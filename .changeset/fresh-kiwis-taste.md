---
"@weapp-tailwindcss/postcss": patch
---

抽出 Tailwind v4 `@apply` only CSS 的选择器收集与生成 CSS 过滤工具，并在 PostCSS generator 插件中复用当前 Root，避免为原始 CSS 再次解析。

同时复用已序列化的入口 CSS 字符串进行自动扫描判断，减少同一轮处理中的重复 `root.toString()`。
