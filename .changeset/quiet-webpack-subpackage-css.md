---
"weapp-tailwindcss": patch
---

修复 Taro webpack5/Vite + Tailwind v4 多 `cssEntries` 场景下，`mainCssChunkMatcher` 宽匹配导致页面或独立分包样式错误复用主样式入口的问题。
