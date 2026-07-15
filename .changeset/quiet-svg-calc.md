---
"weapp-tailwindcss": patch
---

默认关闭 `cssCalc` 预计算，避免 SVG 等大体积 CSS 自定义属性在 Autoprefixer 处理后重复展开；需要预计算兼容能力时可显式开启。同时清理 Vue scoped 样式中 `@apply` 生成的等价未作用域规则，避免组件样式重复输出。
