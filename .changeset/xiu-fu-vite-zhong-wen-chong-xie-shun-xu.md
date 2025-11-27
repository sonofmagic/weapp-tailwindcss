---
'weapp-tailwindcss': patch
---

修复 Vite 重写 `@import 'tailwindcss'` 的钩子顺序，确保 uni-app v4 构建时能提前改写为 `weapp-tailwindcss`。
