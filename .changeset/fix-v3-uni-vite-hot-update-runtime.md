---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3 在 uni-app vite build-mode dev 首次增量热更新时全量扫描输出 JS/WXML，导致候选集被 vendor 普通字符串放大、热更新极慢的问题，并将 `bgObj` 对象 key 热更新场景纳入 watch-HMR e2e 回归。
