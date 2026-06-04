---
"weapp-tailwindcss": minor
---

优化 `css-macro` 的样式生成方式：宏变体现在不再输出伪 `@media (weapp-tw-platform:...)` 包裹，而是生成内部条件节点，并由内置转换直接产出小程序条件编译注释。

旧的 `@media (weapp-tw-platform:...)` 宏输出仍会被 `weapp-tailwindcss/css-macro/postcss` 兼容处理，方便存量自定义 PostCSS 流程平滑迁移。
