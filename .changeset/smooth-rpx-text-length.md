---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 下 `text-[32.4rpx]` 等 rpx 长度任意值在 web 和小程序目标中泄漏内部 `length:` 类型提示的问题，保持最终选择器和类名使用原始写法。
