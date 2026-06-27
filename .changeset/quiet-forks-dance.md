---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

将本地 CSS `@import` 的分析、拆分、清理和输出路径重写逻辑下沉到 `@weapp-tailwindcss/postcss`，并新增可复用的 PostCSS Root 级 API。

`weapp-tailwindcss` 的 Tailwind v4 生成 CSS 管线现在会复用同一次 CSS AST 解析结果处理本地 import wrapper、纯 import shell 和 import 拆分，减少重复 `postcss.parse(css)` 开销。
