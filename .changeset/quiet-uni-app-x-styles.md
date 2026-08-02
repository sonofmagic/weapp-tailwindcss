---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 uni-app x 组件局部样式绑定被误识别为 Tailwind 类名、Native 端局部 `@apply` 未展开，以及 Web 端样式预处理与连续 HMR 候选更新不完整的问题。
