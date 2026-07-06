---
"weapp-tailwindcss": patch
---

修复 Vite 开发模式下 source candidate 追加式 HMR 在多个 CSS module 同时更新时，新增样式可能被非主样式模块提前消费的问题，并让 watch 回归用例避开对 uni-app H5 supplemental CSS 注入时序的误判。
