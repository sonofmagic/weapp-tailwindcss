---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 入口 CSS 中 `@layer base` 和普通 CSS 的 `wx-button`、自定义标签等裸选择器规则在 Webpack/Vite 小程序构建产物中被裁剪的问题，并补充 Taro、uni-app、MPX、weapp-vite 回归覆盖。
