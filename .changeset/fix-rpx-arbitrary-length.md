---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind CSS v3/v4 在部分生成链路中把 `text-[55rpx]` 等任意值误判为颜色时，非主 CSS chunk 没有恢复为长度声明的问题。
