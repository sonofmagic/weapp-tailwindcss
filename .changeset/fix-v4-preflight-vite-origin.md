"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind CSS v4 小程序样式输出：普通小程序端保留 `box-sizing`、`margin`、`padding`、`border` preflight reset，避免 Taro Vite 的 `app-origin` 样式重复注入主样式，并去重合并后的 hoisted preflight 声明。
