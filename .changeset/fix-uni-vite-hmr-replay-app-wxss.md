---
"weapp-tailwindcss": patch
---

修复 uni-app Vite 开发模式下入口 CSS 热更新 replay 后没有同步写入 `app.wxss` 的问题，确保连续修改 `text-[102.43rpx]` 等任意值类名时小程序主样式立即更新。
