---
"weapp-tailwindcss": patch
---

修复 uni-app Vite 小程序 dev 产物中 Sass/Less 预处理器入口里的自定义 `@layer components` 被漏提取的问题，确保 `@apply` 生成的 `.raw-btn`、`.btn` 以及伪元素样式会写入 `dist/dev/mp-weixin/app.wxss`，且不会残留小程序不支持的 `@layer`/`@apply`。
