---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

收敛小程序 CSS 的 `-webkit-` 前缀输出，默认仅保留 `background-clip: text`、`mask-*`、`box-orient` 等小程序场景需要的兼容写法，并移除 `text-decoration`、`filter/backdrop-filter`、`transform/animation/transition` 等浏览器冗余前缀。
