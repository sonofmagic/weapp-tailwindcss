---
"weapp-tailwindcss": patch
---

支持 Vite、Webpack 和 Gulp 场景下自动识别 Tailwind CSS v4 入口 CSS，未显式传入 `cssEntries` 时会捕获包含 Tailwind 根指令的样式内容，并通过 `tailwindcss-patch@9.3.3` 的 `cssSources` 刷新运行时 patcher；显式配置 `cssEntries` 或 `cssSources` 时仍保持用户配置优先。
