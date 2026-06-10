---
"weapp-tailwindcss": patch
---

修复 uni-app Vite 开发模式下 Tailwind CSS v4 热更新后主样式没有同步注入 `app.wxss` 的问题，避免 `text-[338rpx]` 等新增任意值类名在小程序端不生效。
