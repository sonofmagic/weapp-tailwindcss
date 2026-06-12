---
"@weapp-tailwindcss/postcss": patch
---

修复生成 CSS 裁剪时误删用户手写的小程序原生元素样式的问题，避免 Taro Webpack Tailwind CSS v4 等场景下 `view`、`text`、`button`、`input` 等标签规则被移除。
