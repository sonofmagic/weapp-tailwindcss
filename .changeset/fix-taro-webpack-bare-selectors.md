---
"weapp-tailwindcss": patch
---

修复 Taro React Webpack + Tailwind CSS v4 构建到微信小程序时，`@layer base` 和普通 CSS 中的 `wx-button`、自定义标签等裸选择器规则在最终 `app.wxss` 中被裁剪的问题。
