---
"weapp-tailwindcss": patch
---

修复 Vite `cssEntries` 与 `rem2rpx` 场景下，uview-plus 等第三方库已编译样式可能因 root/scoped 去重误判而丢失实际使用声明的问题。

同时修复 uni-app Vite watch 增量构建中根小程序样式输出可能被当作源码入口解析，导致 `app.wxss` 等输出样式无法正确重放的问题。
