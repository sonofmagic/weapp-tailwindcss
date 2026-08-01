---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/hbuilderx-runner": patch
---

修复 uni-app x Native scoped 作者样式被通用 CSS 生成管线提前改写的问题，并统一 Windows 下 Vite 模块身份与 HMR 候选刷新顺序，确保新增、删除和回滚类名时会重新编译对应 `.uvue` 本地样式；同时细分 Harmony 构建失败、保留 HBuilderX 日志中的首个关键错误，并让 Harmony 回归基于与 HBuilderX Alpha 对齐的编译器及最终 JavaScript 产物验收样式。
