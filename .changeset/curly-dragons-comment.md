---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

兼容组件库 CSS 中常见的 `//` 行注释，避免样式解析失败；同时保留字符串、块注释和 URL 内容不变。修正 `uni-app x` 全局 `uvue` 样式入口被错误当作组件作者样式的问题，继续过滤原生编译器不支持的全局选择器。
