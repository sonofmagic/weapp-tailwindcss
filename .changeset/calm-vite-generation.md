---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

统一 Vite、Webpack 与 Gulp 构建态的 Tailwind CSS 生成时机，在生成阶段展开必要的嵌套规则、编译平台条件并清理 `@layer`、Web preflight 与 specificity 占位选择器，同时保留工具类和本地 `@import` 交给框架原有的 PostCSS 流程；最终适配继续注入小程序 preflight，并清理等价的 calc fallback 声明，避免产物重复输出同一份样式，同时保留 Vite dev HMR 的增量样式。修复 scoped `@reference` + `@apply` 泄漏独立工具类，以及 Webpack 在拼接裸选择器用户样式时重复输出根变量和 preflight 的问题。
