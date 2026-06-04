---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3 在 uni-app H5/web 目标下的 generator 模式。Vite dev 阶段现在会识别 Sass `@use "tailwindcss/*"` 入口并提前生成 web CSS，同时保留 v4 web 跳过二次生成的行为；生产构建中 v3 web CSS 也会继续由 generator 输出，避免裸 `@apply` 或小程序转义样式进入 H5 产物。
