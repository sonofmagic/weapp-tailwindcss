---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3 generator 模式下 `@layer` 自定义组件和工具类仅在 CSS `@apply` 中引用时被裁剪的问题，并补齐 v3 指令与函数的回归覆盖。
