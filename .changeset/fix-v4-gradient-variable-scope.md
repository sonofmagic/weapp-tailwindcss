---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 生成模式下渐变运行时变量只落在主题作用域的问题，将 `--tw-gradient-*` 默认值补到小程序元素与伪元素作用域，避免 `bg-gradient-* from-* to-*` 在组件节点中失效；伪元素选择器使用小程序工具链更稳定的 `:before` / `:after` 输出。
