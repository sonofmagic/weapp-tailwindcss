---
"weapp-tailwindcss": patch
---

修复 Vite 生成模式下 Tailwind CSS v4 分包样式入口在支付宝、京东、抖音等非微信小程序端可能被当作已处理 CSS 跳过，导致分包样式产物为空或缺少 `@config` / `@source` 生成结果的问题。
