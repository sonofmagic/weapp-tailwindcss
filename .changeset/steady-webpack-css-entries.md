---
"weapp-tailwindcss": patch
---

修复 Webpack/Taro/Mpx 的 Tailwind CSS v4 `cssEntries` 输出归属判断，避免页面样式误保留主入口 preflight，同时保留主入口哈希样式产物的小程序 preflight。
