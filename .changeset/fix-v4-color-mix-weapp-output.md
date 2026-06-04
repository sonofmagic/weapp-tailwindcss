---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind CSS v4 小程序产物中透明度颜色可能保留 `color-mix(in oklab, ...)` 的问题，将 `text-white/10`、`bg-sky-500/75`、`bg-sky-500/(--alpha)` 等颜色透明度写法转换为小程序可用的 `rgba(...)` 输出；同时修复 v4 增量热更新追加样式时重复注入 preflight reset 的问题。
