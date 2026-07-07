---
"weapp-tailwindcss": patch
---

修复 Vite `cssEntries` 与 `rem2rpx` 场景下，uview-plus 等第三方库已编译样式可能因 root/scoped 去重误判而丢失实际使用声明的问题。
