---
"weapp-tailwindcss": patch
---

改进 mpx 默认的 `mainCssChunkMatcher`，凡是落在 `styles/` 目录下的 CSS/WXSS 产物都会被视为主样式包。这样像 `dist/wx/styles/app364cd4a4.wxss` 这种带 hash 的入口也能自动注入 Tailwind v4 变量与预设，不必再额外配置 matcher。
