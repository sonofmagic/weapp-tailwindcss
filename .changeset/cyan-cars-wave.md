---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 `uni-app x / uvue` 下 `@tailwind base` 的伪元素选择器兼容问题：

- 在 `uni-app x` 模式下移除 `::before`、`::after`、`:before`、`:after`、`::backdrop` 等 `uvue` 不支持的选择器，避免 `App.uvue` 保留 `@tailwind base` 时编译报错
- 保留 `*` 上的 Tailwind CSS 变量初始化与有效基础规则，确保基础 reset 与 utility 依赖的 CSS 变量不回退
- 补充 `uni-app x + @tailwind base + styleIsolationVersion=2` 的 regression test，并验证 issue #822 相关组件局部样式能力不回退
