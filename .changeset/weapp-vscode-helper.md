---
"weapp-tailwindcss": minor
"@weapp-tailwindcss/website": patch
---

- 新增 `rewriteCssImports`（默认开启），在 webpack/vite 处理 CSS 导入时把 `@import 'tailwindcss'` 透明映射到 `weapp-tailwindcss`（JS/TS 不受影响），也允许按需关闭。
- 提供 `vscode-entry` CLI 生成 VS Code 专用的根 CSS 文件，并在官网文档中补充完整说明。
