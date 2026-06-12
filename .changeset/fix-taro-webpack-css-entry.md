---
"weapp-tailwindcss": patch
---

修复 Taro Webpack 开发态下 Tailwind CSS v4 入口样式的所有权判断：当 `src/app.css` 已经由 webpack loader 生成过样式时，`app.wxss` 不再重复走 Tailwind 生成链路，避免 `cssEntries` 场景中同一个工具类被输出两次。
