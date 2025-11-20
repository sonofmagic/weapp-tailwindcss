---
"weapp-tailwindcss": patch
---

提炼 Vite/webpack 共享的 `rewriteCssImports` 能力，只在 tailwindcss v4 且未关闭时生效：Vite 在 CSS transform 阶段重写 `@import 'tailwindcss'`，Webpack 则在模块解析阶段统一指向 `weapp-tailwindcss`，避免小程序产物残留 PC 预设或类型告警。
