---
"weapp-tailwindcss": patch
---

修复 uni-app Vite 小程序构建中动态模板类名转译不完整的问题，确保 `wxml` 以及其它小程序模板目标在完整 `runtimeSet` 重试后可以继续转译 `h-[458rpx]`、`w-[218rpx]`、`inset-x-[30%]` 等任意值类名，并避免 Tailwind CSS v3 `@apply` 使用 `min-w-0` 等工具类时误报 unknown utility。
