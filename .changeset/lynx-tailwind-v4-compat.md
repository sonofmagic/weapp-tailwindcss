---
"@weapp-tailwindcss/lynx": minor
"weapp-tailwindcss": patch
---

修复 ReactLynx/Rspeedy 多阶段 CSS loader 覆盖 Tailwind CSS 4 入口的问题，兼容 uni-app x 组件局部样式中的前置重要修饰符，并过滤小程序扫描中会生成非法 `:has()` 选择器的 `has-in`/`has-not-in` 变体；新增基于真实 CSS、encoder 与 iOS/Android runtime 报告的完整兼容性实验室。
